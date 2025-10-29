import React, { useEffect, useState } from 'react';
import './detalleprofesor.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar.jsx';
import EliminarDocente from '../Screens/Profesores/eliminardocente.jsx';
import { checkAuth,logout } from '../CheckAuth.jsx';
import env from '../../config/env.js';

const api_URL = env.API_BASE_URL;

const docentesFallback = [
  { nombre: 'Ruben Guerrieri', legajo: '11111', mail: 'ruben@frlp.utn.edu.ar' },
  { nombre: 'Sergio Antonini', legajo: '22222', mail: 'sergio@frlp.utn.edu.ar' },
  { nombre: 'Martin Sitnyk', legajo: '33333', mail: 'martin@frlp.utn.edu.ar' },
];

export default function ProfesorDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();

  const [docentes, setDocentes] = useState(docentesFallback);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
    const [activeMenuItem, setActiveMenuItem] = useState('profesores');
  

  const fetchDocentes = async () => {
    try {
      const url = api_URL +`api/v1/miUTN/professor/findAll`;
      const res = await fetch(url,{ headers: {
          'ngrok-skip-browser-warning': 'true',
        }});
      if (!res.ok) throw new Error(`Error al obtener docentes desde ${url}`);
      const data = await res.json();

      const adaptadas = data.map((m) => ({
        id: m.id,
        nombre: `${m.name} ${m.lastname}`,
        legajo: "111111",
        mail: m.email,
      }));

      setDocentes(adaptadas);
    } catch (error) {
      console.error('No se pudo conectar a la API, usando datos locales.', error);
      setDocentes(docentesFallback);
    }
  };

  useEffect(() => {
     if (!checkAuth()) {
              // Si no hay token, redirigimos al login
              logout()
        }
    fetchDocentes();
  }, []);

  const handleEliminarClick = (docente) => {
    setDocenteSeleccionado(docente);
    setMostrarPopup(true);
  };

  const handleConfirmarEliminacion = async() => {
    console.log('Eliminando docente:', docenteSeleccionado);
    try {
      const res = await fetch(api_URL + `api/v1/miUTN/professor/delete?id=${docenteSeleccionado.id}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });

      if (!res.ok) {
        throw new Error('Error al eliminar al docente.');
      }

      // 🔹 Eliminar visualmente la materia
      setDocentes((prev) => prev.filter((m) => m.id !== docenteSeleccionado.id));

      alert(`Docente "${docenteSeleccionado.nombre}" eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar al docente:', error);
      alert('No se pudo eliminar al docente. Verifica la conexión con la API.');
    } finally {
      setMostrarPopup(false);
      setDocenteSeleccionado(null);
    }

    setMostrarPopup(false);
  };

  const handleCancelarEliminacion = () => {
    setMostrarPopup(false);
    setDocenteSeleccionado(null);
  };

    const handleBackToDashboard = () => {
    navigate('/dashboard');
      
    };
    const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
  };
  const handleLogout = () => {
    navigate('/login');
  };


  return (
    <>
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />
      <div className="docentes-container">
        <h2 className="subtitle">Docentes cargados</h2>

        <div className="docentes-header">
          <button
            className="agregar-btn"
            onClick={() => navigate('/profesores/cargarprofesor')}
          >
            + Agregar Docente
          </button>
        </div>
      
<div className="docentes-table-wrapper">
        <table className="docentes-table">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Legajo</th>
      <th>Mail</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {docentes.map((p, idx) => (
      <tr key={idx}>
        <td data-label="Nombre">{p.nombre}</td>
        <td data-label="Legajo">{p.legajo}</td>
        <td data-label="Mail">{p.mail}</td>
        <td className="acciones" data-label="Acciones">
          <button
            className="btn-modificar"
            onClick={() =>
              navigate('/profesores/modificarprofesor', { state: { profesor: p } })
            }
          >
            Modificar
          </button>
          <button
            className="btn-eliminar"
            onClick={() => handleEliminarClick(p)}
          >
            Eliminar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>

        {mostrarPopup && (
          <EliminarDocente
            onConfirm={handleConfirmarEliminacion}
            onCancel={handleCancelarEliminacion}
          />
        )}
      </div>
    </>
  );
}