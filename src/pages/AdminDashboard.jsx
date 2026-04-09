import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/Auth.jsx';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout, tickets, validateTicket, isAdmin } = useAuth();
  const [peliculas, setPeliculas] = useState(() => {
    const stored = localStorage.getItem('peliculas');
    return stored ? JSON.parse(stored) : [];
  });
  const [newPelicula, setNewPelicula] = useState({
    titulo: '',
    genero: '',
    descripcion: '',
    formato: '2D',
    fecha: '',
    poster: '',
    funciones: [],
    preventa: false,
    estrenos: false
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTicket, setSearchTicket] = useState('');
  const [filteredTickets, setFilteredTickets] = useState(tickets);

  useEffect(() => {
    setFilteredTickets(tickets.filter(ticket =>
      ticket.id.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTicket.toLowerCase())
    ));
  }, [tickets, searchTicket]);

  if (!isAdmin) {
    return <div>No tienes permisos para acceder a esta página.</div>;
  }

  const savePelicula = () => {
    if (editingId) {
      setPeliculas(peliculas.map(p => p.id === editingId ? { ...newPelicula, id: editingId } : p));
    } else {
      const pelicula = { ...newPelicula, id: Date.now().toString() };
      setPeliculas([...peliculas, pelicula]);
    }
    setNewPelicula({
      titulo: '',
      genero: '',
      descripcion: '',
      formato: '2D',
      fecha: '',
      poster: '',
      funciones: [],
      preventa: false,
      estrenos: false
    });
    setEditingId(null);
    localStorage.setItem('peliculas', JSON.stringify(peliculas));
  };

  const editPelicula = (pelicula) => {
    setNewPelicula(pelicula);
    setEditingId(pelicula.id);
  };

  const deletePelicula = (id) => {
    setPeliculas(peliculas.filter(p => p.id !== id));
    localStorage.setItem('peliculas', JSON.stringify(peliculas.filter(p => p.id !== id)));
  };

  const addFuncion = () => {
    setNewPelicula({
      ...newPelicula,
      funciones: [...newPelicula.funciones, { sala: '', dia: '', mes: '', año: '', hora: '' }]
    });
  };

  const updateFuncion = (index, field, value) => {
    const updatedFunciones = newPelicula.funciones.map((func, i) =>
      i === index ? { ...func, [field]: value } : func
    );
    setNewPelicula({ ...newPelicula, funciones: updatedFunciones });
  };

  const removeFuncion = (index) => {
    setNewPelicula({
      ...newPelicula,
      funciones: newPelicula.funciones.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel de Administrador</h1>
        <div className="admin-info">
          <span>👤 {user?.email}</span>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="admin-content">
        <section className="peliculas-section">
          <h2>Gestión de Películas</h2>
          <div className="form-card">
            <h3>{editingId ? 'Editar Película' : 'Nueva Película'}</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Título"
                value={newPelicula.titulo}
                onChange={(e) => setNewPelicula({ ...newPelicula, titulo: e.target.value })}
              />
              <input
                type="text"
                placeholder="Género"
                value={newPelicula.genero}
                onChange={(e) => setNewPelicula({ ...newPelicula, genero: e.target.value })}
              />
              <input
                type="text"
                placeholder="Formato"
                value={newPelicula.formato}
                onChange={(e) => setNewPelicula({ ...newPelicula, formato: e.target.value })}
              />
              <input
                type="date"
                placeholder="Fecha de estreno"
                value={newPelicula.fecha}
                onChange={(e) => setNewPelicula({ ...newPelicula, fecha: e.target.value })}
              />
              <input
                type="text"
                placeholder="URL del póster"
                value={newPelicula.poster}
                onChange={(e) => setNewPelicula({ ...newPelicula, poster: e.target.value })}
              />
              <textarea
                placeholder="Descripción"
                value={newPelicula.descripcion}
                onChange={(e) => setNewPelicula({ ...newPelicula, descripcion: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={newPelicula.preventa}
                  onChange={(e) => setNewPelicula({ ...newPelicula, preventa: e.target.checked })}
                />
                Preventa
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newPelicula.estrenos}
                  onChange={(e) => setNewPelicula({ ...newPelicula, estrenos: e.target.checked })}
                />
                Estrenos Próximos
              </label>
            </div>
            <div className="funciones-section">
              <h4>Funciones</h4>
              {newPelicula.funciones.map((func, index) => (
                <div key={index} className="funcion-item">
                  <input
                    type="text"
                    placeholder="Sala"
                    value={func.sala}
                    onChange={(e) => updateFuncion(index, 'sala', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Día"
                    value={func.dia}
                    onChange={(e) => updateFuncion(index, 'dia', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Mes"
                    value={func.mes}
                    onChange={(e) => updateFuncion(index, 'mes', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Año"
                    value={func.año}
                    onChange={(e) => updateFuncion(index, 'año', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Hora"
                    value={func.hora}
                    onChange={(e) => updateFuncion(index, 'hora', e.target.value)}
                  />
                  <button onClick={() => removeFuncion(index)}>Eliminar</button>
                </div>
              ))}
              <button onClick={addFuncion}>Agregar Función</button>
            </div>
            <button onClick={savePelicula}>{editingId ? 'Actualizar' : 'Guardar'}</button>
          </div>

          <div className="peliculas-list">
            {peliculas.map(pelicula => (
              <div key={pelicula.id} className="pelicula-item">
                <h4>{pelicula.titulo}</h4>
                <p>{pelicula.genero} - {pelicula.formato}</p>
                <button onClick={() => editPelicula(pelicula)}>Editar</button>
                <button onClick={() => deletePelicula(pelicula.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="tickets-section">
          <h2>Validación de Tiquetes</h2>
          <input
            type="text"
            placeholder="Buscar tiquete por ID o email"
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
          />
          <div className="tickets-list">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="ticket-item">
                <p><strong>ID:</strong> {ticket.id}</p>
                <p><strong>Película:</strong> {ticket.movieTitle}</p>
                <p><strong>Cliente:</strong> {ticket.customerEmail}</p>
                <p><strong>Asientos:</strong> {ticket.seats.join(', ')}</p>
                <p><strong>Estado:</strong> {ticket.validated ? 'Validado' : 'Pendiente'}</p>
                {!ticket.validated && (
                  <button onClick={() => validateTicket(ticket.id)}>Validar</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;