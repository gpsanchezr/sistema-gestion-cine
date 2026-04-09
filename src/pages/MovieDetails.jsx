import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';
import PurchaseModal from '../components/PurchaseModal';
import { supabase } from '../lib/supabase';
import '../styles/MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [functionsError, setFunctionsError] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSala, setSelectedSala] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const loadPelicula = async () => {
      try {
        const { data, error } = await supabase
          .from('peliculas')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          setPelicula(null); // Manejo de película no encontrada
          return;
        }

        const processedMovie = {
          ...data,
          poster_url: data.poster_url
            ? (data.poster_url.startsWith('http')
                ? data.poster_url
                : supabase.storage.from('images').getPublicUrl(data.poster_url).data.publicUrl)
            : null,
          funciones: []
        };

        setPelicula(processedMovie);

        const { data: funcionesData, error: funcionesError } = await supabase
          .from('funciones')
          .select('*')
          .eq('pelicula_id', id);

        if (funcionesError) throw funcionesError;

        setFunciones(funcionesData || []);
        setPelicula((prev) => (prev ? { ...prev, funciones: funcionesData || [] } : null));
      } catch (error) {
        console.error('Error cargando película:', error);
        setFunciones([]);
        setPelicula(null);
      } finally {
        setLoading(false); // ESTO ES OBLIGATORIO para quitar el spinner
      }
    };

    loadPelicula();
  }, [id]);

  const formatFunctionDateTime = (funcion) => {
    if (!funcion) return '';
    const fecha = new Date(`${funcion.año}-${String(funcion.mes).padStart(2, '0')}-${String(funcion.dia).padStart(2, '0')}T${funcion.hora || '00:00'}`);
    return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }) + ' • ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFunctionDay = (funcion) => {
    if (!funcion) return '';
    const fecha = new Date(`${funcion.año}-${String(funcion.mes).padStart(2, '0')}-${String(funcion.dia).padStart(2, '0')}T${funcion.hora || '00:00'}`);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const uniqueDays = Array.from(new Set(funciones.map(formatFunctionDay))).filter(Boolean);
  const uniqueSalas = Array.from(new Set(funciones.map((funcion) => funcion.sala_nombre || `Sala ${funcion.sala}`))).filter(Boolean);

  const filteredFunciones = funciones.filter((funcion) => {
    let matchesDay = true;
    let matchesSala = true;

    if (selectedDay) {
      matchesDay = formatFunctionDay(funcion) === selectedDay;
    }

    if (selectedSala) {
      matchesSala = (funcion.sala_nombre || `Sala ${funcion.sala}`) === selectedSala;
    }

    return matchesDay && matchesSala;
  });

  const handleFunctionSelect = (funcion) => {
    setSelectedFunction(funcion);
  };

  const handleComprar = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
  };

  const handlePagoExitoso = async (ticketData) => {
    alert(`Compra exitosa. Tu código de ticket es ${ticketData.id}`);
    setModalAbierto(false);
  };

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando película...</p>
        </div>
      </div>
    );
  }

  if (!pelicula) {
    return (
      <div className="movie-details-container">
        <div className="error-container">
          <h2>No pudimos encontrar esta película</h2>
          <button onClick={() => navigate('/home')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  // Extraer ID del video de YouTube del trailer_url
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(pelicula.trailer_url);

  return (
    <div className="movie-details-container">
      <header className="movie-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          ← Volver a Cartelera
        </button>
        <div className="header-info">
          {!isAuthenticated && (
            <button className="login-btn" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <section className="hero-banner relative w-full h-[70vh] flex items-end pb-12">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
            title={`Tráiler de ${pelicula.titulo}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="hero-iframe absolute inset-0 w-full h-full object-cover pointer-events-none"
          ></iframe>
        ) : (
          <div className="hero-placeholder absolute inset-0">
            <p>🎬 Tráiler no disponible</p>
          </div>
        )}
        <div className="hero-overlay absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent"></div>
        <div className="hero-content relative z-10 px-10 w-full max-w-5xl">
          <span className="hero-label">Experiencia Premium</span>
          <h1 className="hero-title">{pelicula.titulo}</h1>
          <div className="hero-meta">
            <span>{pelicula.genero || 'Género no especificado'}</span>
            <span>{pelicula.duracion_min ? `${pelicula.duracion_min} min` : 'Duración no especificada'}</span>
            <span>{pelicula.formato || '2D'}</span>
          </div>
          <p className="hero-synopsis">{pelicula.descripcion}</p>
        </div>
      </section>

      <section className="functions-section">
        <div className="functions-top">
          <div>
            <h2>Funciones y Entradas</h2>
            <p className="functions-subtitle">Elige la sesión que más te guste y selecciona tus asientos.</p>
          </div>
          <div className="functions-filters">
            <div className="filter-group">
              <label>Filtrar por día</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                <option value="">Todos los días</option>
                {Array.from(new Set(funciones.map(formatFunctionDay))).map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Filtrar por sala</label>
              <select value={selectedSala} onChange={(e) => setSelectedSala(e.target.value)}>
                <option value="">Todas las salas</option>
                {Array.from(new Set(funciones.map((funcion) => funcion.sala_nombre || `Sala ${funcion.sala}`))).map((sala) => (
                  <option key={sala} value={sala}>{sala}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {functionsError && <p className="functions-error">{functionsError}</p>}

        {filteredFunciones.length > 0 ? (
          <div className="functions-grid">
            {filteredFunciones.map(func => (
              <div
                key={func.id}
                className={`function-card ${selectedFunction?.id === func.id ? 'selected' : ''}`}
                onClick={() => handleFunctionSelect(func)}
              >
                <div className="function-info">
                  <span className="function-date">{formatFunctionDateTime(func)}</span>
                  <span className="function-price">{func.precio ? `COP ${func.precio}` : 'Precio no definido'}</span>
                  <span className="function-sala">{func.sala_nombre ? `Sala ${func.sala} - ${func.sala_nombre}` : `Sala ${func.sala}`}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay funciones disponibles</p>
        )}

        {selectedFunction && (
          <div className="selected-function">
            <h3>Función Seleccionada</h3>
            <p>{formatFunctionDateTime(selectedFunction)} - {selectedFunction.sala_nombre ? `Sala ${selectedFunction.sala} - ${selectedFunction.sala_nombre}` : `Sala ${selectedFunction.sala}`}</p>
            <button className="comprar-btn" onClick={handleComprar}>
              🎟️ Elegir Asientos
            </button>
          </div>
        )}
      </section>

      {/* Purchase Modal */}
      {modalAbierto && selectedFunction && (
        <PurchaseModal
          pelicula={{ ...pelicula, funciones: [selectedFunction] }}
          onClose={handleCerrarModal}
          onConfirm={handlePagoExitoso}
          user={user}
        />
      )}
    </div>
  );
};

export default MovieDetails;