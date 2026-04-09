import React, { useState, useEffect } from 'react';
import '../styles/CineBot.css';

const CineBot = () => {
  const [showBubble, setShowBubble] = useState(true);
  const [isMoving, setIsMoving] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const botMessages = [
    '¡Hola! Me alegra verte por aquí. Ven y disfruta de las pelis geniales. ¿En qué puedo ayudarte?',
    '🍿 ¿Busca recomendaciones?',
    '🎬 ¿Quieres saber sobre nuevos estrenos?',
    '🎟️ ¿Necesita ayuda con tu compra?'
  ];

  useEffect(() => {
    // Ocultar burbuja de diálogo después de 8 segundos
    const bubbleTimer = setTimeout(() => {
      setShowBubble(false);
    }, 8000);

    return () => clearTimeout(bubbleTimer);
  }, []);

  const handleBotClick = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen && messages.length === 0) {
      // Primera vez que se abre el chat
      setMessages([{
        type: 'bot',
        text: botMessages[0]
      }]);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Agregar mensaje del usuario
      setMessages(prev => [...prev, {
        type: 'user',
        text: inputValue
      }]);

      // Simular respuesta del bot
      setTimeout(() => {
        const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
        setMessages(prev => [...prev, {
          type: 'bot',
          text: randomMessage
        }]);
      }, 500);

      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Nube de Diálogo Inicial */}
      {showBubble && !chatOpen && (
        <div className="initial-bubble">
          <div className="bubble-content">
            <p>{botMessages[0]}</p>
            <button
              className="bubble-close"
              onClick={() => setShowBubble(false)}
            >
              ✕
            </button>
          </div>
          <div className="bubble-arrow"></div>
        </div>
      )}

      {/* CineBot */}
      <div className={`cinebot-container ${chatOpen ? 'chat-open' : ''}`}>
        {/* Chat Window */}
        {chatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>🤖 CineBot</h3>
              <button
                className="chat-close"
                onClick={() => setChatOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  {msg.type === 'bot' && <span className="bot-avatar">🤖</span>}
                  <div className="message-content">
                    {msg.text}
                  </div>
                  {msg.type === 'user' && <span className="user-avatar">👤</span>}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Escribe tu pregunta..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="chat-input"
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
              >
                📤
              </button>
            </div>
          </div>
        )}

        {/* Robot */}
        <button
          className="robot-button"
          onClick={handleBotClick}
          aria-label="Abrir CineBot"
        >
          <div className={`robot ${isMoving ? 'moving' : ''}`}>
            {/* Cabeza */}
            <div className="robot-head">
              {/* Ojo izquierdo */}
              <div className="eye eye-left">
                <div className="pupil"></div>
              </div>
              {/* Ojo derecho */}
              <div className="eye eye-right">
                <div className="pupil"></div>
              </div>
              {/* Boca feliz */}
              <div className="mouth"></div>
            </div>

            {/* Cuerpo */}
            <div className="robot-body">
              <div className="antenna"></div>
            </div>

            {/* Brazos */}
            <div className="robot-arms">
              {/* Brazo izquierdo */}
              <div className="arm arm-left">
                <div className="hand"></div>
              </div>
              {/* Brazo derecho */}
              <div className="arm arm-right">
                <div className="hand"></div>
              </div>
            </div>

            {/* Piernas */}
            <div className="robot-legs">
              <div className="leg leg-left"></div>
              <div className="leg leg-right"></div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default CineBot;
