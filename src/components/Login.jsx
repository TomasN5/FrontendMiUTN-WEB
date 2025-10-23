import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Creamos el objeto con los datos del usuario
  const credentials = {
    email: email,
    password: password,
  };

  try {
    // Realizamos la petición POST al endpoint de login
    const response = await fetch('https://8d13dfce1445.ngrok-free.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Indicamos que enviamos JSON
      },
      body: JSON.stringify(credentials), // Convertimos el objeto a JSON
    });

    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error('Error al iniciar sesión');
    }

    // Parseamos la respuesta (por ejemplo, un token o usuario)
    const data = await response.json();
    console.log('Respuesta del servidor:', data.accessToken);

    localStorage.setItem('token', data.accessToken);
    // Si todo salió bien, llamamos a la función onLogin
    onLogin();

  } catch (error) {
    console.error('Error durante el login:', error.message);
    alert('Error al iniciar sesión. Verificá tus credenciales.');
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          
          <button type="submit" className="login-button" onClick={handleSubmit}>
            <span>Ingresar</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Login;