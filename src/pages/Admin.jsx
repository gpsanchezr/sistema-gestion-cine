import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalTiquetes, setTotalTiquetes] = useState(0);
  const [tiquetes, setTiquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Obtener todos los tiquetes
      const { data: tiquetesData, error } = await supabase
        .from('tiquetes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTiquetes(tiquetesData || []);

      // Calcular total de ventas
      const total = tiquetesData?.reduce((sum, tiquete) => sum + (tiquete.pago_total || 0), 0) || 0;
      setTotalVentas(total);
      setTotalTiquetes(tiquetesData?.length || 0);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'var(--dark-bg)', 
        color: 'white', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        Cargando panel administrativo...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: 'var(--dark-bg)', 
      color: 'white', 
      minHeight: '100vh', 
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--netflix-red)', textDecoration: 'none', fontWeight: 'bold' }}>⬅ Volver al Inicio</Link>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--netflix-red)' }}>Panel Administrativo</h1>

      {/* Estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ 
          background: 'var(--glass)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '15px', 
          padding: '20px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h3>Total de Ventas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--netflix-red)' }}>
            ${totalVentas.toLocaleString()}
          </p>
        </div>

        <div style={{ 
          background: 'var(--glass)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '15px', 
          padding: '20px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h3>Total de Tiquetes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--netflix-red)' }}>
            {totalTiquetes}
          </p>
        </div>
      </div>

      {/* Lista de tiquetes */}
      <div style={{ 
        background: 'var(--glass)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px', 
        padding: '20px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Historial de Tiquetes</h3>
        {tiquetes.length === 0 ? (
          <p>No hay tiquetes vendidos aún.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tiquetes.map((tiquete) => (
              <div key={tiquete.id} style={{ 
                background: 'var(--card-bg)', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p><strong>Código:</strong> {tiquete.codigo_unico}</p>
                  <p><strong>Película ID:</strong> {tiquete.pelicula_id}</p>
                  <p><strong>Asientos:</strong> {tiquete.asientos_seleccionados}</p>
                  <p><strong>Estado:</strong> 
                    <span style={{ 
                      color: tiquete.estado === 'valido' ? '#10b981' : 
                             tiquete.estado === 'usado' ? '#ef4444' : '#f59e0b'
                    }}>
                      {tiquete.estado}
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Total:</strong> ${tiquete.pago_total?.toLocaleString()}</p>
                  <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {new Date(tiquete.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}