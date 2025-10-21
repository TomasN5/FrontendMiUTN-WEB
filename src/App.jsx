import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfesorDetalle from './components/detalleprofesor';
import CargarProfesor from './components/cargarprofesor';
import ModificarProfesor from './components/modificarprofesor';
import Materias from './components/materias';
import MateriaDetalle from './components/detallemateria';
import CargarMateria from './components/cargarMateria';
import ModificarMateria from './components/modificarmateria';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profesores/" element={<ProfesorDetalle />} />
        <Route path="/profesores/cargarprofesor" element={<CargarProfesor />} />
        <Route path="/profesores/modificarprofesor" element={<ModificarProfesor />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/materia/:nombre" element={<MateriaDetalle />} />
        <Route path="/materia/:nombre/cargarmateria" element={<CargarMateria />} />
        <Route path="/materia/:nombre/modificarmateria" element={<ModificarMateria />} />
      </Routes>
    </Router>
  );
}

export default App;