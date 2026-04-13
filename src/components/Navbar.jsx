import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(10, 10, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 0',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          fontSize: '2rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #ff0080 0%, #00f0ff 50%, #0080ff 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(255, 0, 128, 0.5)',
          letterSpacing: '-0.05em',
          lineHeight: '1.2',
          padding: '0.5rem 0',
        }}>
          <span style={{ fontSize: '1.5em' }}>🎬</span>
          <span style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            background: 'inherit',
            backgroundClip: 'inherit',
            WebkitBackgroundClip: 'inherit',
            WebkitTextFillColor: 'inherit',
            textShadow: 'inherit',
            letterSpacing: 'inherit',
            lineHeight: 'inherit',
          }}>CINEMAHUB</span>
        </Link>

        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
        }}>
          <Link to="/" style={{
            color: 'transparent',
            background: 'linear-gradient(45deg, #ff0080, #00f0ff, #0080ff, #ff0080)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            fontWeight: '700',
            fontSize: '1rem',
            textDecoration: 'none',
            position: 'relative',
            animation: 'linkShimmer 3s linear infinite',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            transition: 'all 0.3s ease',
          }}>
            Cartelera
          </Link>

          {user && (
            <>
              <Link to="/mis-tiquetes" style={{
                color: 'transparent',
                background: 'linear-gradient(45deg, #ff0080, #00f0ff, #0080ff, #ff0080)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
                position: 'relative',
                animation: 'linkShimmer 3s linear infinite',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
              }}>
                Mis Tiquetes
              </Link>
              {isAdmin() && (
                <Link to="/admin" style={{
                  color: 'transparent',
                  background: 'linear-gradient(45deg, #ff0080, #00f0ff, #0080ff, #ff0080)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  fontWeight: '700',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  position: 'relative',
                  animation: 'linkShimmer 3s linear infinite',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                }}>
                  Administrar
                </Link>
              )}
            </>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '600',
              }}>
                {userProfile?.nombre || user.email}
              </span>
              {isAdmin() && (
                <span style={{
                  background: 'linear-gradient(135deg, #ff0080, #00f0ff)',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                }}>
                  Admin
                </span>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '1rem',
            }}>
              <Link to="/login" style={{
                color: 'transparent',
                background: 'linear-gradient(45deg, #ff0080, #00f0ff, #0080ff, #ff0080)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
                position: 'relative',
                animation: 'linkShimmer 3s linear infinite',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
              }}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ff0080 0%, #00f0ff 50%, #0080ff 100%)',
                color: '#fff',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(255,0,128,0.4)',
                transition: 'all 0.3s ease',
              }}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes linkShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        @media (max-width: 768px) {
          nav div:first-child {
            padding: '0 1rem';
            flex-direction: column;
            gap: 1rem;
          }
          nav div:nth-child(2) {
            display: none;
          }
          nav div:last-child {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
}
