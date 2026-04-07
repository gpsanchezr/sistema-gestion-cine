import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; 

// Si el archivo Home.css no existe, deja esta línea comentada
// import './Home.css'; 

export default function Home() {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeliculas();
  }, []);

  const loadPeliculas = async () => {
    try {
      setLoading(true);
      // Traemos las películas de la tabla 'peliculas' en Supabase
      const { data, error } = await supabase
        .from('peliculas')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      console.log("Datos recibidos de Supabase:", data); 
      setPeliculas(data || []);
    } catch (error) {
      console.error('Error cargando películas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
            <div className="spinner"></div> {/* Puedes agregar un spinner CSS aquí */}
            <p>Cargando cartelera...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--dark-bg)', minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.1), rgba(26, 26, 26, 0.8))', backdropFilter: 'blur(10px)' }}>
        <h1 style={{ color: 'var(--netflix-red)', fontSize: '3.5rem', fontWeight: 'bold', margin: '0', textShadow: '0 0 30px rgba(229, 9, 20, 0.5)' }}>🎬 Cartelera de Cine</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.2rem', margin: '10px 0 0 0' }}>Descubre las mejores películas del momento</p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {peliculas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            margin: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎭</div>
            <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>No hay películas disponibles</h3>
            <button 
              onClick={loadPeliculas} 
              style={{ 
                padding: '12px 24px', 
                background: 'linear-gradient(135deg, #e50914, #b20710)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : (
          <div className="grid-movies">
            {peliculas.map((pelicula) => (
              <Link
                key={pelicula.id}
                to={`/pelicula/${pelicula.id}`}
                className="movie-card"
              >
                <div className="poster-container">
                  {pelicula.imagen_url ? (
                    <img 
                      src={pelicula.imagen_url} 
                      alt={pelicula.titulo} 
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #333, #555)', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '1.5rem'
                    }}>
                      🎬
                    </div>
                  )}
                  {pelicula.clasificacion && (
                    <div className="rating-badge">
                      {pelicula.clasificacion}
                    </div>
                  )}
                </div>
                
                <div className="content">
                  <h3>{pelicula.titulo}</h3>
                  <div className="meta">
                    <span className="genre">{pelicula.genero}</span>
                    <span className="duration">{pelicula.duracion} min</span>
                  </div>
                  {pelicula.descripcion && (
                    <p className="description">{pelicula.descripcion}</p>
                  )}
                  <button className="action-btn">
                    🎫 Ver Asientos
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}