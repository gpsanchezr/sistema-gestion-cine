import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; 
// Si el archivo Home.css no existe, comenta la siguiente línea con //
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
        <div>Cargando cartelera...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Arial' }}>
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#e50914', fontSize: '3rem', fontWeight: 'bold', margin: '0' }}>Cartelera de Cine</h1>
        <p>Selecciona una película para ver las funciones disponibles</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {peliculas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <span style={{ fontSize: '4rem' }}>🎬</span>
            <h3>No hay películas en la base de datos</h3>
            <button onClick={loadPeliculas} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Reintentar</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
            {peliculas.map((pelicula) => (
              <Link
                key={pelicula.id}
                to={`/pelicula/${pelicula.id}`}
                style={{ textDecoration: 'none', color: 'inherit', background: '#141414', borderRadius: '8px', overflow: 'hidden', display: 'block' }}
              >
                <div style={{ position: 'relative', height: '380px' }}>
                  {pelicula.poster_url ? (
                    <img 
                      src={pelicula.poster_url} 
                      alt={pelicula.titulo} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} // CORREGIDO: era objectFit, no objectCover
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span>No Image</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {pelicula.clasificacion}
                  </div>
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{pelicula.titulo}</h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '5px 0' }}>{pelicula.genero}</p>
                  <p style={{ color: '#eee', fontSize: '0.8rem' }}>{pelicula.duracion_min} minutos</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}