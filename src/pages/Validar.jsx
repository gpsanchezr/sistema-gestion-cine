import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Validar() {
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);

  const validarTiquete = async () => {
    if (!codigo.trim()) {
      setMensaje('Por favor ingresa un código.');
      return;
    }

    setLoading(true);
    setMensaje('');
    setTicketInfo(null);

    try {
      // Llamar a la Edge Function de Supabase para validar el ticket
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: {
          ticketCode: codigo.trim(),
          action: 'validate'
        }
      });

      if (error) {
        console.error('Error en Edge Function:', error);
        setMensaje('❌ Error al validar el ticket. Inténtalo de nuevo.');
        return;
      }

      // Procesar la respuesta de la Edge Function
      if (data.success) {
        setMensaje(`✅ ${data.message}`);
        setTicketInfo(data.ticketInfo);
      } else {
        setMensaje(`❌ ${data.message}`);
      }

    } catch (error) {
      console.error('Error al validar:', error);
      setMensaje('❌ Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoUsado = async () => {
    if (!codigo.trim()) return;

    setLoading(true);
    setMensaje('');

    try {
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: {
          ticketCode: codigo.trim(),
          action: 'mark-used'
        }
      });

      if (error) {
        setMensaje('❌ Error al marcar como usado.');
        return;
      }

      if (data.success) {
        setMensaje(`✅ ${data.message}`);
        setTicketInfo(prev => prev ? { ...prev, estado: 'usado' } : null);
      } else {
        setMensaje(`❌ ${data.message}`);
      }

    } catch (error) {
      setMensaje('❌ Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'var(--dark-bg)', 
      color: 'white', 
      minHeight: '100vh', 
      fontFamily: 'Poppins, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'left', marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
        <Link to="/" style={{ color: 'var(--netflix-red)', textDecoration: 'none', fontWeight: 'bold' }}>⬅ Volver al Inicio</Link>
      </div>

      <div style={{ 
        background: 'var(--glass)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px', 
        padding: '30px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--netflix-red)' }}>Validar Tiquete</h2>
        
        <input
          type="text"
          placeholder="Ingresa el código del tiquete"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--card-bg)',
            color: 'white',
            fontSize: '16px',
            marginBottom: '20px',
            outline: 'none'
          }}
        />
        
        <button 
          onClick={validarTiquete}
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '12px', 
            background: loading ? '#555' : 'var(--netflix-red)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Validando...' : 'Validar Tiquete'}
        </button>
        
        {mensaje && (
          <p style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: mensaje.includes('✅') ? '#10b981' : '#ef4444'
          }}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}