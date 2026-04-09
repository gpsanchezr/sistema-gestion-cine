import React, { useState } from 'react';
import { useAuth } from '../context/Auth.jsx';
import PurchaseModal from '../components/PurchaseModal';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user, createTicket } = useAuth();
  const navigate = useNavigate();
  const [selectedPelicula, setSelectedPelicula] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Simular selección de película (en producción vendría de props o state)
  const peliculaEjemplo = {
    id: '1',
    titulo: 'Ejemplo Película',
    genero: 'Acción',
    descripcion: 'Una película de ejemplo',
    formato: '2D',
    fecha: '2026-04-10',
    funciones: [
      { id: '1', sala: '1', dia: '10', mes: '4', año: '2026', hora: '20:00' }
    ]
  };

  const handleCompra = (pelicula) => {
    setSelectedPelicula(pelicula);
    setShowModal(true);
  };

  const handlePagoExitoso = async (ticketData) => {
    await createTicket(ticketData);
    alert('Compra completada. Revisa tu email.');
    navigate('/home');
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <button onClick={() => handleCompra(peliculaEjemplo)}>Comprar Ejemplo</button>
      {showModal && (
        <PurchaseModal
          pelicula={selectedPelicula}
          onClose={() => setShowModal(false)}
          onConfirm={handlePagoExitoso}
          user={user}
        />
      )}
    </div>
  );
};

export default Checkout;