import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas o error en el servidor');
      }


      const data = await response.json();
      const token = data.token || data.access_token || data; // dependiendo cómo lo devuelva el backend

      // Guardamos el token en localStorage (o sessionStorage si no marcó "Recordar mi cuenta")
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      console.log('Token recibido:', token);
      onLogin(); // Redirige al dashboard

    } catch (err) {
      setError(err.message);
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo-container">
          <div className="login-logo">
            <h2>MiUTN</h2>
          </div>
        </div>
        <h2>Bienvenido de vuelta</h2>
        <p>Accede a tu cuenta para gestionar tus cursos, horarios y anuncios académicos.</p>
      </div>
      
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>
          <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
          
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@utn.edu.ar"
              required
            />
          </div>
          
          <div className="form-group password-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="checkmark"></span>
              Recordar mi cuenta
            </label>
            <a href="#forgot" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button" disabled={loading}>
            <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
