import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';
import CineBot from '../components/CineBot';
import PurchaseModal from '../components/PurchaseModal';
import { sendTicketEmail } from '../lib/emailService';
import { supabase } from '../lib/supabase';
import '../styles/Home.css';

const isFunctionToday = (funcion) => {
  if (!funcion) return false;
  const fecha = new Date(`${funcion.año}-${String(funcion.mes).padStart(2, '0')}-${String(funcion.dia).padStart(2, '0')}T${funcion.hora || '00:00'}`);
  const hoy = new Date();
  return fecha.toDateString() === hoy.toDateString();
};

const countTodayFunctions = (pelicula) => {
  return pelicula?.funciones?.filter(isFunctionToday).length || 0;
};

const formatFunctionDate = (funcion) => {
  if (!funcion) return '';
  const fecha = new Date(`${funcion.año}-${String(funcion.mes).padStart(2, '0')}-${String(funcion.dia).padStart(2, '0')}T${funcion.hora || '00:00'}`);
  return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' });
};

const Home = () => {
  const navigate = useNavigate();
  const { user, ciudad, logout, isAdmin, createTicket, setCiudadGlobal, isAuthenticated } = useAuth();
  const [filtros, setFiltros] = useState({
    genero: '',
    mes: '',
    ciudad: ''
  });
  const [showFilters, setShowFilters] = useState(true);
  const [peliculaActiva, setPeliculaActiva] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showCityModal, setShowCityModal] = useState(!ciudad);

  const ciudades = ['Barranquilla', 'Bogotá', 'Medellín', 'Cali', 'Cartagena'];

  const [peliculas, setPeliculas] = useState(() => {
    const stored = localStorage.getItem('peliculas');
    return stored ? JSON.parse(stored) : [];
  });

  // Cargar películas desde Supabase al montar el componente
  useEffect(() => {
    const loadPeliculas = async () => {
      try {
        const { data, error } = await supabase
          .from('peliculas')
          .select(`
            *,
            funciones (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Procesar URLs de imágenes para Supabase Storage
          const processedData = data.map(pelicula => ({
            ...pelicula,
            poster_url: pelicula.poster_url 
              ? (pelicula.poster_url.startsWith('http') 
                  ? pelicula.poster_url 
                  : supabase.storage.from('images').getPublicUrl(pelicula.poster_url).data.publicUrl)
              : null
          }));
          
          setPeliculas(processedData);
          localStorage.setItem('peliculas', JSON.stringify(processedData));
        }
      } catch (err) {
        console.warn('Error loading movies from Supabase:', err);
      }
    };

    loadPeliculas();
  }, []);

  const peliculasOrganizadas = useMemo(() => ({
    disponibles: peliculas.filter(p => !p.preventa && p.estado !== 'proximamente'),
    preventa: peliculas.filter(p => p.preventa && p.estado !== 'proximamente'),
    estrenos: peliculas.filter(p => p.estado === 'proximamente')
  }), [peliculas]);

  const peliculasFiltradas = useMemo(() => {
    const aplicarFiltros = lista => lista.filter(p => {
      if (filtros.genero && !p.genero?.toLowerCase().includes(filtros.genero.toLowerCase())) return false;
      if (filtros.mes) {
        const mesPelicula = new Date(p.fecha_estreno || p.created_at).getMonth() + 1;
        if (mesPelicula !== parseInt(filtros.mes)) return false;
      }
      return true;
    });

    return {
      disponibles: aplicarFiltros(peliculasOrganizadas.disponibles),
      preventa: aplicarFiltros(peliculasOrganizadas.preventa),
      estrenos: aplicarFiltros(peliculasOrganizadas.estrenos)
    };
  }, [peliculasOrganizadas, filtros]);

  const generos = ['Acción', 'Aventura', 'Animación', 'Ciencia Ficción', 'Comedia', 'Drama', 'Fantasía', 'Infantil', 'Música', 'Concierto'];
  const meses = Array.from({length: 12}, (_, i) => i + 1);

  const handleFiltroChange = e => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFiltros({ genero: '', mes: '', ciudad: '' });
  };

  const handleComprar = pelicula => {
    navigate(`/movie/${pelicula.id}`);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setPeliculaActiva(null);
  };

  const handlePagoExitoso = async (ticketData) => {
    if (!user || !ticketData) return;

    const newTicket = await createTicket(ticketData);

    await sendTicketEmail(newTicket);

    alert(`Compra exitosa. Tu código de ticket es ${newTicket.id}`);
    handleCerrarModal();
  };

  return (
    <div className="home-container">
      <CineBot peliculas={peliculas} user={user} isAuthenticated={isAuthenticated} />

      <header className="home-header">
        <div className="header-left">
          <div className="brand-logo">🎞️</div>
        </div>
        <div className="header-center">
          <h1>CinemaHub</h1>
        </div>
        <div className="header-right">
          {ciudad && <span className="ciudad-info">📍 {ciudad}</span>}
          {isAuthenticated ? (
            <>
              <span className="user-info">👤 {user?.name || user?.email}</span>
              {isAdmin && (
                <a href="/admin" className="admin-link">⚙️ Admin</a>
              )}
              <button className="logout-btn" onClick={logout}>Cerrar Sesión</button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>Iniciar Sesión</button>
          )}
        </div>
      </header>

      <div className="home-content">
        <aside className={`filtros-panel ${showFilters ? 'active' : ''}`}>
          <div className="filtros-header">
            <h3>🔍 Filtros</h3>
            <button className="toggle-filters" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? '←' : '→'}
            </button>
          </div>

          <div className="filtros-content">
            <div className="filtro-group">
              <label htmlFor="genero">Género</label>
              <select
                id="genero"
                name="genero"
                value={filtros.genero}
                onChange={handleFiltroChange}
                className="filtro-select"
              >
                <option value="">Todos los géneros</option>
                {generos.filter(genero => genero !== 'Todos los géneros').map(genero => (
                  <option key={genero} value={genero}>
                    {genero}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label htmlFor="mes">Mes</label>
              <select
                id="mes"
                name="mes"
                value={filtros.mes}
                onChange={handleFiltroChange}
                className="filtro-select"
              >
                <option value="">Todos los meses</option>
                {meses.filter(m => m !== 'Todos los meses').map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label htmlFor="ciudad">Ciudad</label>
              <select
                id="ciudad"
                name="ciudad"
                value={filtros.ciudad}
                onChange={handleFiltroChange}
                className="filtro-select"
              >
                <option value="">Todas las ciudades</option>
                {ciudades.filter(c => c !== 'Todas las ciudades').map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              🔄 Limpiar Filtros
            </button>

            <div className="filtros-stats">
              <div className="stat-item">
                <span className="stat-label">Disponibles</span>
                <span className="stat-count">{peliculasFiltradas.disponibles.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Preventa</span>
                <span className="stat-count">{peliculasFiltradas.preventa.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estrenos</span>
                <span className="stat-count">{peliculasFiltradas.estrenos.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="cartelera-main">
          <SeccionPeliculas
            titulo="DISPONIBLES"
            peliculas={peliculasFiltradas.disponibles}
            onComprar={handleComprar}
          />
          <SeccionPeliculas
            titulo="PREVENTA"
            badge="preventa"
            peliculas={peliculasFiltradas.preventa}
            onComprar={handleComprar}
          />
          <SeccionPeliculas
            titulo="ESTRENOS PRÓXIMAMENTE"
            badge="estrenos"
            peliculas={peliculasFiltradas.estrenos}
            onComprar={handleComprar}
            disabled
          />

          {peliculas.length === 0 && (
            <div className="empty-cartelera">
              <h3>No hay películas disponibles</h3>
              <p>Vuelve pronto para ver nuestras próximas películas</p>
            </div>
          )}

          {peliculas.length > 0 &&
            peliculasFiltradas.disponibles.length === 0 &&
            peliculasFiltradas.preventa.length === 0 &&
            peliculasFiltradas.estrenos.length === 0 && (
              <div className="empty-cartelera">
                <h3>No hay películas con esos filtros</h3>
                <p>Intenta cambiar los filtros</p>
              </div>
            )}
        </main>
      </div>

      {modalAbierto && peliculaActiva && (
        <PurchaseModal
          pelicula={peliculaActiva}
          onClose={handleCerrarModal}
          onPagoExitoso={handlePagoExitoso}
        />
      )}

      {showCityModal && (
        <CityModal onSelect={(city) => {
          setCiudadGlobal(city);
          setShowCityModal(false);
        }} />
      )}
    </div>
  );
};

const SeccionPeliculas = ({ titulo, badge = 'disponible', peliculas, onComprar, disabled }) => {
  if (!peliculas || peliculas.length === 0) return null;
  return (
    <section className="cartelera-section">
      <h2 className="section-title">
        <span className={`badge ${badge}`}>●</span>
        {titulo}
      </h2>
      <div className="peliculas-grid">
        {peliculas.map(pelicula => (
          <PeliculaCard
            key={pelicula.id}
            pelicula={pelicula}
            onComprar={onComprar}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
};

const PeliculaCard = ({ pelicula, onComprar, disabled }) => {
  const [showDetails, setShowDetails] = useState(false);
  const todayCount = countTodayFunctions(pelicula);

  return (
    <div className={`pelicula-card ${disabled ? 'disabled' : ''}`}>
      <div className="card-poster">
        {pelicula.poster_url ? (
          <Link to={`/movie/${pelicula.id}`}>
            <img src={pelicula.poster_url} alt={pelicula.titulo} />
          </Link>
        ) : (
          <div className="poster-placeholder">📽️</div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{pelicula.titulo}</h3>
        
        <div className="card-details">
          <p className="detalles-tecnicos">
            {pelicula.genero || 'Género no especificado'} • {pelicula.duracion_min ? `${pelicula.duracion_min} min` : 'Duración no especificada'} • {pelicula.clasificacion || 'Clasificación no especificada'}
          </p>
        </div>
        
        <p className="descripcion">{pelicula.descripcion}</p>

        <div className="card-meta">
          <span className="formato">{pelicula.formato || '2D'}</span>
          <span className="fecha-estreno">
            Estreno: {pelicula.fecha_estreno ? new Date(pelicula.fecha_estreno).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Fecha por definir'}
          </span>
        </div>


        {pelicula.funciones && pelicula.funciones.length > 0 && (
          <div className="funciones-preview">
            <p className="funciones-count">
              🕐 {todayCount > 0 ? `${todayCount} funciones hoy` : `${pelicula.funciones.length} funciones`}
            </p>
          </div>
        )}

        <div className="card-actions">
          <button className="details-btn" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? '△ Ocultar' : '▽ Detalles'}
          </button>

          {!disabled ? (
            <button className="comprar-btn" onClick={() => onComprar(pelicula)}>
              🎟️ Comprar
            </button>
          ) : (
            <button className="comprar-btn disabled" disabled>
              🔒 Próximamente
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="card-details">
          <div className="details-content">
            <h4>Funciones disponibles:</h4>
            {pelicula.funciones && pelicula.funciones.length > 0 ? (
              <ul>
                {pelicula.funciones.map(func => (
                  <li key={func.id}>
                    Sala {func.sala} · {formatFunctionDate(func)} · {func.hora}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sin funciones programadas</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CityModal = ({ onSelect }) => (
  <div className="city-modal-overlay">
    <div className="city-modal glass">
      <h2>Selecciona tu Ciudad</h2>
      <p>Elige la ciudad donde deseas ver películas</p>
      <div className="city-options">
        {['Barranquilla', 'Bogotá', 'Medellín', 'Cali', 'Cartagena'].map(city => (
          <button key={city} onClick={() => onSelect(city)} className="city-btn">
            {city}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default Home;
