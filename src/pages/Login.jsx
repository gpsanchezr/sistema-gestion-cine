import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, setCiudadGlobal, isAuthenticated, ciudad } = useAuth();

  const [showCityModal, setShowCityModal] = useState(!ciudad);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState('usuario');
  const [errors, setErrors] = useState({});
  const [authMessage, setAuthMessage] = useState('');

  const ciudades = ['Barranquilla', 'Bogotá', 'Medellín', 'Cali', 'Cartagena'];

  useEffect(() => {
    if (isAuthenticated && ciudad) {
      navigate('/home');
    }
  }, [isAuthenticated, ciudad, navigate]);

  const handleCitySelect = (city) => {
    setCiudadGlobal(city);
    setShowCityModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Nombre requerido';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmar contraseña requerida';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');

    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      const result = await login(formData.email, formData.password, role);
      if (result?.error) {
        setAuthMessage(result.error);
        return;
      }
    } else {
      const result = await register(formData.name, formData.email, formData.password);
      if (result?.error) {
        setAuthMessage(result.error);
        return;
      }
    }

    navigate('/home');
  };

  return (
    <div className="login-container">
      {showCityModal && (
        <div className="city-modal-overlay">
          <div className="city-modal">
            <h2>Selecciona tu Ciudad</h2>
            <p>Elige la ciudad donde quieres disfrutar el cine</p>
            <div className="city-grid">
              {ciudades.map((city) => (
                <button
                  key={city}
                  className="city-button"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="login-box glass">
        <div className="login-header">
          <h1>🎬 Cine Premium</h1>
          <p>{isLogin ? 'Inicio de Sesión' : 'Registro'} con estilo glassmorphism</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          {isLogin && (
            <div className="form-group">
              <label htmlFor="role">Entrar como</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <span className="hint">Selecciona administrador sólo si tu cuenta tiene ese rol.</span>
            </div>
          )}

          {authMessage && <div className="auth-message">{authMessage}</div>}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Iniciar Sesión' : 'Registrarme'}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                setErrors({});
                setAuthMessage('');
              }}
            >
              {isLogin ? 'Regístrate aquí' : 'Ir al login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
