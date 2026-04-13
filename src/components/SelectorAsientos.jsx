import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Armchair, Play, TicketCheck, CheckCircle2 } from 'lucide-react';
import './SelectorAsientos.css';

const SelectorAsientos = ({ funcionId, onSeatsSelect, onPurchaseComplete, user }) => {
  const [asientos, setAsientos] = useState([]);
  const [selectedAsientos, setSelectedAsientos] = useState([]);
  const [ocupados, setOcupados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [total, setTotal] = useState(0);
  const PRECIO_GENERAL = 15000;
  const PRECIO_VIP = 22000; // Assume rows G-J VIP

  // Generate 10x15 grid: A-J rows, 1-15 cols
  const generarGrid = useCallback(() => {
    const filas = 'ABCDEFGHIJ';
    const grid = [];
    for (let f = 0; f < 10; f++) {
      for (let c = 1; c <= 15; c++) {
        const nombre = filas[f] + c;
        grid.push({
          id: nombre,
          nombre,
          fila: filas[f],
          col: c,
          vip: f >= 6, // G-J VIP
          precio: f >= 6 ? PRECIO_VIP : PRECIO_GENERAL
        });
      }
    }
    return grid;
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const grid = generarGrid();
      setAsientos(grid);

      if (funcionId) {
        // Query detalle_tiquete by funcion_id
        const { data, error } = await supabase
          .from('detalle_tiquete')
          .select('asiento_id')
          .eq('funcion_id', funcionId);

        if (!error && data) {
          const ocupadosSet = new Set(data.map(d => d.asiento_id));
          setOcupados(ocupadosSet);
        }
      }
      setLoading(false);
    };
    init();
  }, [funcionId, generarGrid]);

  const toggleAsiento = (asiento) => {
    if (ocupados.has(asiento.nombre)) return;
    setSelectedAsientos(prev => {
      const newSel = prev.filter(s => s.nombre !== asiento.nombre);
      if (newSel.length === prev.length) {
        newSel.push(asiento);
      }
      const newTotal = newSel.reduce((sum, a) => sum + a.precio, 0);
      setTotal(newTotal);
      onSeatsSelect?.(newSel);
      return newSel;
    });
  };

  const finalizarCompra = async () => {
    if (!user || selectedAsientos.length === 0) return;
    setPurchasing(true);

    try {
      const codigo = `CH-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      setQrCode(codigo);

      // Transaction simulation (Supabase no native tx, use RPC or sequential w/ UNIQUE)
      const { data: tiquete, error: tError } = await supabase
        .from('tiquetes')
        .insert({
          usuario_id: user.id,
          funcion_id: funcionId,
          total,
          codigo
        })
        .select()
        .single();

      if (tError) throw tError;

      // detalle_tiquete per seat (UNIQUE catches double-book)
      const detalles = selectedAsientos.map(a => ({
        tiquete_id: tiquete.id,
        funcion_id: funcionId,
        asiento_id: a.nombre,
        precio_unitario: a.precio
      }));

      const { error: dError } = await supabase
        .from('detalle_tiquete')
        .insert(detalles);

      if (dError) throw dError;

      onPurchaseComplete?.({ tiquete, qr: codigo, total });
    } catch (error) {
      console.error('Compra failed:', error);
      alert(`Error: ${error.message.includes('duplicate') ? 'Asiento ocupado' : error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  const SkeletonGrid = () => (
    <div className="asientos-grid">
      {Array(150).fill().map((_, i) => (
        <div key={i} className="asiento skeleton" style={{width: 40, height: 40}} />
      ))}
    </div>
  );

  return (
    <div className="sala-container glass tornasol">
      <header className="sala-header neon-text">
<Armchair className="icon" />
      </header>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="pantalla neon-text">PANTALLA GIGANTE</div>
          <div className="asientos-grid">
            {asientos.map(asiento => (
              <button
                key={asiento.id}
                className={`asiento 
                  ${asiento.vip ? 'vip' : ''} 
                  ${ocupados.has(asiento.nombre) ? 'ocupado' : ''} 
                  ${selectedAsientos.find(s => s.nombre === asiento.nombre) ? 'seleccionado' : ''}
                `}
                onClick={() => toggleAsiento(asiento)}
                disabled={ocupados.has(asiento.nombre)}
                title={asiento.nombre}
              >
                {asiento.col}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="leyenda">
        <span className="asiento libre" /> Libre <span className="asiento seleccionado" /> Sel <span className="asiento ocupado" /> Ocup <span className="asiento vip" /> VIP
      </div>

      {selectedAsientos.length > 0 && (
        <div className="checkout glass tornasol">
          <button 
            onClick={finalizarCompra} 
            disabled={purchasing || !user}
            className="btn-comprar neon-text"
          >
<TicketCheck />
            FINALIZAR ${total.toLocaleString()}
          </button>
{qrCode && <QRCodeSVG value={qrCode} size={128} className="qr-neon" />}
        </div>
      )}
    </div>
  );
};

export default SelectorAsientos;

