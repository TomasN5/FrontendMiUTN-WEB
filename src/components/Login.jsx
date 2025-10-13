import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación real
    console.log('Email:', email, 'Password:', password, 'RememberMe:', rememberMe);
    
    // Simulamos una autenticación exitosa
    if (email && password) {
      onLogin(); // Esto activará la navegación al dashboard
    }
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
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
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