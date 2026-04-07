import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CineBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy CineBot 🤖🎬 Tu asistente de cine. Puedo ayudarte a buscar películas por título o género. ¿Qué película te interesa?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text, sender) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const searchMovies = async (query) => {
    try {
      setIsTyping(true);

      // Buscar por título
      const { data: titleResults, error: titleError } = await supabase
        .from('peliculas')
        .select('*')
        .ilike('titulo', `%${query}%`)
        .limit(5);

      // Buscar por género
      const { data: genreResults, error: genreError } = await supabase
        .from('peliculas')
        .select('*')
        .ilike('genero', `%${query}%`)
        .limit(5);

      if (titleError && genreError) {
        addMessage("Lo siento, tuve un problema buscando películas. Inténtalo de nuevo.", 'bot');
        return;
      }

      const allResults = [...(titleResults || []), ...(genreResults || [])];
      const uniqueResults = allResults.filter((movie, index, self) =>
        index === self.findIndex(m => m.id === movie.id)
      );

      if (uniqueResults.length === 0) {
        addMessage(`No encontré películas que coincidan con "${query}". ¿Puedes ser más específico? Por ejemplo: "acción", "romance", o el título de una película.`, 'bot');
      } else {
        let response = `¡Encontré ${uniqueResults.length} película(s) relacionada(s) con "${query}":\n\n`;

        uniqueResults.forEach((movie, index) => {
          response += `${index + 1}. 🎬 ${movie.titulo}\n`;
          response += `   📝 ${movie.genero} • ${movie.duracion} min\n`;
          if (movie.descripcion) {
            response += `   📖 ${movie.descripcion.substring(0, 100)}...\n`;
          }
          response += '\n';
        });

        response += '¿Te gustaría ver los asientos disponibles para alguna de estas películas?';

        addMessage(response, 'bot');
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      addMessage("Ups, algo salió mal. ¿Puedes intentarlo de nuevo?", 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage(inputValue, 'user');
    const query = inputValue.trim();
    setInputValue('');

    // Simular tiempo de respuesta
    setTimeout(() => {
      searchMovies(query);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="cinebot-container">
      {/* Botón flotante */}
      <button
        className="cinebot-toggle"
        onClick={toggleChat}
        aria-label="Abrir chat de CineBot"
      >
        {isOpen ? '✕' : '🎬'}
      </button>

      {/* Ventana de chat */}
      <div className={`cinebot-chat ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cinebot-header">
          <div className="cinebot-avatar">
            🤖
          </div>
          <div className="cinebot-title">
            <h4>CineBot</h4>
            <p>Asistente de Cine</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="cinebot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
            >
              {message.text}
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Buscando películas</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="cinebot-input-area">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="cinebot-input"
              placeholder="Busca películas por título o género..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
          </form>
        </div>
      </div>
    </div>
  );
}