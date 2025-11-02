import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// 🔥 FUNCIÓN PARA MANEJAR CACHÉ
export const planoService = {
  obtenerDatosPlano: async (planoId) => {
    try {
      // 🔥 CORREGIR URL - quitar el /api/ duplicado
      const response = await api.get(`/planos/${planoId}/datos`);
      const data = response.data;
      
      console.log('✅ Datos cargados del plano:', planoId);
      return data;
    } catch (error) {
      console.warn('Error obteniendo datos del plano, usando datos vacíos');
      const datosVacios = {
        planoId,
        nodos: [],
        pasillos: []
      };
      return datosVacios;
    }
  },

  guardarDatosPlano: async (planoId, datosPlano) => {
    try {
      // 🔥 CORREGIR URL - quitar el /api/ duplicado
      const response = await api.post(`/planos/${planoId}/datos`, datosPlano);
      console.log('✅ Datos del plano guardados:', planoId);
      return response.data;
    } catch (error) {
      console.error('Error guardando datos del plano:', error);
      throw error;
    }
  }
};

export const nodoService = {
  crearNodo: async (nodoDTO) => {
    try {
      const response = await api.post('/nodos', nodoDTO);
      console.log('✅ Nodo guardado en backend:', nodoDTO.nombre);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando nodo:', error);
      throw error;
    }
  },

  actualizarNodo: async (id, nodoDTO) => {
    try {
      const response = await api.put(`/nodos/${id}`, nodoDTO);
      console.log('✅ Nodo actualizado en backend:', nodoDTO.nombre);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando nodo:', error);
      throw error;
    }
  },

  eliminarNodo: async (id) => {
    try {
      const response = await api.delete(`/nodos/${id}`);
      console.log('✅ Nodo eliminado en backend:', id);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando nodo:', error);
      throw error;
    }
  },

  obtenerNodosPorPlano: async (planoId) => {
    try {
      const response = await api.get(`/nodos/plano/${planoId}`);
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo nodos, usando array vacío');
      return [];
    }
  },

  obtenerTodosNodos: async () => {
    try {
      const response = await api.get('/nodos');
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo todos los nodos, usando array vacío');
      return [];
    }
  }
};

export const pasilloService = {
  crearPasillo: async (pasilloDTO) => {
    try {
      const response = await api.post('/pasillos', pasilloDTO);
      console.log('✅ Pasillo guardado en backend:', pasilloDTO.nombre);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando pasillo:', error);
      throw error;
    }
  },

  eliminarPasillo: async (id) => {
    try {
      const response = await api.delete(`/pasillos/${id}`);
      console.log('✅ Pasillo eliminado en backend:', id);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando pasillo:', error);
      throw error;
    }
  },

  obtenerPasillosPorPlano: async (planoId) => {
    try {
      const response = await api.get(`/pasillos/plano/${planoId}`);
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo pasillos, usando array vacío');
      return [];
    }
  },

  obtenerPasillosPorNodo: async (nodoId) => {
    try {
      const response = await api.get(`/pasillos/nodo/${nodoId}`);
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo pasillos del nodo, usando array vacío');
      return [];
    }
  }
};

export const floorService = {
  obtenerTodosFloors: async () => {
    try {
      const response = await api.get('/floors');
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo floors, usando datos temporales');
      return [
        { id: 1, name: 'Planta Principal' },
        { id: 2, name: 'Piso 1' },
        { id: 3, name: 'Piso 2' }
      ];
    }
  }
};

export const careerService = {
  obtenerTodasCareers: async () => {
    try {
      const response = await api.get('/v1/MiUTN/career/'); // 🔥 CORREGIR URL
      // Convertir el Map<Long, String> a array de objetos
      const careersMap = response.data;
      const careersArray = Object.entries(careersMap).map(([id, name]) => ({
        id: parseInt(id),
        name: name
      }));
      return careersArray;
    } catch (error) {
      console.warn('Error obteniendo careers, usando datos temporales');
      return [
        { id: 1, name: 'Sistemas' },
        { id: 2, name: 'Química' },
        { id: 3, name: 'Mecánica' }
      ];
    }
  }
};

export default api;