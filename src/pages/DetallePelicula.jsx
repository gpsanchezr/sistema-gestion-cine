import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function DetallePelicula() {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [loadingFunciones, setLoadingFunciones] = useState(true);
  const [errorFunciones, setErrorFunciones] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const asientos = Array.from({ length: 150 }, (_, i) => i + 1);

  // 1. Cargar la información de la película desde Supabase
  useEffect(() => {
    const cargarInfo = async () => {
      const { data, error } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setPelicula(data);
      if (error) console.error("Error cargando película:", error.message);
    };
    cargarInfo();
  }, [id]);

  // 2. Cargar las funciones de la película
  useEffect(() => {
    const cargarFunciones = async () => {
      try {
        setLoadingFunciones(true);
        setErrorFunciones('');

        const { data: funcionesData, error: funcionesError } = await supabase
          .from('funciones')
          .select('*')
          .eq('pelicula_id', id)
          .order('hora', { ascending: true });

        if (funcionesError) throw funcionesError;
        setFunciones(funcionesData || []);
      } catch (error) {
        console.error('Error cargando funciones:', error.message || error);
        setErrorFunciones('No se pudieron cargar las funciones.');
      } finally {
        setLoadingFunciones(false);
      }
    };

    if (id) cargarFunciones();
  }, [id]);

  // 2. Función para seleccionar/deseleccionar asientos
  const toggleAsiento = (num) => {
    setSeleccionados(prev => 
      prev.includes(num) ? prev.filter(a => a !== num) : [...prev, num]
    );
  };

  // 3. Función para guardar la reserva en la base de datos
  const manejarCompra = async () => {
    if (seleccionados.length === 0) return alert("Selecciona al menos un asiento");

    const PRECIO_ENTRADA = 15000;
    const totalCalculado = seleccionados.length * PRECIO_ENTRADA;
    
    // Generar código único de 8 caracteres
    const codigoUnico = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const { data, error } = await supabase
        .from('tiquetes')
        .insert([
          { 
            pelicula_id: id,
            asientos_seleccionados: seleccionados.join(', '),
            pago_total: totalCalculado,
            estado: 'valido',
            codigo_unico: codigoUnico
          }
        ])
        .select();

      if (error) throw error;

      // Mostrar el tiquete generado
      alert(`
        🎟️ ¡TIQUETE EXITOSO!
        Código: ${codigoUnico}
        Asientos: ${seleccionados.join(', ')}
        Total: $${totalCalculado.toLocaleString()}
        
        ¡Disfruta la película!
      `);
      
      setSeleccionados([]);
    } catch (error) {
      alert("Error al procesar: " + error.message);
    }
  };

  if (!pelicula) return <div style={{background: '#111', color: '#fff', height: '100vh', textAlign: 'center', padding: '50px'}}>Cargando...</div>;

  return (
    <div style={{ padding: '20px', background: '#111', color: '#fff', minHeight: '100vh', textAlign: 'center', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'left', marginBottom: '10px' }}>
        <Link to="/" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>⬅ Volver a Cartelera</Link>
      </div>

      <h2 style={{ margin: '10px 0' }}>Selecciona tus asientos para: <span style={{color: '#e50914'}}>{pelicula.titulo}</span></h2>
      
      {/* Detalles inmersivos de la película */}
      <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', textAlign: 'left', background: 'var(--glass)', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: 'var(--netflix-red)', fontWeight: 'bold' }}>{pelicula.genero} | {pelicula.duracion} min</p>
        <p style={{ marginTop: '10px', lineHeight: '1.6', fontSize: '1.1rem' }}>{pelicula.descripcion}</p>
      </div>

      {/* Funciones disponibles */}
      <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', textAlign: 'left', background: 'rgba(255,255,255,0.1)', borderRadius: '15px' }}>
        <h3 style={{ color: '#e50914', marginBottom: '15px' }}>Funciones disponibles</h3>
        {loadingFunciones ? (
          <p>Cargando funciones...</p>
        ) : errorFunciones ? (
          <p style={{ color: '#ff6b6b' }}>{errorFunciones}</p>
        ) : funciones.length === 0 ? (
          <p style={{ color: '#888' }}>No hay funciones programadas para esta película aún.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {funciones.map((funcion) => (
              <div key={funcion.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <p><strong>Hora:</strong> {funcion.hora || funcion.fecha_hora}</p>
                <p><strong>Precio:</strong> ${Number(funcion.precio || 0).toLocaleString()}</p>
                <p><strong>Estado:</strong> {funcion.estado || 'disponible'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pantalla del cine */}
      <div style={{ 
        background: '#555', 
        height: '8px', 
        width: '70%', 
        margin: '40px auto 10px', 
        borderRadius: '10px',
        boxShadow: '0px 0px 20px rgba(255,255,255,0.3)' 
      }}></div>
      <p style={{fontSize: '12px', color: '#666', marginBottom: '30px'}}>PANTALLA</p>
      
      {/* Cuadrícula de 150 asientos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(15, 1fr)', 
        gap: '6px', 
        maxWidth: '550px', 
        margin: '0 auto' 
      }}>
        {asientos.map(num => (
          <div 
            key={num}
            onClick={() => toggleAsiento(num)}
            className={`asiento-cine ${seleccionados.includes(num) ? 'seleccionado' : ''}`}
          >
            {num}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', background: '#1a1a1a', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
        <p style={{ margin: '0 0 10px 0' }}>Has seleccionado: **{seleccionados.length}** asientos</p>
        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px' }}>Números: {seleccionados.sort((a,b)=>a-b).join(', ') || 'Ninguno'}</p>
        
        <button 
          onClick={manejarCompra} // <--- Ahora el botón llama a la función
          disabled={seleccionados.length === 0}
          style={{ 
            padding: '12px 25px', 
            background: seleccionados.length > 0 ? '#e50914' : '#555', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: seleccionados.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          RESERVAR AHORA
        </button>
      </div>
    </div>
  );
}