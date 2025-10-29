// src/config/env.js
const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME
};

// Debug: verificar que las variables se carguen
console.log('Env variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  all: import.meta.env
});

export default env;