import { init, send } from '@emailjs/browser';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || import.meta.env.VITE_EMAILJS_USER_ID;

if (publicKey) {
  init(publicKey);
}

export const sendTicketEmail = async (ticket) => {
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS no está configurado. Define VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID y VITE_EMAILJS_PUBLIC_KEY.');
    return false;
  }

  const templateParams = {
    movie: ticket.movieTitle,
    date: ticket.fecha,
    hour: ticket.hora,
    sala: ticket.sala,
    seats: ticket.seats.join(', '),
    client_name: ticket.customerName || ticket.customerEmail,
    client_email: ticket.customerEmail,
    ticket_id: ticket.id,
    qr_text: ticket.qrText,
    owner_email: import.meta.env.VITE_CINEMA_OWNER_EMAIL || 'dueno@cine.com'
  };

  try {
    const response = await send(serviceId, templateId, templateParams, publicKey);
    return response;
  } catch (error) {
    console.error('Error enviando EmailJS:', error);
    return false;
  }
};