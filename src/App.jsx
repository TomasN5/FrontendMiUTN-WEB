import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfesorDetalle from './components/detalleprofesor';
import CargarProfesor from './components/cargarprofesor';
import ModificarProfesor from './components/modificarprofesor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profesores/" element={<ProfesorDetalle />} />
        <Route path="/profesores/cargarprofesor" element={<CargarProfesor />} />
        <Route path="/profesores/modificarprofesor" element={<ModificarProfesor />} />
      </Routes>
    </Router>
  );
}

export default App;