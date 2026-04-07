import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎬</span>
          <span className="brand-name">CinemaHub</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Cartelera</Link>

          {user && (
            <>
              <Link to="/mis-tiquetes" className="nav-link">Mis Tiquetes</Link>
              {isAdmin() && (
                <>
                  <Link to="/admin/peliculas" className="nav-link">Administrar</Link>
                  <Link to="/admin/validar" className="nav-link">Validar</Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{userProfile?.nombre || user.email}</span>
              {isAdmin() && <span className="admin-badge">Admin</span>}
              <button onClick={handleSignOut} className="btn btn-outline btn-sm">
                Salir
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Ingresar
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
