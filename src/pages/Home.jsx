import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/Auth.jsx';
import CineBot from '../components/CineBot';
import PurchaseModal from '../components/PurchaseModal';
import { sendTicketEmail } from '../lib/emailService';
import '../styles/Home.css';

const Home = () => {
  const { user, ciudad, logout, isAdmin, createTicket, setCiudadGlobal } = useAuth();
  const [filtros, setFiltros] = useState({
    genero: ''
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

  const peliculasOrganizadas = useMemo(() => ({
    disponibles: peliculas.filter(p => !p.preventa && !p.estrenos),
    preventa: peliculas.filter(p => p.preventa && !p.estrenos),
    estrenos: peliculas.filter(p => p.estrenos)
  }), [peliculas]);

  const peliculasFiltradas = useMemo(() => {
    const aplicarFiltros = lista => lista.filter(p => {
      if (filtros.genero && p.genero !== filtros.genero) return false;
      return true;
    });

    return {
      disponibles: aplicarFiltros(peliculasOrganizadas.disponibles),
      preventa: aplicarFiltros(peliculasOrganizadas.preventa),
      estrenos: aplicarFiltros(peliculasOrganizadas.estrenos)
    };
  }, [peliculasOrganizadas, filtros]);

  const generos = useMemo(() => {
    const todosGeneros = new Set();
    peliculas.forEach(p => p.genero && todosGeneros.add(p.genero));
    return Array.from(todosGeneros);
  }, [peliculas]);

  const handleFiltroChange = e => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFiltros({ genero: '' });
  };

  const handleComprar = pelicula => {
    setPeliculaActiva(pelicula);
    setModalAbierto(true);
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
      <CineBot />

      <header className="home-header">
        <div className="header-top">
          <h1>🎬 Cartelera</h1>
          <div className="header-info">
            <span className="ciudad-info">📍 {ciudad}</span>
            <span className="user-info">👤 {user?.email}</span>
            {isAdmin && (
              <a href="/admin" className="admin-link">⚙️ Admin</a>
            )}
            <button className="logout-btn" onClick={logout}>Cerrar Sesión</button>
          </div>
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
                {generos.map(genero => (
                  <option key={genero} value={genero}>
                    {genero}
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

  return (
    <div className={`pelicula-card ${disabled ? 'disabled' : ''}`}>
      <div className="card-poster">
        {pelicula.poster ? (
          <img src={pelicula.poster} alt={pelicula.titulo} />
        ) : (
          <div className="poster-placeholder">📽️</div>
        )}
      </div>

      <div className="card-body">
        <h3>{pelicula.titulo}</h3>
        <p className="genero">{pelicula.genero}</p>
        <p className="descripcion">{pelicula.descripcion}</p>

        <div className="card-meta">
          <span>{pelicula.formato || '2D'}</span>
          <span>{pelicula.fecha || 'Fecha por definir'}</span>
        </div>

        {pelicula.funciones && pelicula.funciones.length > 0 && (
          <div className="funciones-preview">
            <p className="funciones-count">🕐 {pelicula.funciones.length} funciones</p>
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
                    Sala {func.sala} · {func.dia}/{func.mes}/{func.año} · {func.hora}
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
