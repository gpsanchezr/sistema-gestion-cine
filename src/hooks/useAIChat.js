import { useState, useCallback } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Hook para comunicarse con el chatbot IA backend
 * Maneja:
 * - Envío de mensajes
 * - Gestión de historial
 * - Errores y estados de carga
 */
export const useAIChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Respuestas predeterminadas si el backend no está disponible
  const getLocalResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('cartelera') || q.includes('pelicula')) {
      return '📋 Para ver la cartelera, puedo ayudarte a buscar películas específicas o recomendarte según tus gustos. ¿Qué tipo de película prefieres? 🎬';
    }

    if (q.includes('precio') || q.includes('cuanto')) {
      return '💰 Nuestros precios:\n• General $15.000\n• Preferencial $22.000\n• SENA 20% off';
    }

    if (q.includes('promo') || q.includes('sena') || q.includes('descuent')) {
      return '🎁 Promociones activas:\n• 2x1 Miércoles\n• Familiar 15%\n• SENA 20% descuento';
    }

    if (q.includes('donde') || q.includes('ubicacion') || q.includes('direccion')) {
      return '📍 Centro Comercial Viva\nCarrera 65 #20-50\nBarranquilla\n📞 Cerca de estación de bus';
    }

    if (q.includes('comprar') || q.includes('boleta') || q.includes('tiquete')) {
      return '🎟️ ¿Qué película te gustaría ver? Dame el nombre y te muestro horarios y precios para que compres directamente.';
    }

    return '😊 Soy CineBot, tu asistente de cine. Puedo ayudarte con:\n• 🎬 Películas y horarios\n• 💰 Precios y promociones\n• 🎟️ Compra de tiquetes\n• 📍 Ubicación del cine';
  };

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage?.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          message: userMessage
        })
      });

      let botResponse;

      if (!response.ok) {
        console.warn('Backend unavailable, using local responses');
        botResponse = getLocalResponse(userMessage);
      } else {
        const data = await response.json();
        botResponse = data.response || data.error || 'No response received';
      }

      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'bot', content: botResponse }
      ]);

      return botResponse;
    } catch (err) {
      console.error('Chat error:', err);
      const localResponse = getLocalResponse(userMessage);

      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'bot', content: localResponse }
      ]);

      setError(err.message);
      return localResponse;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};

/**
 * Hook para obtener películas del backend
 */
export const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/movies`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { movies, loading, error, fetchMovies };
};

/**
 * Hook para obtener funciones de una película
 */
export const useFunctions = (movieId) => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFunctions = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/movies/${movieId}/functions`);
      if (!response.ok) throw new Error('Failed to fetch functions');
      const data = await response.json();
      setFunctions(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching functions:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  return { functions, loading, error, fetchFunctions };
};

/**
 * Hook para obtener asientos disponibles de una función
 */
export const useSeats = (functionId) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async () => {
    if (!functionId) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/functions/${functionId}/seats`);
      if (!response.ok) throw new Error('Failed to fetch seats');
      const data = await response.json();
      setSeats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching seats:', err);
    } finally {
      setLoading(false);
    }
  }, [functionId]);

  return { seats, loading, error, fetchSeats };
};

/**
 * Hook para procesar compra de tiquetes
 */
export const usePurchaseTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const purchaseTicket = useCallback(async (userId, functionId, seatIds, total) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/purchase-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          functionId,
          seatIds,
          total
        })
      });

      if (!response.ok) throw new Error('Purchase failed');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Purchase failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { purchaseTicket, loading, error };
};
