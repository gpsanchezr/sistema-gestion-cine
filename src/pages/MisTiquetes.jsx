import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function MisTiquetes() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }
    cargarTickets();
  }, [user]);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      setError('');

      // Query tiquetes by perfil_id (matches perfiles table)
      const { data, error } = await supabase
        .from('tiquetes')
        .select('*, peliculas(titulo)')
        .eq('perfil_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (err) {
      console.error('Error cargando tiquetes:', err);
      // Fallback to reservas
      const { data: reservasData } = await supabase
        .from('reservas')
        .select('*, peliculas(titulo)')
        .eq('perfil_id', user.id)
        .order('created_at', { ascending: false });
      
      setTickets(reservasData || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card" style={{ padding: '30px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h1>Mis tiquetes</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Aquí verás los tiquetes comprados con tu cuenta y su estado.
        </p>

        {loading ? (
          <div className="loading" style={{ marginTop: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p>No tienes tiquetes aún.</p>
            <Link to="/" className="btn btn-primary">
              Ver cartelera
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '30px' }}>
            <div className="grid grid-2" style={{ gap: '20px' }}>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                    <div>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Código</p>
                      <strong>{ticket.codigo_unico || ticket.codigo}</strong>
                    </div>
                    <span style={{ color: ticket.estado === 'valido' ? '#10b981' : ticket.estado === 'usado' ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                      {ticket.estado}
                    </span>
                  </div>
                  <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                    <p><strong>Película:</strong> {ticket.peliculas?.titulo || ticket.pelicula_id || 'No disponible'}</p>
                    <p><strong>Asientos:</strong> {ticket.asientos_seleccionados || 'N/A'}</p>
                    <p><strong>Total:</strong> ${ticket.pago_total?.toLocaleString() || ticket.total?.toLocaleString() || '0'}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                      Comprado: {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Sin fecha'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
