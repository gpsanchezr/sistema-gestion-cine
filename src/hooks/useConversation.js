/**
 * Hook profesional para gestionar conversaciones del chat
 * Inspirado en Assistant-UI arquitectura
 */

import { useState, useCallback, useRef, useEffect, useReducer } from 'react';

// Estructura de mensaje profesional
export const createMessage = (content, role = 'user', metadata = {}) => ({
  id: `${Date.now()}-${Math.random()}`,
  content,
  role, // 'user' | 'assistant'
  timestamp: new Date(),
  status: 'sent', // 'sending' | 'sent' | 'error'
  metadata: {
    intent: null,
    confidence: 0,
    ...metadata
  }
});

// Action types
const ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Reducer para estado del chat
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        history: [...state.history, state.messages]
      };

    case ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      };

    case ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };

    case ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        history: [state.messages]
      };

    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        messages: [
          ...state.messages,
          createMessage(
            action.payload,
            'system',
            { type: 'error' }
          )
        ]
      };

    case ACTIONS.UNDO:
      if (state.history.length === 0) return state;
      const prevMessages = state.history[state.history.length - 1];
      return {
        ...state,
        messages: prevMessages,
        history: state.history.slice(0, -1)
      };

    case ACTIONS.REDO:
      if (state.futureHistory.length === 0) return state;
      const nextMessages = state.futureHistory[0];
      return {
        ...state,
        messages: nextMessages,
        futureHistory: state.futureHistory.slice(1)
      };

    default:
      return state;
  }
};

/**
 * Hook principal para gestionar conversación
 */
export function useConversation() {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    history: [],
    futureHistory: [],
    isLoading: false,
    error: null
  });

  const messagesRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Agregar mensaje
  const addMessage = useCallback((content, role = 'user', metadata = {}) => {
    const message = createMessage(content, role, metadata);
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
    return message;
  }, []);

  // Agregar mensaje del usuario
  const addUserMessage = useCallback((content) => {
    return addMessage(content, 'user');
  }, [addMessage]);

  // Agregar mensaje del bot
  const addAssistantMessage = useCallback((content, metadata = {}) => {
    return addMessage(content, 'assistant', metadata);
  }, [addMessage]);

  // Actualizar mensaje
  const updateMessage = useCallback((messageId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_MESSAGE,
      payload: { id: messageId, updates }
    });
  }, []);

  // Eliminar mensaje
  const deleteMessage = useCallback((messageId) => {
    dispatch({ type: ACTIONS.DELETE_MESSAGE, payload: messageId });
  }, []);

  // Limpiar conversación
  const clearMessages = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES });
  }, []);

  // Set loading
  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  // Set error
  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ACTIONS.REDO });
  }, []);

  // Obtener contexto de conversación
  const getContext = useCallback(() => {
    const userMessages = state.messages
      .filter(m => m.role === 'user')
      .slice(-5) // Últimos 5 mensajes
      .map(m => m.content);

    const assistantMessages = state.messages
      .filter(m => m.role === 'assistant')
      .slice(-5)
      .map(m => m.content);

    return {
      messages: state.messages,
      userMessages,
      assistantMessages,
      totalMessages: state.messages.length,
      lastMessage: state.messages[state.messages.length - 1]
    };
  }, [state.messages]);

  // Buscar en conversación
  const search = useCallback((query) => {
    return state.messages.filter(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [state.messages]);

  return {
    // Estado
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    messagesRef,

    // Acciones
    addMessage,
    addUserMessage,
    addAssistantMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    setLoading,
    setError,
    undo,
    redo,

    // Utilities
    getContext,
    search,
    messageCount: state.messages.length,
    hasMessages: state.messages.length > 0,
    canUndo: state.history.length > 0
  };
}

/**
 * Hook para rate limiting
 */
export function useRateLimit(maxMessages = 10, timeWindow = 60000) {
  const [messageTimes, setMessageTimes] = useState([]);

  const checkLimit = useCallback(() => {
    const now = Date.now();
    const recentMessages = messageTimes.filter(
      time => now - time < timeWindow
    );

    if (recentMessages.length >= maxMessages) {
      return false;
    }

    setMessageTimes([...recentMessages, now]);
    return true;
  }, [messageTimes, timeWindow, maxMessages]);

  const reset = useCallback(() => {
    setMessageTimes([]);
  }, []);

  return { checkLimit, reset };
}

/**
 * Hook para debounce de input
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para validación de input
 */
export function useInputValidation() {
  const validate = useCallback((input) => {
    if (!input) return { valid: false, error: 'El campo no puede estar vacío' };
    if (input.trim().length < 2) return { valid: false, error: 'Debe tener al menos 2 caracteres' };
    if (input.length > 500) return { valid: false, error: 'Máximo 500 caracteres' };

    // Detectar spam
    const spamPatterns = [
      /[A-Z]{20,}/, // Todas mayúsculas
      /(.)(\1){20,}/, // Caracteres repetidos
      /(\d+\s*){20,}/ // Muchos números
    ];

    if (spamPatterns.some(pattern => pattern.test(input))) {
      return { valid: false, error: 'Input parece ser spam' };
    }

    return { valid: true, error: null };
  }, []);

  return { validate };
}
