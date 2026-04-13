import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalTiquetes: 0,
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    usuariosRegistrados: 0,
    funcionesActivas: 0,
    peliculasActivas: 0,
    ocupacionPromedio: 0
  });
  const [tiquetes, setTiquetes] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  // Estados para gestión
  const [showPeliculaForm, setShowPeliculaForm] = useState(false);
  const [showFuncionForm, setShowFuncionForm] = useState(false);
  const [editingPelicula, setEditingPelicula] = useState(null);
  const [editingFuncion, setEditingFuncion] = useState(null);
  const [peliculaForm, setPeliculaForm] = useState({
    titulo: '',
    descripcion: '',
    genero: '',
    duracion: '',
    imagen: '',
    estado: 'activa'
  });
  const [funcionForm, setFuncionForm] = useState({
    pelicula_id: '',
    fecha: '',
    hora: '',
    sala: '',
    precio: '',
    estado: 'disponible'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener datos básicos
      const [
        { data: tiquetesData },
        { data: funcionesData },
        { data: peliculasData },
        { data: usuariosData }
      ] = await Promise.all([
supabase.from('tiquetes').select('*').order('id', { ascending: false }),
        supabase.from('funciones').select('*, peliculas(titulo)').eq('estado', 'disponible'),
        supabase.from('peliculas').select('*').eq('estado', 'activa'),
        supabase.from('perfiles').select('*')
      ]);

      setTiquetes(tiquetesData || []);
      setFunciones(funcionesData || []);
      setPeliculas(peliculasData || []);

      // Calcular estadísticas
      const now = new Date();
      const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mesAtras = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const ventasHoy = tiquetesData?.filter(t => new Date(t.created_at) >= hoy).reduce((sum, t) => sum + (t.pago_total || 0), 0) || 0;
      const ventasSemana = tiquetesData?.filter(t => new Date(t.created_at) >= semanaAtras).reduce((sum, t) => sum + (t.pago_total || 0), 0) || 0;
      const ventasMes = tiquetesData?.reduce((sum, t) => sum + (t.pago_total || 0), 0) || 0;

      // Calcular ventas por día (últimos 7 días)
      const ventasDiarias = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
        const ventasDia = tiquetesData?.filter(t => {
          const fechaTiquete = new Date(t.created_at);
          return fechaTiquete.toDateString() === fecha.toDateString();
        }).reduce((sum, t) => sum + (t.pago_total || 0), 0) || 0;

        ventasDiarias.push({
          fecha: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
          ventas: ventasDia
        });
      }

      // Calcular ocupación promedio
      let totalAsientosOcupados = 0;
      let totalAsientosDisponibles = 0;

      for (const funcion of funcionesData || []) {
        const { data: tiquetesData } = await supabase
          .from('tiquetes')
          .select('asientos_seleccionados')
          .eq('funcion_id', funcion.id)
          .eq('estado', 'confirmada');

        let ocupadosCount = 0;
        tiquetesData?.forEach(t => {
          if (t.asientos_seleccionados) {
            ocupadosCount += JSON.parse(t.asientos_seleccionados).length;
          }
        });

        totalAsientosOcupados += ocupadosCount;
        totalAsientosDisponibles += 150; // 150 asientos por función per SENA
      }

      const ocupacionPromedio = totalAsientosDisponibles > 0 ? (totalAsientosOcupados / totalAsientosDisponibles) * 100 : 0;

      setStats({
        totalVentas: ventasMes,
        totalTiquetes: tiquetesData?.length || 0,
        ventasHoy,
        ventasSemana,
        ventasMes,
        usuariosRegistrados: usuariosData?.length || 0,
        funcionesActivas: funcionesData?.length || 0,
        peliculasActivas: peliculasData?.length || 0,
        ocupacionPromedio: Math.round(ocupacionPromedio)
      });

      setVentasPorDia(ventasDiarias);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  // Funciones CRUD para películas
  const handlePeliculaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPelicula) {
        const { error } = await supabase
          .from('peliculas')
          .update(peliculaForm)
          .eq('id', editingPelicula.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('peliculas')
          .insert([peliculaForm]);
        if (error) throw error;
      }
      setShowPeliculaForm(false);
      setEditingPelicula(null);
      setPeliculaForm({
        titulo: '',
        descripcion: '',
        genero: '',
        duracion: '',
        imagen: '',
        estado: 'activa'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error guardando película:', error);
      alert('Error al guardar la película');
    }
  };

  const handleEditPelicula = (pelicula) => {
    setEditingPelicula(pelicula);
    setPeliculaForm({
      titulo: pelicula.titulo,
      descripcion: pelicula.descripcion,
      genero: pelicula.genero,
      duracion: pelicula.duracion,
      imagen: pelicula.imagen,
      estado: pelicula.estado
    });
    setShowPeliculaForm(true);
  };

  const handleDeletePelicula = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta película?')) return;
    try {
      const { error } = await supabase
        .from('peliculas')
        .delete()
        .eq('id', id);
      if (error) throw error;
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando película:', error);
      alert('Error al eliminar la película');
    }
  };

  // Funciones CRUD para funciones
  const handleFuncionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFuncion) {
        const { error } = await supabase
          .from('funciones')
          .update(funcionForm)
          .eq('id', editingFuncion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('funciones')
          .insert([funcionForm]);
        if (error) throw error;
      }
      setShowFuncionForm(false);
      setEditingFuncion(null);
      setFuncionForm({
        pelicula_id: '',
        fecha: '',
        hora: '',
        sala: '',
        precio: '',
        estado: 'disponible'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error guardando función:', error);
      alert('Error al guardar la función');
    }
  };

  const handleEditFuncion = (funcion) => {
    setEditingFuncion(funcion);
    setFuncionForm({
      pelicula_id: funcion.pelicula_id,
      fecha: funcion.fecha,
      hora: funcion.hora,
      sala: funcion.sala,
      precio: funcion.precio,
      estado: funcion.estado
    });
    setShowFuncionForm(true);
  };

  const handleDeleteFuncion = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta función?')) return;
    try {
      const { error } = await supabase
        .from('funciones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando función:', error);
      alert('Error al eliminar la función');
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card" style={{ padding: '30px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Panel Administrativo</h1>
          <Link to="/" className="btn btn-outline">Volver al inicio</Link>
        </div>

        {/* Filtros de período */}
        <div style={{ marginBottom: '30px' }}>
          <div className="period-filters">
            <button
              className={`btn ${periodo === 'hoy' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriodo('hoy')}
            >
              Hoy
            </button>
            <button
              className={`btn ${periodo === 'semana' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriodo('semana')}
            >
              Esta semana
            </button>
            <button
              className={`btn ${periodo === 'mes' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriodo('mes')}
            >
              Este mes
            </button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-2" style={{ marginBottom: '40px' }}>
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Ventas del período</h3>
              <p className="metric-value">
                {formatCurrency(
                  periodo === 'hoy' ? stats.ventasHoy :
                  periodo === 'semana' ? stats.ventasSemana :
                  stats.ventasMes
                )}
              </p>
              <p className="metric-change">
                {stats.totalTiquetes} tiquetes vendidos
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎭</div>
            <div className="metric-content">
              <h3>Ocupación promedio</h3>
              <p className="metric-value">{stats.ocupacionPromedio}%</p>
              <p className="metric-change">
                {stats.funcionesActivas} funciones activas
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <h3>Usuarios registrados</h3>
              <p className="metric-value">{stats.usuariosRegistrados}</p>
              <p className="metric-change">
                Comunidad activa
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎬</div>
            <div className="metric-content">
              <h3>Películas activas</h3>
              <p className="metric-value">{stats.peliculasActivas}</p>
              <p className="metric-change">
                En cartelera
              </p>
            </div>
          </div>
        </div>

        {/* Gestión de Películas */}
        <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Gestión de Películas</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowPeliculaForm(true)}
            >
              Agregar Película
            </button>
          </div>

          {showPeliculaForm && (
            <form onSubmit={handlePeliculaSubmit} style={{ marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div>
                  <label>Título:</label>
                  <input
                    type="text"
                    value={peliculaForm.titulo}
                    onChange={(e) => setPeliculaForm({...peliculaForm, titulo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Género:</label>
                  <input
                    type="text"
                    value={peliculaForm.genero}
                    onChange={(e) => setPeliculaForm({...peliculaForm, genero: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Duración (minutos):</label>
                  <input
                    type="number"
                    value={peliculaForm.duracion}
                    onChange={(e) => setPeliculaForm({...peliculaForm, duracion: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Imagen (nombre del archivo):</label>
                  <input
                    type="text"
                    value={peliculaForm.imagen}
                    onChange={(e) => setPeliculaForm({...peliculaForm, imagen: e.target.value})}
                    placeholder="ej: poster1.jpg"
                    required
                  />
                </div>
                <div className="grid-span-2">
                  <label>Descripción:</label>
                  <textarea
                    value={peliculaForm.descripcion}
                    onChange={(e) => setPeliculaForm({...peliculaForm, descripcion: e.target.value})}
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingPelicula ? 'Actualizar' : 'Guardar'} Película
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowPeliculaForm(false);
                    setEditingPelicula(null);
                    setPeliculaForm({
                      titulo: '',
                      descripcion: '',
                      genero: '',
                      duracion: '',
                      imagen: '',
                      estado: 'activa'
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-3">
            {peliculas.map((pelicula) => (
              <div key={pelicula.id} className="funcion-card" style={{ position: 'relative' }}>
                <img
                  src={`https://hqxexgifvxfyjpkwxqsm.supabase.co/storage/v1/object/public/posters/${pelicula.imagen}`}
                  alt={pelicula.titulo}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x300?text=Sin+Imagen';
                  }}
                />
                <h4>{pelicula.titulo}</h4>
                <p>{pelicula.genero} • {pelicula.duracion} min</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditPelicula(pelicula)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDeletePelicula(pelicula.id)}
                    style={{ background: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de Funciones */}
        <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Gestión de Funciones</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowFuncionForm(true)}
            >
              Programar Función
            </button>
          </div>

          {showFuncionForm && (
            <form onSubmit={handleFuncionSubmit} style={{ marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div>
                  <label>Película:</label>
                  <select
                    value={funcionForm.pelicula_id}
                    onChange={(e) => setFuncionForm({...funcionForm, pelicula_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar película</option>
                    {peliculas.map(pelicula => (
                      <option key={pelicula.id} value={pelicula.id}>
                        {pelicula.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Fecha:</label>
                  <input
                    type="date"
                    value={funcionForm.fecha}
                    onChange={(e) => setFuncionForm({...funcionForm, fecha: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Hora:</label>
                  <input
                    type="time"
                    value={funcionForm.hora}
                    onChange={(e) => setFuncionForm({...funcionForm, hora: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Sala:</label>
                  <input
                    type="text"
                    value={funcionForm.sala}
                    onChange={(e) => setFuncionForm({...funcionForm, sala: e.target.value})}
                    placeholder="ej: Sala 1"
                    required
                  />
                </div>
                <div>
                  <label>Precio:</label>
                  <input
                    type="number"
                    value={funcionForm.precio}
                    onChange={(e) => setFuncionForm({...funcionForm, precio: e.target.value})}
                    placeholder="ej: 15000"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingFuncion ? 'Actualizar' : 'Programar'} Función
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowFuncionForm(false);
                    setEditingFuncion(null);
                    setFuncionForm({
                      pelicula_id: '',
                      fecha: '',
                      hora: '',
                      sala: '',
                      precio: '',
                      estado: 'disponible'
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-3">
            {funciones.map((funcion) => (
              <div key={funcion.id} className="funcion-card" style={{ position: 'relative' }}>
                <h4>{funcion.peliculas?.titulo || 'Película'}</h4>
                <p>{new Date(funcion.fecha).toLocaleDateString('es-ES')} - {funcion.hora}</p>
                <p>Sala: {funcion.sala}</p>
                <p className="price">{formatCurrency(funcion.precio)}</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditFuncion(funcion)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDeleteFuncion(funcion.id)}
                    style={{ background: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de ventas por día */}
        <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Ventas de los últimos 7 días</h3>
          <div className="chart-container">
            {ventasPorDia.map((dia, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max((dia.ventas / Math.max(...ventasPorDia.map(d => d.ventas))) * 100, 5)}%`
                    }}
                  ></div>
                </div>
                <div className="bar-label">{dia.fecha}</div>
                <div className="bar-value">{formatCurrency(dia.ventas)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Funciones activas */}
        <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Funciones activas</h3>
          {funciones.length === 0 ? (
            <p>No hay funciones activas actualmente.</p>
          ) : (
            <div className="grid grid-3">
              {funciones.slice(0, 6).map((funcion) => (
                <div key={funcion.id} className="funcion-card">
                  <h4>{funcion.peliculas?.titulo || 'Película'}</h4>
                  <p>{new Date(funcion.fecha).toLocaleDateString('es-ES')} - {funcion.hora}</p>
                  <p>Sala: {funcion.sala}</p>
                  <p className="price">{formatCurrency(funcion.precio)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial de tiquetes recientes */}
        <div className="card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Tiquetes recientes</h3>
          {tiquetes.length === 0 ? (
            <p>No hay tiquetes vendidos aún.</p>
          ) : (
            <div className="tickets-list">
              {tiquetes.slice(0, 10).map((tiquete) => (
                <div key={tiquete.id} className="ticket-item">
                  <div className="ticket-info">
                    <div className="ticket-code">{tiquete.codigo_unico || tiquete.codigo}</div>
                    <div className="ticket-details">
                      Película ID: {tiquete.pelicula_id} • Asientos: {tiquete.asientos_seleccionados || 'N/A'}
                    </div>
                    <div className={`ticket-status status-${tiquete.estado}`}>
                      {tiquete.estado}
                    </div>
                  </div>
                  <div className="ticket-amount">
                    {formatCurrency(tiquete.pago_total || tiquete.total || 0)}
                  </div>
                  <div className="ticket-date">
                    {new Date(tiquete.created_at).toLocaleString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}