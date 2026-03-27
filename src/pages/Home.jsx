import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Home.css';

export default function Home() {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeliculas();
  }, []);

  const loadPeliculas = async () => {
    try {
      const { data, error } = await supabase
        .from('peliculas')
        .select('*')
        .eq('estado', 'activa')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPeliculas(data || []);
    } catch (error) {
      console.error('Error loading peliculas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1>Cartelera de Cine</h1>
          <p>Descubre las mejores películas en tu ciudad</p>
        </div>
      </div>

      <div className="container">
        <section className="movies-section">
          {peliculas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎬</span>
              <h3>No hay películas disponibles</h3>
              <p>Vuelve pronto para ver nuestra próxima cartelera</p>
            </div>
          ) : (
            <div className="movies-grid">
              {peliculas.map((pelicula) => (
                <Link
                  key={pelicula.id}
                  to={`/pelicula/${pelicula.id}`}
                  className="movie-card"
                >
                  <div className="movie-poster">
                    {pelicula.imagen_url ? (
                      <img src={pelicula.imagen_url} alt={pelicula.titulo} />
                    ) : (
                      <div className="movie-poster-placeholder">
                        <span>🎬</span>
                      </div>
                    )}
                    <div className="movie-rating">{pelicula.clasificacion}</div>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{pelicula.titulo}</h3>
                    <p className="movie-genre">{pelicula.genero}</p>
                    <p className="movie-duration">{pelicula.duracion} min</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
