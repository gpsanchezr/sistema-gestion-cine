import React, { useState, useEffect } from 'react';
import '../styles/CineBot.css';

const CineBot = ({ peliculas = [], user, isAuthenticated }) => {
  const [showBubble, setShowBubble] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [awaitingMonthSelection, setAwaitingMonthSelection] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  const getGreetingMessage = () => {
    if (!isAuthenticated) {
      return '¡Hola cineasta! Bienvenido a la cartelera de las mejores películas que hay, ¿en qué puedo ayudarte?';
    }
    const userName = user?.name || user?.email?.split('@')[0] || 'Cinemasta';
    return `¡Hola ${userName}! Bienvenido de nuevo a CinemaHub. ¿En qué puedo ayudarte hoy?`;
  };

  useEffect(() => {
    const bubbleTimer = setTimeout(() => {
      setShowBubble(false);
    }, 8000);

    return () => clearTimeout(bubbleTimer);
  }, []);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { type: 'bot', text }]);
  };

  const handleBotClick = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen && messages.length === 0) {
      setMessages([
        { type: 'bot', text: getGreetingMessage() },
        { type: 'bot', text: '¿Viste las películas? ¿Cuál te gustó más?' }
      ]);
    }
  };

  const findMovieByText = (text) => {
    const lower = text.toLowerCase();
    return peliculas.find((pelicula) => pelicula.titulo?.toLowerCase().includes(lower));
  };

  const getTodayFunctions = () => {
    const hoy = new Date().toDateString();
    return peliculas.flatMap((pelicula) => (pelicula.funciones || []).filter((func) => {
      const fecha = new Date(`${func.año}-${String(func.mes).padStart(2, '0')}-${String(func.dia).padStart(2, '0')}T${func.hora || '00:00'}`);
      return fecha.toDateString() === hoy;
    })).map((func) => ({ ...func, titulo: peliculas.find((p) => (p.funciones || []).some((f) => f.id === func.id))?.titulo || 'Película' }));
  };

  const getReleaseDate = (pelicula) => {
    if (!pelicula?.fecha_estreno) return 'Fecha de estreno no definida';
    return new Date(pelicula.fecha_estreno).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getFutureMonthsWithMovies = () => {
    const hoy = new Date();
    const meses = new Set();
    peliculas.forEach((pelicula) => {
      (pelicula.funciones || []).forEach((func) => {
        const fecha = new Date(`${func.año}-${String(func.mes).padStart(2, '0')}-${String(func.dia).padStart(2, '0')}T${func.hora || '00:00'}`);
        if (fecha > hoy) {
          meses.add(func.mes);
        }
      });
    });
    return Array.from(meses).sort((a, b) => a - b);
  };

  const generateBotResponse = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes('estrenos')) {
      const estrenos = peliculas.filter((pelicula) => pelicula.estado === 'proximamente');
      if (estrenos.length === 0) {
        return 'No hay estrenos programados por ahora, pero pronto tendremos nuevos títulos en cartelera.';
      }
      return `Estos son los estrenos más recientes: ${estrenos.map((p) => p.titulo).join(', ')}.`;
    }

    if (lower.includes('funciones de hoy') || lower.includes('funciones hoy')) {
      const hoy = getTodayFunctions();
      if (hoy.length === 0) {
        return 'Hoy no hay funciones programadas. Revisa próximamente o cambia de día.';
      }
      return `Hoy hay ${hoy.length} funciones disponibles. Por ejemplo: ${hoy.slice(0, 3).map((func) => `${func.titulo} a las ${func.hora}`).join(', ')}.`;
    }

    if (lower.includes('películas disponibles hoy')) {
      const hoy = new Date().toDateString();
      const peliculasHoy = peliculas.filter((pelicula) => 
        (pelicula.funciones || []).some((func) => {
          const fecha = new Date(`${func.año}-${String(func.mes).padStart(2, '0')}-${String(func.dia).padStart(2, '0')}T${func.hora || '00:00'}`);
          return fecha.toDateString() === hoy;
        })
      );
      if (peliculasHoy.length === 0) {
        return 'Hoy no hay películas disponibles. Revisa próximamente.';
      }
      const lista = peliculasHoy.map((p) => p.titulo).join(', ');
      setTimeout(() => {
        addBotMessage('¿Quieres ver las demás películas disponibles que se emitirán después?');
        setAwaitingMonthSelection(true);
      }, 1000);
      return `Películas disponibles hoy: ${lista}.`;
    }

    const matchInfo = lower.match(/información de (.+)|info de (.+)|sobre (.+)|película (.+)/);
    if (matchInfo) {
      const titleSearch = matchInfo.slice(1).find(Boolean)?.trim();
      if (!titleSearch || titleSearch === 'película' || titleSearch === 'la película') {
        return 'Dime el nombre de la película sobre la que quieres información, por ejemplo: "Información de Avatar".';
      }
      const pelicula = findMovieByText(titleSearch);
      if (pelicula) {
        const funciones = pelicula.funciones || [];
        const funcion = funciones[0];
        const sala = funcion ? (funcion.sala_nombre ? `Sala ${funcion.sala} - ${funcion.sala_nombre}` : `Sala ${funcion.sala}`) : 'sin funciones disponibles';
        return `La película ${pelicula.titulo} está ${pelicula.estado === 'proximamente' ? 'próximamente' : 'en cartelera'}. Estreno: ${getReleaseDate(pelicula)}. ${formatSynopsis(pelicula)} Se proyecta en ${sala}${funcion ? ` a las ${funcion.hora}` : ''}.`;
      }
      return 'No encontré esa película en la cartelera. Prueba con otro nombre o revisa los títulos disponibles.';
    }

    if (lower.includes('hola') || lower.includes('hi') || lower.includes('buenas')) {
      return getGreetingMessage();
    }

    return 'Puedo ayudarte con estrenos, funciones de hoy o información de alguna película. Prueba con: "Ver estrenos", "Funciones de hoy" o "Información de [Nombre Película]".';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInputValue('');

    if (awaitingMonthSelection) {
      const lower = userMessage.toLowerCase();
      if (lower.includes('sí') || lower.includes('si') || lower.includes('yes')) {
        const meses = getFutureMonthsWithMovies();
        if (meses.length === 0) {
          addBotMessage('No hay películas programadas para el futuro.');
          setAwaitingMonthSelection(false);
          return;
        }
        setShowMonthSelect(true);
        setAwaitingMonthSelection(false);
        return;
      } else {
        addBotMessage('Entendido. ¿En qué más puedo ayudarte?');
        setAwaitingMonthSelection(false);
      }
      return;
    }

    setTimeout(() => {
      const botAnswer = generateBotResponse(userMessage);
      addBotMessage(botAnswer);
    }, 500);
  };

  const handleQuickAction = (action) => {
    const actionMap = {
      'Ver estrenos': 'estrenos',
      'Funciones de hoy': 'funciones de hoy',
      'Películas disponibles hoy': 'películas disponibles hoy'
    };

    const query = actionMap[action] || action;
    setMessages((prev) => [...prev, { type: 'user', text: action }]);
    setTimeout(() => {
      const botAnswer = generateBotResponse(query);
      addBotMessage(botAnswer);
    }, 300);
  };

  const handleMonthSelect = (mes) => {
    if (!mes) return;
    const mesNum = parseInt(mes);
    const peliculasMes = peliculas.filter((pelicula) => 
      (pelicula.funciones || []).some((func) => func.mes === mesNum)
    );
    const lista = peliculasMes.map((p) => p.titulo).join(', ');
    addBotMessage(`Películas en ${new Date(2000, mesNum - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}: ${lista || 'Ninguna'}`);
    setShowMonthSelect(false);
  };

  return (
    <>
      {showBubble && !chatOpen && (
        <div className="greeting-bubble">
          <p className="greeting-text">
            <span className="greeting-highlight">CineBot</span> te da la bienvenida.
          </p>
        </div>
      )}

      <div className="cinebot-container">
        {chatOpen && (
          <div className="cinebot-body">
            <div className="bot-head">
              <div className="bot-face">
                <div className="bot-eyes">
                  <div className="bot-eye"></div>
                  <div className="bot-eye"></div>
                </div>
              </div>
              <div className="bot-arms">
                <div className="bot-arm left"></div>
                <div className="bot-arm right"></div>
              </div>
            </div>

            <div className="bot-torso">
              <div className="bot-name">🤖 CineBot</div>
              <div className="bot-status">Asistente Virtual</div>

              <div className="quick-actions">
                <button type="button" className="quick-btn" onClick={() => handleQuickAction('Ver estrenos')}>Ver estrenos</button>
                <button type="button" className="quick-btn" onClick={() => handleQuickAction('Funciones de hoy')}>Funciones de hoy</button>
                <button type="button" className="quick-btn" onClick={() => handleQuickAction('Películas disponibles hoy')}>Películas disponibles hoy</button>
              </div>

              <div className="bot-messages" style={{ overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.type}`}>
                    <div className="message-content">{msg.text}</div>
                  </div>
                ))}
              </div>

              {showMonthSelect && (
                <div className="month-select">
                  <select onChange={(e) => handleMonthSelect(e.target.value)}>
                    <option value="">Selecciona un mes</option>
                    {getFutureMonthsWithMovies().map((mes) => (
                      <option key={mes} value={mes}>
                        {new Date(2000, mes - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bot-input-area">
                <input
                  type="text"
                  placeholder="Pregúntame algo..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bot-input"
                />
                <button className="send-btn" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                  📤
                </button>
              </div>
            </div>
          </div>
        )}

        <button className={`cinebot-toggle ${chatOpen ? 'active' : ''}`} onClick={handleBotClick} aria-label="Abrir CineBot">
          <span className="bot-icon">🤖</span>
        </button>
      </div>
    </>
  );
};

export default CineBot;
