import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SelectorAsientos from '../components/SelectorAsientos';
import './MovieDetails.css';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [selectedFuncion, setSelectedFuncion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: peliculaData, error: peliculaError } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', id)
        .single();

      if (peliculaError || !peliculaData) {
        throw new Error('Película no encontrada o error en la consulta');
      }

      setPelicula(peliculaData);

      const { data: funcionesData, error: funcionesError } = await supabase
        .from('funciones')
        .select('*')
        .eq('pelicula_id', id)
        .order('fecha_hora', { ascending: true });

      if (funcionesError) throw funcionesError;
      setFunciones(funcionesData || []);

    } catch (error) {
      console.error('Error loading movie data:', error);
      setError(error.message || 'Error al cargar la información de la película');
    } finally {
      setLoading(false);
    }
  };

  const handleFuncionSelect = (funcion) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedFuncion(funcion);
    // Scroll suave hacia el selector de asientos
    setTimeout(() => {
      document.querySelector('.seats-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/pelicula/${id}` } });
  };

  const formatDateTime = (fechaHoraStr) => {
    const dateTime = new Date(fechaHoraStr);
    const date = dateTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const time = dateTime.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
    return { date, time };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando película...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="card" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          padding: '40px'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Error</h2>
          <p style={{ color: 'white', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* Modal de login requerido */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Inicio de sesión requerido</h3>
            <p>Para seleccionar asientos y comprar tickets, necesitas iniciar sesión.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={handleLoginRedirect} className="btn btn-primary">
                Iniciar sesión
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="btn btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          {pelicula.poster_url && (
            <img src={pelicula.poster_url} alt={pelicula.titulo} />
          )}
          <div className="movie-hero-overlay"></div>
        </div>
        <div className="container movie-hero-content">
          <div className="movie-poster-large">
            {pelicula.poster_url ? (
              <img src={pelicula.poster_url} alt={pelicula.titulo} />
            ) : (
              <div className="poster-placeholder">🎬</div>
            )}
          </div>
          <div className="movie-details">
            <h1>{pelicula.titulo}</h1>
            <div className="movie-meta">
              <span className="meta-badge">{pelicula.clasificacion}</span>
              <span className="meta-item">{pelicula.genero}</span>
              <span className="meta-item">{pelicula.duracion} min</span>
            </div>
            <p className="movie-description">{pelicula.descripcion}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {pelicula.trailer_url && (
                <a
                  href={pelicula.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  🎬 Ver Tráiler
                </a>
              )}
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline"
              >
                ← Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="funciones-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Selecciona una función</h2>
            {user && (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                👤 {user.email}
              </div>
            )}
          </div>

          {funciones.length === 0 ? (
            <div className="empty-state">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎭</div>
                <h3>No hay funciones disponibles</h3>
                <p>Esta película no tiene funciones programadas actualmente.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                  Ver otras películas
                </button>
              </div>
            </div>
          ) : (
            <div className="funciones-grid">
              {funciones.map((funcion) => (
                <button
                  key={funcion.id}
                  onClick={() => handleFuncionSelect(funcion)}
                  className={`funcion-card ${selectedFuncion?.id === funcion.id ? 'selected' : ''}`}
                  disabled={!user}
                >
                  {(() => {
                    const { date, time } = formatDateTime(funcion.fecha_hora);
                    return (
                      <>
                        <div className="funcion-date">{date}</div>
                        <div className="funcion-time">{time}</div>
                      </>
                    );
                  })()}
                  <div className="funcion-sala">Sala {funcion.sala}</div>
                  <div className="funcion-price">${funcion.precio.toLocaleString()}</div>
                  {!user && <div className="login-required">Requiere iniciar sesión</div>}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedFuncion && (
          <section className="seats-section">
<SelectorAsientos
              funcionId={selectedFuncion.id}
              onSeatsSelect={(seats) => console.log('Seats:', seats)}
              onPurchaseComplete={(reserva) => {
                console.log('Compra:', reserva);
                navigate('/mis-tiquetes');
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
