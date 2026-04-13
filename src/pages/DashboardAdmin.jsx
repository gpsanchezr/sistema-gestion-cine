import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, DollarSign, Users, Film, TicketCheck, Edit, Trash2, Plus } from 'lucide-react';
import '../index.css'; // Global glass

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    ocupacion: 0,
    peliculasCount: 0,
    funcionesCount: 0
  });
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    genero: '',
    duracion: '',
    imagen: '',
    estado: 'activa'
  });

  useEffect(() => {
    loadStats();
    loadPeliculas();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Total ventas
      const { data: ventas } = await supabase
        .from('tiquetes')
        .select('total')
        .eq('estado', 'confirmado'); // Assume estado

      const totalVentas = ventas?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;

      // Ocupacion
      const { count } = await supabase
        .from('detalle_tiquete')
        .select('*', { count: 'exact', head: true });

      const ocupacion = Math.round((count || 0) / 150 * 100);

      setStats({
        totalVentas,
        ocupacion,
        peliculasCount: peliculas.length,
        funcionesCount: 0 // Add query if needed
      });
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPeliculas = async () => {
    const { data } = await supabase.from('peliculas').select('*');
    setPeliculas(data || []);
  };

  const savePelicula = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await supabase.from('peliculas').update(formData).eq('id', editing.id);
      } else {
        await supabase.from('peliculas').insert([formData]);
      }
      loadPeliculas();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const deletePelicula = async (id) => {
    if (confirm('Eliminar?')) {
      await supabase.from('peliculas').delete().eq('id', id);
      loadPeliculas();
    }
  };

  const resetForm = () => {
    setFormData({ titulo: '', descripcion: '', genero: '', duracion: '', imagen: '', estado: 'activa' });
    setEditing(null);
  };

  const SkeletonStats = () => (
    <div className="stats-grid">
      {Array(4).fill().map((_, i) => (
        <div key={i} className="stat-card glass skeleton">
          <div className="skeleton" style={{height: 60}} />
          <div className="skeleton" style={{height: 24, width: '70%'}} />
        </div>
      ))}
    </div>
  );

  if (loading) return <SkeletonStats />;

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <div className="glass tornasol" style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
        <header className="neon-text" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h1><BarChart3 /> Dashboard Admin</h1>
        </header>

        {/* Stats */}
        <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
          <div className="stat-card glass tornasol" style={{padding: '1.5rem', textAlign: 'center'}}>
            <DollarSign style={{color: 'var(--neon-cyan)', marginBottom: '0.5rem'}} />
            <h3>Total Ventas</h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold'}}>${stats.totalVentas.toLocaleString()}</p>
          </div>
          <div className="stat-card glass tornasol" style={{padding: '1.5rem', textAlign: 'center'}}>
            <TicketCheck style={{color: 'var(--neon-pink)', marginBottom: '0.5rem'}} />
            <h3>Ocupación</h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: stats.ocupacion > 80 ? 'var(--neon-pink)' : 'var(--neon-cyan)'}}>
              {stats.ocupacion}%
            </p>
          </div>
          <div className="stat-card glass tornasol" style={{padding: '1.5rem', textAlign: 'center'}}>
            <Film style={{color: 'var(--neon-blue)', marginBottom: '0.5rem'}} />
            <h3>Películas</h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.peliculasCount}</p>
          </div>
        </div>

        {/* CRUD Películas */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{margin: 0}}>Películas</h2>
            <button onClick={() => setEditing(null)} className="btn-comprar" style={{padding: '0.75rem 1.5rem', fontSize: '1rem'}}>
              <Plus size={20} /> Nueva
            </button>
          </div>

          {editing !== null && (
            <form onSubmit={savePelicula} className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <input placeholder="Título" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required />
                <input placeholder="Género" value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})} required />
                <input placeholder="Duración (min)" type="number" value={formData.duracion} onChange={e => setFormData({...formData, duracion: e.target.value})} required />
                <input placeholder="Imagen URL" value={formData.imagen} onChange={e => setFormData({...formData, imagen: e.target.value})} />
                <textarea placeholder="Descripción" rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="submit" className="btn-comprar">{editing ? <Edit size={20} /> : <Plus size={20} />} {editing ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={resetForm} style={{background: 'transparent', color: 'white'}}>Cancelar</button>
              </div>
            </form>
          )}

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
            {peliculas.map(pelicula => (
              <div key={pelicula.id} className="glass tornasol" style={{padding: '1.5rem', position: 'relative'}}>
                {pelicula.imagen && <img src={pelicula.imagen} alt={pelicula.titulo} style={{width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: '1rem'}} />}
                <h3>{pelicula.titulo}</h3>
                <p>{pelicula.genero} • {pelicula.duracion}min</p>
                <div style={{position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem'}}>
                  <button onClick={() => {
                    setEditing(pelicula);
                    setFormData(pelicula);
                  }} title="Editar">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deletePelicula(pelicula.id)} title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

