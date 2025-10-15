import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Materias from './components/Materias';
import MateriaDetalle from './components/detallemateria';
import CargarMateria from './components/cargarMateria';
import ModificarMateria from './components/modificarmateria';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/materias" element={<Materias />} />
        <Route path="/materia/:nombre" element={<MateriaDetalle />} />
        <Route path="/materia/:nombre/cargarmateria" element={<CargarMateria />} />
        <Route path="/materia/:nombre/modificarmateria" element={<ModificarMateria />} />
      </Routes>
    </Router>
  );
}

export default App;