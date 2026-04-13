import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ciudadesColombia = [
    'Barranquilla', 'Bogotá', 'Medellín', 'Cali', 'Cartagena',
    'Bucaramanga', 'Pereira', 'Barrancabermeja', 'Manizales', 'Ibagué'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) return setError('Contraseñas no coinciden');
    if (password.length < 6) return setError('Contraseña mínima 6 caracteres');
    if (!nombre.trim()) return setError('Nombre requerido');
    if (!ciudad) return setError('Selecciona ciudad');

    const trimmedEmail = email.trim();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: nombre.trim(),
            city: ciudad,
            role: 'user'
          }
        }
      });

      if (error) {
        const msg = error.message.includes('already') ? 'Correo ya registrado' : error.message;
        return setError(msg);
      }

      await supabase.from('perfiles').upsert({
        id: data.user.id,
        email: trimmedEmail,
        full_name: nombre.trim(),
        role: 'user',
        city: ciudad
      });

      setSuccess('¡Cuenta creada! Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Cinta transportadora cine z:-1 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}>
        <div style={{
          display: 'flex',
          height: '100%',
          animation: 'conveyorMove 60s linear infinite',
          gap: '40px',
        }}>
          {/* Palomitas */}
          <div style={{
            flex: '0 0 100px',
            height: '100px',
            background: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #ffd93d 40%, #ff4757 70%)',
            borderRadius: '50%',
            boxShadow: '0 15px 40px rgba(255,107,107,0.5)',
          }}></div>
          {/* Gafas 3D */}
          <div style={{
            flex: '0 0 80px',
            height: '70px',
            background: '#000',
            borderRadius: '35px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '15px', left: '8px',
              width: '25px', height: '25px',
              background: '#00f0ff', borderRadius: '50%',
              boxShadow: '32px 0 0 #ff0080',
            }}></div>
          </div>
          {/* Sodas */}
          <div style={{
            flex: '0 0 60px',
            height: '110px',
            background: 'conic-gradient(#ff6b6b, #4ecdc4, #45b7d1, #ff9ff3)',
            borderRadius: '35px 35px 20px 20px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-8px', left: '16px',
              width: '28px', height: '22px',
              background: '#54a0ff', borderRadius: '50% 50% 60% 40%',
            }}></div>
          </div>
          {/* Claqueta */}
          <div style={{
            flex: '0 0 90px',
            height: '75px',
            background: 'linear-gradient(0deg, #000 70%, #ff4757 100%)',
            borderRadius: '12px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '8px', left: '50%',
              transform: 'translateX(-50%)',
              width: '50px', height: '16px',
              background: '#fff', borderRadius: '4px',
            }}></div>
          </div>
          {/* Loop */}
          <div style={{
            flex: '0 0 100px',
            height: '100px',
            background: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #ffd93d 40%, #ff4757 70%)',
            borderRadius: '50%',
            boxShadow: '0 15px 40px rgba(255,107,107,0.5)',
          }}></div>
          <div style={{
            flex: '0 0 80px',
            height: '70px',
            background: '#000',
            borderRadius: '35px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '15px', left: '8px',
              width: '25px', height: '25px',
              background: '#00f0ff', borderRadius: '50%',
              boxShadow: '32px 0 0 #ff0080',
            }}></div>
          </div>
        </div>
      </div>

      {/* Glass cristal oscuro */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(15px)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        maxWidth: '420px',
        width: '100%',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Borde tornasol suave */}
        <div style={{
          position: 'absolute',
          inset: '-2px',
          background: 'conic-gradient(from 0deg, #ff0080, #00f0ff, #0080ff, #ff00ff)',
          borderRadius: '26px',
          zIndex: -1,
          animation: 'tornasolGlow 6s linear infinite',
          padding: '2px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}></div>

        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 3.5rem)',
            background: 'linear-gradient(135deg, #ff0080, #00f0ff, #0080ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 0 20px rgba(255,0,128,0.4)',
          }}>
            CinemaHub
          </h1>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', margin: '0.5rem 0 0'}}>
            Crea tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 600, marginBottom: '0.75rem'}}>
              Nombre completo
            </label>
            <input
              id="register-name"
              name="register-name"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: '20px',
                backdropFilter: 'blur(15px)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              type="text"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading}
autoComplete="name"
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 600, marginBottom: '0.75rem'}}>
              Ciudad
            </label>
            <select
              id="register-city"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: '#ffffff',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: '20px',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              disabled={loading}
            >
              <option value="" style={{color: '#000000', background: '#ffffff'}}>Selecciona ciudad</option>
              {ciudadesColombia.map((city) => (
                <option key={city} value={city} style={{color: '#000000', background: '#ffffff'}}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 600, marginBottom: '0.75rem'}}>
              Correo Electrónico
            </label>
            <input
              id="register-email"
              name="register-email"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: '20px',
                backdropFilter: 'blur(15px)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
autoComplete="email"
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 600, marginBottom: '0.75rem'}}>
              Contraseña
            </label>
            <input
              id="register-password"
              name="register-password"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: '20px',
                backdropFilter: 'blur(15px)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={loading}
autoComplete="new-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,0,128,0.2)',
              border: '1px solid #ff0080',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#ff00ff',
              fontWeight: 500,
              textAlign: 'center',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              border: 'none',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ff0080 0%, #00f0ff 50%, #0080ff 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 10px 30px rgba(255,0,128,0.4)',
            }}
          >
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'center'}}>
          <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem'}}>
            ¿Ya tienes cuenta? <Link to="/login" style={{color: '#00f0ff', fontWeight: 600}}>Inicia sesión</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes conveyorMove { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        @keyframes tornasolGlow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        input, select:focus { box-shadow: 0 0 0 3px rgba(0,240,255,0.3); }
        @media (max-width: 480px) { div[style*='minHeight: 100vh'] { padding: 1rem; } }
      `}</style>
    </div>
  );
}

