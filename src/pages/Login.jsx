import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, setCiudadGlobal, isAuthenticated, ciudad } = useAuth();

  const [showCityModal, setShowCityModal] = useState(!ciudad);
  const [isRegistering, setIsRegistering] = useState(false);
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
    const passwordRegex = /^(?=.*[A-Z]).{6,}$/;

    if (!formData.email) {
      newErrors.email = 'Email requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña requerida';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener mínimo 6 caracteres y al menos una letra mayúscula';
    }

    if (isRegistering) {
      if (!formData.name) {
        newErrors.name = 'Nombre requerido';
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

    if (!isRegistering) {
      const result = await login(formData.email, formData.password);
      if (result?.error) {
        setAuthMessage(result.error);
        return;
      }

      // Después del login exitoso, verificar el rol y navegar
      if (result?.success) {
        // El contexto Auth ya debería tener el usuario actualizado
        // Verificar si el rol es admin para navegar a /admin
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } else {
      const result = await register(formData.name, formData.email, formData.password, role);
      if (result?.error) {
        setAuthMessage(result.error);
        return;
      }
      setAuthMessage(result.message || 'Usuario registrado exitosamente. Revisa tu email para confirmar.');
      return; // No navegar automáticamente
    }
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
          <p>{isRegistering ? 'Registro' : 'Inicio de Sesión'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

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

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="role">Credenciales</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <span className="hint">Selecciona el rol que deseas para tu cuenta.</span>
            </div>
          )}

          {authMessage && <div className="auth-message">{authMessage}</div>}

          <button type="submit" className="submit-btn">
            {isRegistering ? 'Registrarme' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <a
              href="#"
              className="toggle-link"
              onClick={(e) => {
                e.preventDefault();
                setIsRegistering(!isRegistering);
                setFormData({ name: '', email: '', password: '' });
                setErrors({});
                setAuthMessage('');
              }}
            >
              {isRegistering ? 'Ir al login' : 'Regístrate aquí'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
