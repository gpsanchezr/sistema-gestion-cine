import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setUser(session?.user ?? null);
        if (session?.user?.id) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setProfileLoaded(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setProfileLoaded(true);
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      
      // Fix infinite loop: only reload profile on sign in or new user
      if (session?.user?.id && (event === 'SIGNED_IN' || session.user.id !== user?.id)) {
        setProfileLoaded(false);
        loadUserProfile(session.user.id);
      } else if (!session?.user) {
        setUserProfile(null);
        setProfileLoaded(true);
        setLoading(false);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    if (!userId || profileLoaded) {
      setProfileLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error en consulta perfiles:', error);
        throw error;
      }

      setUserProfile(data || null);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoaded(true);
      setLoading(false);
    }
  };

  const signUp = async (email, password, nombre) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre
        }
      }
    });

    if (!error && data.user?.id) {
      await supabase.from('perfiles').upsert({
        id: data.user.id,
        email,
        nombre,
        rol: 'cliente'
      }, { onConflict: 'id' });
    }

    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = () => {
    return userProfile?.rol === 'admin';
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
