import React, { useState } from 'react';
import { DeepChat } from 'deep-chat-react';

const CineBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(45deg, #ff0080, #00d2ff)',
          border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer'
        }}
      >
        {isOpen ? '✖' : '💬'}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '70px', right: '0',
          width: '350px', height: '500px', borderRadius: '20px',
          overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
          <DeepChat
            introMessage={{ text: '¡Hola! Soy tu asistente de CinemaHub. 🍿 ¿Qué película te interesa?' }}
            request={{
              url: 'http://localhost:5000/chat', 
              method: 'POST'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CineBot;
