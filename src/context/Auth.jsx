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

    // Listener para cambios de estado de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Usuario inició sesión, obtener perfil
        const { data: profile } = await supabase
          .from('perfiles')
          .select('role, nombre')
          .eq('id', session.user.id)
          .single();

        const userData = {
          id: session.user.id,
          name: profile?.nombre || session.user.user_metadata?.name || session.user.email.split('@')[0],
          email: session.user.email,
          role: profile?.role || 'usuario'
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
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

  const login = async (email, password) => {
    try {
      // Primero hacer login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Ahora consultar la tabla perfiles para obtener el rol y nombre
        const { data: profile, error: profileError } = await supabase
          .from('perfiles')
          .select('role, nombre')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('Error fetching profile:', profileError.message);
          // Si no hay perfil, no crear uno automáticamente - dar error
          await supabase.auth.signOut();
          return { error: 'Perfil de usuario no encontrado. Contacta al administrador.' };
        } else {
          const userData = {
            id: data.user.id,
            name: profile?.nombre || data.user.user_metadata?.name || data.user.email.split('@')[0],
            email: data.user.email,
            role: profile.role
          };

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          return { success: true };
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'Error interno del servidor' };
    }

    return { error: 'Error desconocido' };
  };

  const register = async (name, email, password, role = 'usuario') => {
    try {
      // Registrar con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Crear perfil en la tabla perfiles
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([{
            id: data.user.id,
            nombre: name,
            email: email,
            role: role,
            created_at: new Date().toISOString()
          }]);

        if (profileError) {
          console.warn('Error creating profile:', profileError.message);
          // Continuar de todos modos
        }

        // No hacer login automático, dejar que el usuario confirme email
        return { success: true, message: 'Usuario registrado. Revisa tu email para confirmar.' };
      }
    } catch (err) {
      console.error('Register error:', err);
      return { error: 'Error interno del servidor' };
    }

    return { error: 'Error desconocido' };
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