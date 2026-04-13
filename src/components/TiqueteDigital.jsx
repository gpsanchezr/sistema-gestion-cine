import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // npm install qrcode.react

const TiqueteDigital = ({ tiquete, pelicula, funcion, asientos, onClose }) => {
  const nombreCliente = 'Giseella Sanchez'; // Hardcoded as requested
  const fechaCompra = new Date().toLocaleString('es-CO');
  const fechaHora = new Date(funcion.fecha_hora).toLocaleString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="tiquete-modal-overlay" onClick={onClose}>
      <div className="tiquete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tiquete-header">
          <h2>CinemaHub SENA</h2>
          <div className="tiquete-perforado"></div>
        </div>
        
        <div className="tiquete-body">
          <div className="tiquete-datos">
            <p><strong>Cliente:</strong> {nombreCliente}</p>
            <p><strong>Película:</strong> {pelicula.titulo}</p>
            <p><strong>Sala:</strong> {funcion.sala}</p>
            <p><strong>Fecha/Hora:</strong> {fechaHora}</p>
            <p><strong>Asientos:</strong> {asientos.join(', ')}</p>
            <p><strong>Total:</strong> {tiquete.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
            <p><strong>Código:</strong> <span className="codigo-unico">{tiquete.codigo}</span></p>
          </div>
          
          <div className="qr-container">
            <QRCodeCanvas value={tiquete.codigo} size={160} />
            <p>Escanea para validar</p>
          </div>
        </div>
        
        <div className="tiquete-footer">
          <div className="tiquete-perforado"></div>
          <p>¡Disfruta la película! 🎬</p>
          <p className="estado">Estado: Válido</p>
        </div>
        
        <button className="cerrar-tiquete" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default TiqueteDigital;

