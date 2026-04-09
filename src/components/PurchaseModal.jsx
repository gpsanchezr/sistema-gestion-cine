import React, { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/PurchaseModal.css';

const seatMap = Array.from({ length: 16 }, (_, index) => index + 1);

const PurchaseModal = ({ pelicula, onClose, onConfirm, user }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedFunctionIndex, setSelectedFunctionIndex] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  const availableFunction = pelicula?.funciones?.[selectedFunctionIndex] || {};

  const qrPayload = useMemo(() => {
    if (!pelicula || !availableFunction || selectedSeats.length === 0) return null;
    return {
      movieTitle: pelicula.titulo,
      sala: availableFunction.sala,
      fecha: `${availableFunction.dia}/${availableFunction.mes}/${availableFunction.año}`,
      hora: availableFunction.hora,
      seats: selectedSeats.join(', '),
      customer: user?.name || user?.email
    };
  }, [pelicula, availableFunction, selectedSeats, user]);

  if (!pelicula) {
    return null;
  }

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
      return;
    }
    setSelectedSeats([...selectedSeats, seatNumber]);
  };

  const handleConfirm = async () => {
    if (!selectedSeats.length) {
      alert('Selecciona al menos un asiento.');
      return;
    }

    setPaymentStatus('processing');

    const ticket = {
      movieId: pelicula.id,
      movieTitle: pelicula.titulo,
      sala: availableFunction.sala,
      fecha: `${availableFunction.dia}/${availableFunction.mes}/${availableFunction.año}`,
      hora: availableFunction.hora,
      seats: selectedSeats,
      formato: pelicula.formato,
      total: selectedSeats.length * 18000,
      customerName: user?.name || user?.email,
      customerEmail: user?.email,
      qrText: JSON.stringify({
        movie: pelicula.titulo,
        sala: availableFunction.sala,
        fecha: `${availableFunction.dia}/${availableFunction.mes}/${availableFunction.año}`,
        hora: availableFunction.hora,
        seats: selectedSeats
      })
    };

    await onConfirm(ticket);
    setPaymentStatus('success');
  };

  return (
    <div className="purchase-modal-overlay">
      <div className="purchase-modal glass">
        <div className="purchase-header">
          <div>
            <span className="tag">Compra de Tiquete</span>
            <h2>{pelicula.titulo}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="purchase-body">
          <div className="purchase-details">
            <div className="field-grid">
              <div>
                <label>Formato</label>
                <span>{pelicula.formato || '2D'}</span>
              </div>
              <div>
                <label>Fecha de estreno</label>
                <span>{pelicula.fecha || '2026-01-01'}</span>
              </div>
            </div>

            <div className="field-grid">
              <div>
                <label>Selecciona función</label>
                <select
                  value={selectedFunctionIndex}
                  onChange={(e) => setSelectedFunctionIndex(Number(e.target.value))}
                >
                  {(pelicula?.funciones || []).map((func, index) => (
                    <option key={func.id || index} value={index}>
                      Sala {func.sala} - {func.dia}/{func.mes}/{func.año} · {func.hora}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Precio</label>
                <span>{selectedSeats.length * 18000} COP</span>
              </div>
            </div>

            <div className="seats-grid">
              {seatMap.map((seat) => (
                <button
                  key={seat}
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className={selectedSeats.includes(seat) ? 'seat selected' : 'seat'}
                >
                  {seat}
                </button>
              ))}
            </div>

            <div className="purchase-actions">
              <button className="pay-btn" type="button" onClick={handleConfirm}>
                {paymentStatus === 'processing' ? 'Procesando...' : 'Simular Pago'}
              </button>
              <button className="secondary-btn" type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>

          <div className="purchase-sidebar">
            <div className="summary-card">
              <h3>Resumen</h3>
              <p><strong>Cliente:</strong> {user?.name || user?.email}</p>
              <p><strong>Ciudades:</strong> {pelicula.ciudad || 'Global'}</p>
              <p><strong>Asientos:</strong> {selectedSeats.length || 0}</p>
              <p><strong>Función:</strong> Sala {availableFunction.sala}</p>
              <p><strong>Hora:</strong> {availableFunction.hora}</p>
              <p><strong>Total:</strong> {(selectedSeats.length * 18000).toLocaleString()} COP</p>
            </div>

            {paymentStatus === 'success' && qrPayload && (
              <div className="qr-card">
                <h4>QR del Tiquete</h4>
                <QRCodeCanvas value={JSON.stringify(qrPayload)} size={160} bgColor="#0b0f24" fgColor="#ff006e" />
                <p>Escanea el código con tu entrada digital.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;