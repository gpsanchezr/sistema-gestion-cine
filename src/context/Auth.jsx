import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const localProfilesKey = 'cinema_profiles';
const localTicketsKey = 'cinema_tickets';

const loadLocalProfiles = () => {
  const stored = localStorage.getItem(localProfilesKey);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalProfile = (profile) => {
  const profiles = loadLocalProfiles().filter((item) => item.email !== profile.email);
  localStorage.setItem(localProfilesKey, JSON.stringify([...profiles, profile]));
};

const loadLocalTickets = () => {
  const stored = localStorage.getItem(localTicketsKey);
  return stored ? JSON.parse(stored) : [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCiudad = localStorage.getItem('ciudad');
    const storedTickets = loadLocalTickets();

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }

    if (storedCiudad) {
      setCiudad(storedCiudad);
    }

    if (storedTickets) {
      setTickets(storedTickets);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (ciudad) {
      localStorage.setItem('ciudad', ciudad);
    }
  }, [ciudad]);

  useEffect(() => {
    localStorage.setItem(localTicketsKey, JSON.stringify(tickets));
  }, [tickets]);

  const setCiudadGlobal = (value) => {
    setCiudad(value);
    localStorage.setItem('ciudad', value);
  };

  const fetchProfile = async (email) => {
    // Primero intentar Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('email', email)
        .single();
      if (!error && data) {
        return data;
      }
    }

    // Fallback a localStorage
    const profiles = loadLocalProfiles();
    const localProfile = profiles.find((item) => item.email === email);
    return localProfile || null;
  };

  const insertProfile = async (profile) => {
    // Guardar en Supabase
    if (supabase) {
      const { error } = await supabase.from('perfiles').insert([profile]);
      if (error) {
        console.warn('Supabase insert perfiles error:', error.message);
      }
    }

    // Siempre guardar local
    saveLocalProfile(profile);
  };

  const login = async (email, password, role = 'usuario') => {
    const profile = await fetchProfile(email);

    if (profile) {
      if (profile.password && profile.password !== password) {
        return { error: 'Credenciales inválidas' };
      }

      const userData = {
        id: profile.id || Math.random().toString(36).substr(2, 9),
        name: profile.name || email.split('@')[0],
        email: profile.email,
        role: profile.role || role
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }

    return { error: 'Usuario no encontrado. Regístrate primero.' };
  };

  const register = async (name, email, password) => {
    const profile = await fetchProfile(email);

    if (profile) {
      return { error: 'Ya existe un usuario con ese correo.' };
    }

    const newProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role: 'usuario',
      created_at: new Date().toISOString()
    };

    await insertProfile(newProfile);

    const userData = {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      role: newProfile.role
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const createTicket = async (ticket) => {
    const newTicket = {
      ...ticket,
      id: `TK-${Date.now()}`,
      status: 'pagado',
      validated: false,
      createdAt: new Date().toISOString()
    };

    setTickets((prev) => [...prev, newTicket]);

    // Insertar en Supabase
    if (supabase) {
      const { error } = await supabase.from('tiquetes').insert([newTicket]);
      if (error) {
        console.warn('Supabase insert tiquetes error:', error.message);
      }
    }

    return newTicket;
  };

  const validateTicket = async (ticketId) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, validated: true } : ticket
      )
    );

    if (supabase) {
      const { error } = await supabase
        .from('tiquetes')
        .update({ validated: true })
        .eq('id', ticketId);

      if (error) {
        console.warn('Supabase update tiquetes error:', error.message);
      }
    }
  };

  const getTicketById = (ticketId) => {
    return tickets.find((ticket) => ticket.id === ticketId);
  };

  const value = {
    user,
    ciudad,
    isAuthenticated,
    loading,
    tickets,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isUsuario: user?.role === 'usuario',
    login,
    register,
    logout,
    setCiudadGlobal,
    createTicket,
    validateTicket,
    getTicketById
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};