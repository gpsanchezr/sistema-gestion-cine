/**
 * Store Global con Zustand
 * Gestión de estado profesional
 */

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

export const useCineBotStore = create((set) => ({
  // ==================== ESTADO GLOBAL ====================
  
  // Conversación
  messages: [],
  isOpen: false,
  isLoading: false,
  botStatus: 'ready', // ready | typing | error | loading
  selectedMovie: null,
  showIntro: true,
  
  // Películas
  movies: [],
  moviesLoaded: false,
  
  // Configuración
  theme: 'dark',
  fontSize: 'normal',
  soundEnabled: true,
  
  // ==================== ACCIONES ====================
  
  // Mensajes
  addMessage: (content, role = 'user', metadata = {}) =>
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random()}`,
          content,
          role,
          timestamp: new Date(),
          metadata
        }
      ]
    })),
  
  clearMessages: () => set({ messages: [], showIntro: true }),
  
  // Chat UI
  setIsOpen: (isOpen) => set({ isOpen }),
  setShowIntro: (showIntro) => set({ showIntro }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setBotStatus: (botStatus) => set({ botStatus }),
  
  // Películas
  setMovies: (movies) => set({ movies, moviesLoaded: true }),
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  
  // Configuración
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
  
  // Reset completo
  reset: () => set({
    messages: [],
    isOpen: false,
    isLoading: false,
    botStatus: 'ready',
    selectedMovie: null,
    showIntro: true,
    theme: 'dark',
    soundEnabled: true
  })
}));

/**
 * Hook para acceder a estado específico (memoizados con comparación superficial)
 */

export const useCineBotMessages = () =>
  useCineBotStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    clearMessages: state.clearMessages
  }), shallow);

export const useCineBotUI = () =>
  useCineBotStore((state) => ({
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    botStatus: state.botStatus,
    setBotStatus: state.setBotStatus,
    showIntro: state.showIntro,
    setShowIntro: state.setShowIntro
  }), shallow);

export const useCineBotMovies = () =>
  useCineBotStore(state => ({
    movies: state.movies,
    setMovies: state.setMovies,
    selectedMovie: state.selectedMovie,
    setSelectedMovie: state.setSelectedMovie,
    moviesLoaded: state.moviesLoaded
  }), shallow);

export const useCineBotSettings = () =>
  useCineBotStore(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
    soundEnabled: state.soundEnabled,
    toggleSound: state.toggleSound,
    fontSize: state.fontSize
  }));
