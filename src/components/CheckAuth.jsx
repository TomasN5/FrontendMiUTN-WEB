// src/utils/checkAuth.js
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  
  // Si no hay token, retornamos false
  if (!token) {
    return false;
  }

  // Opcional: podrías agregar una validación extra si el token tiene fecha de expiración
  return true;
};


export const logout = () => {

const token = localStorage.getItem('token');
 if (!token) {
    localStorage.removeItem('token');
  }
  window.location.href = '/login'; // redirige al login
};