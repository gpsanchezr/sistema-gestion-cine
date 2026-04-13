import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const placeholderPoster = 'https://via.placeholder.com/540x760/0b1220/ffffff?text=CinemaHub';

function MovieCard({ pelicula }) {
  const posterSrc = pelicula.poster_url || pelicula.imagen || placeholderPoster;

  return (
    <Link
      to={`/pelicula/${pelicula.id}`}
      style={{
        display: 'block',
        borderRadius: 28,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.30)',
        textDecoration: 'none',
        color: '#f8fafc',
        transition: 'transform 0.24s ease, border-color 0.24s ease',
      }}
    >
      <div style={{ position: 'relative', minHeight: 400, background: '#111827' }}>
        <img
          src={posterSrc}
          alt={pelicula.titulo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderPoster;
          }}
        />
        {pelicula.clasificacion && (
          <span
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {pelicula.clasificacion}
          </span>
        )}
      </div>

      <div style={{ padding: 22, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.1, color: '#f8fafc', textShadow: '0 0 18px rgba(236, 72, 153, 0.25)' }}>
          {pelicula.titulo}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#94a3b8', fontSize: 13 }}>
          <span>{pelicula.genero || 'Género no disponible'}</span>
          <span>{pelicula.duracion ? `${pelicula.duracion} min` : 'Duración desconocida'}</span>
        </div>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.65, minHeight: 66 }}>
          {pelicula.descripcion || 'Sin descripción disponible.'}
        </p>
        <button
          type="button"
          style={{
            marginTop: 8,
            width: '100%',
            padding: '14px 18px',
            borderRadius: 18,
            border: 'none',
            background: 'linear-gradient(135deg, #ec4899, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reservar asientos
        </button>
      </div>
    </Link>
  );
}

function MovieSection({ title, peliculas, icon }) {
  if (peliculas.length === 0) return null;

  return (
    <section style={{ marginBottom: '4rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <h2 style={{
          margin: 0,
          fontSize: 'clamp(1.8rem, 2.5vw, 2.5rem)',
          background: 'linear-gradient(135deg, #ff0080 0%, #00f0ff 50%, #0080ff 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800',
          letterSpacing: '-0.025em',
        }}>
          {title}
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}>
        {peliculas.map((pelicula) => (
          <MovieCard key={pelicula.id} pelicula={pelicula} />
        ))}
      </div>
    </section>
  );
}

export default function Cartelera() {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  useEffect(() => {
    const loadPeliculas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('peliculas').select('*').order('id', { ascending: false });
        if (error) throw error;
        setPeliculas(data || []);
      } catch (error) {
        console.error('Error cargando películas:', error.message || error);
      } finally {
        setLoading(false);
      }
    };

    loadPeliculas();
  }, []);

  const genres = useMemo(
    () => Array.from(new Set(peliculas.map((pelicula) => pelicula.genero).filter(Boolean))),
    [peliculas]
  );

  const filteredPeliculas = useMemo(() => {
    const query = search.toLowerCase();
    return peliculas.filter((pelicula) => {
      const matchesSearch = pelicula.titulo?.toLowerCase().includes(query);
      const matchesGenre = genreFilter ? pelicula.genero === genreFilter : true;
      return matchesSearch && matchesGenre;
    });
  }, [peliculas, search, genreFilter]);

  // Filtrar películas por estado
  const disponibles = filteredPeliculas.filter(p => p.estado === 'disponible');
  const estrenos = filteredPeliculas.filter(p => p.estado === 'estreno');
  const preventa = filteredPeliculas.filter(p => p.estado === 'preventa');
  const proximamente = filteredPeliculas.filter(p => p.estado === 'proximamente');

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050816 0%, #0a0a1a 50%, #050816 100%)',
      color: '#f8fafc',
      padding: '28px 24px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Fondo animado sutil */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255,0,128,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,240,255,0.1) 0%, transparent 50%)',
        zIndex: -1,
      }}></div>

      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ marginBottom: 32, textAlign: 'center' }}>
          <p style={{
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.26em',
            color: '#818cf8',
            fontSize: 12,
            fontWeight: '600',
          }}>
            CinemaHub
          </p>
          <h1 style={{
            margin: '14px 0 10px',
            fontSize: 'clamp(2.4rem, 3.2vw, 4rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.05em',
            background: 'linear-gradient(135deg, #ff0080 0%, #00f0ff 50%, #0080ff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            textShadow: '0 0 40px rgba(255,0,128,0.3)',
          }}>
            Cartelera Cinematográfica
          </h1>
          <p style={{
            margin: '0 auto',
            maxWidth: 780,
            color: '#94a3b8',
            fontSize: 16,
            lineHeight: 1.8,
          }}>
            Descubre las mejores películas organizadas por categorías. ¡Reserva tus asientos ahora!
          </p>
        </header>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gap: 16,
          marginBottom: 32,
          gridTemplateColumns: '1fr minmax(220px, 280px)',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}>
          <input
            type="search"
            placeholder="Buscar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 18px',
              borderRadius: 18,
              border: '1px solid rgba(148,163,184,0.24)',
              background: 'rgba(15,23,42,0.8)',
              color: '#f8fafc',
              fontSize: 15,
              outline: 'none',
              backdropFilter: 'blur(10px)',
            }}
          />

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 18px',
              borderRadius: 18,
              border: '1px solid rgba(148,163,184,0.24)',
              background: 'rgba(15,23,42,0.8)',
              color: '#f8fafc',
              fontSize: 15,
              outline: 'none',
              backdropFilter: 'blur(10px)',
            }}
          >
            <option value="" style={{ color: '#94a3b8', background: '#0f172a' }}>
              Todos los géneros
            </option>
            {genres.map((genre) => (
              <option key={genre} value={genre} style={{ color: '#f8fafc', background: '#0f172a' }}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{
            padding: 40,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              display: 'inline-flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff0080',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00f0ff',
                animation: 'pulse 1.5s ease-in-out infinite 0.3s',
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#0080ff',
                animation: 'pulse 1.5s ease-in-out infinite 0.6s',
              }}></div>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Cargando películas...</p>
          </div>
        ) : filteredPeliculas.length === 0 ? (
          <div style={{
            padding: 40,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
          }}>
            <h2 style={{ margin: 0, color: '#f8fafc' }}>No encontramos películas con esa búsqueda.</h2>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setGenreFilter('');
              }}
              style={{
                marginTop: 20,
                padding: '14px 22px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899, #6366f1)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Mostrar todo
            </button>
          </div>
        ) : (
          <>
            <MovieSection title="Disponibles" peliculas={disponibles} icon="🍿" />
            <MovieSection title="Estrenos" peliculas={estrenos} icon="🔥" />
            <MovieSection title="Preventa" peliculas={preventa} icon="🎟️" />
            <MovieSection title="Próximamente" peliculas={proximamente} icon="⏳" />
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          main {
            padding: '16px 12px';
          }
          header {
            text-align: left !important;
          }
          div[style*="grid-template-columns: 1fr minmax(220px, 280px)"] {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
