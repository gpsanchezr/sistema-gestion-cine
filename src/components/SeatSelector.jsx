import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './SeatSelector.css';

export default function SeatSelector({ funcion, pelicula, onComplete }) {
  const { user } = useAuth();
  const [asientos, setAsientos] = useState([]);
  const [ocupados, setOcupados] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSeats();
  }, [funcion.id]);

  const loadSeats = async () => {
    try {
      const [asientosRes, ocupadosRes] = await Promise.all([
        supabase
          .from('asientos')
          .select('*')
          .eq('estado', 'activo')
          .order('numero'),
        supabase
          .from('asientos_ocupados')
          .select('asiento_id')
          .eq('funcion_id', funcion.id)
      ]);

      if (asientosRes.error) throw asientosRes.error;
      if (ocupadosRes.error) throw ocupadosRes.error;

      setAsientos(asientosRes.data || []);
      setOcupados(new Set((ocupadosRes.data || []).map(o => o.asiento_id)));
    } catch (error) {
      console.error('Error loading seats:', error);
      setError('Error al cargar los asientos');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (asiento) => {
    if (ocupados.has(asiento.id)) return;

    const newSelected = new Set(selected);
    if (newSelected.has(asiento.id)) {
      newSelected.delete(asiento.id);
    } else {
      newSelected.add(asiento.id);
    }
    setSelected(newSelected);
  };

  const handlePurchase = async () => {
    if (selected.size === 0) {
      setError('Selecciona al menos un asiento');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comprar-tiquete`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funcion_id: funcion.id,
          asientos_ids: Array.from(selected),
          precio_unitario: funcion.precio
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar la compra');
      }

      onComplete();
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setError(error.message || 'Error al procesar la compra. Por favor intenta nuevamente.');
      setPurchasing(false);
    }
  };

  const total = selected.size * funcion.precio;

  const groupedSeats = asientos.reduce((acc, seat) => {
    if (!acc[seat.fila]) {
      acc[seat.fila] = [];
    }
    acc[seat.fila].push(seat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <section className="seat-selector">
      <h2>Selecciona tus asientos</h2>

      <div className="screen-container">
        <div className="screen">PANTALLA</div>
      </div>

      <div className="seats-container">
        {Object.entries(groupedSeats).map(([fila, seats]) => (
          <div key={fila} className="seat-row">
            <div className="row-label">{fila}</div>
            <div className="seats">
              {seats.map((seat) => {
                const isOcupado = ocupados.has(seat.id);
                const isSelected = selected.has(seat.id);

                return (
                  <button
                    key={seat.id}
                    onClick={() => toggleSeat(seat)}
                    disabled={isOcupado}
                    className={`seat ${isOcupado ? 'ocupado' : ''} ${isSelected ? 'selected' : ''}`}
                    title={`Fila ${seat.fila} - Asiento ${seat.columna}`}
                  >
                    {seat.columna}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat available"></div>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <div className="seat selected"></div>
          <span>Seleccionado</span>
        </div>
        <div className="legend-item">
          <div className="seat ocupado"></div>
          <span>Ocupado</span>
        </div>
      </div>

      <div className="purchase-summary card">
        <div className="summary-content">
          <div className="summary-item">
            <span>Asientos seleccionados:</span>
            <strong>{selected.size}</strong>
          </div>
          <div className="summary-item">
            <span>Precio por asiento:</span>
            <strong>${funcion.precio.toLocaleString()}</strong>
          </div>
          <div className="summary-total">
            <span>Total a pagar:</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handlePurchase}
          disabled={selected.size === 0 || purchasing}
          className="btn btn-primary btn-full"
        >
          {purchasing ? 'Procesando...' : 'Comprar Tiquetes'}
        </button>
      </div>
    </section>
  );
}
