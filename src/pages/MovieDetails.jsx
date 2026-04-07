import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SeatSelector from '../components/SeatSelector';
import './MovieDetails.css';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [selectedFuncion, setSelectedFuncion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    try {
      const { data: peliculaData, error: peliculaError } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', id)
        .eq('estado', 'activa')
        .maybeSingle();

      if (peliculaError) throw peliculaError;
      if (!peliculaData) {
        navigate('/');
        return;
      }

      setPelicula(peliculaData);

      const today = new Date().toISOString().split('T')[0];
      const { data: funcionesData, error: funcionesError } = await supabase
        .from('funciones')
        .select('*')
        .eq('pelicula_id', id)
        .eq('estado', 'disponible')
        .gte('fecha', today)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (funcionesError) throw funcionesError;
      setFunciones(funcionesData || []);
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFuncionSelect = (funcion) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedFuncion(funcion);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pelicula) {
    return null;
  }

  return (
    <div className="movie-details-page">
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          {pelicula.imagen_url && (
            <img src={pelicula.imagen_url} alt={pelicula.titulo} />
          )}
          <div className="movie-hero-overlay"></div>
        </div>
        <div className="container movie-hero-content">
          <div className="movie-poster-large">
            {pelicula.imagen_url ? (
              <img src={pelicula.imagen_url} alt={pelicula.titulo} />
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
            {pelicula.trailer_url && (
              <a
                href={pelicula.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Ver Tráiler
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <section className="funciones-section">
          <h2>Selecciona una función</h2>
          {funciones.length === 0 ? (
            <div className="empty-state">
              <p>No hay funciones disponibles para esta película</p>
            </div>
          ) : (
            <div className="funciones-grid">
              {funciones.map((funcion) => (
                <button
                  key={funcion.id}
                  onClick={() => handleFuncionSelect(funcion)}
                  className={`funcion-card ${selectedFuncion?.id === funcion.id ? 'selected' : ''}`}
                >
                  <div className="funcion-date">{formatDate(funcion.fecha)}</div>
                  <div className="funcion-time">{formatTime(funcion.hora)}</div>
                  <div className="funcion-price">${funcion.precio.toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedFuncion && (
          <SeatSelector
            funcion={selectedFuncion}
            pelicula={pelicula}
            onComplete={() => {
              navigate('/mis-tiquetes');
            }}
          />
        )}
      </div>
    </div>
  );
}
