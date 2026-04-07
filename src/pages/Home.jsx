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
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#e50914', fontSize: '3rem', fontWeight: 'bold', margin: '0' }}>Cartelera de Cine</h1>
        <p style={{ color: '#aaa' }}>Selecciona una película para ver las funciones disponibles</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {peliculas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <span style={{ fontSize: '4rem' }}>🎬</span>
            <h3>No hay películas en la base de datos</h3>
            <button 
                onClick={loadPeliculas} 
                style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
                Reintentar
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
                <div style={{ position: 'relative', height: '380px' }}>
                  {pelicula.poster_url ? (
                    <img 
                      src={pelicula.poster_url} 
                      alt={pelicula.titulo} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Sin Imagen</span>
                    </div>
                  )}
                  {pelicula.clasificacion && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(229, 9, 20, 0.85)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {pelicula.clasificacion}
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#fff' }}>{pelicula.titulo}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0' }}>{pelicula.genero}</p>
                    <p style={{ color: '#eee', fontSize: '0.8rem', margin: '0' }}>{pelicula.duracion} min</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}