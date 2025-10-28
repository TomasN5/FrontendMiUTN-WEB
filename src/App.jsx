import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Announcements from './components/Screens/Announcements';
import AnnouncementForm from './components/Screens/Announcements/AnnouncementForm';
import ProfesorDetalle from './components/detalleprofesor';
import CargarProfesor from './components/cargarprofesor';
import ModificarProfesor from './components/modificarprofesor';
import Materias from './components/materias';
import MateriaDetalle from './components/detallemateria';
import CargarMateria from './components/cargarMateria';
import ModificarMateria from './components/modificarmateria';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    // Aquí iría la lógica real de autenticación
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/announcements" 
            element={
              isAuthenticated ? (
                <Announcements />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/announcements/new" 
            element={
            isAuthenticated ? (
            <AnnouncementForm />
            ) : (
          <Navigate to="/login" replace />
          )
          } 
        />
        <Route 
            path="/announcements/edit/:id" 
            element={
            isAuthenticated ? (
              <AnnouncementForm />
            ) : (
              <Navigate to="/login" replace />
            )
            } 
          />
          <Route path="/profesores/" element={ isAuthenticated ? (<ProfesorDetalle /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/profesores/cargarprofesor" element={ isAuthenticated ? (<CargarProfesor /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/profesores/modificarprofesor" element={ isAuthenticated ? (<ModificarProfesor /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/materias" element={ isAuthenticated ? (<Materias /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/materia/:nombre" element={ isAuthenticated ? (<MateriaDetalle /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/materia/:nombre/cargarmateria" element={ isAuthenticated ? (<CargarMateria /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/materia/:nombre/modificarmateria" element={ isAuthenticated ? (<ModificarMateria /> ) : (
              <Navigate to="/login" replace />
            )} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;