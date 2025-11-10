import plata_principal from "./../assets/Dibujo1-Presentación1.png";
import sistemas_p1 from "./../assets/sistemas-piso-1.png"
import sistemas_p2 from "./../assets/sistemas-piso-2.png"
import quimica_p1 from "./../assets/PlanoQuimica.png"



// utils/constants.js - AGREGAR constantes para destacados
export const FEATURE_FLAGS = {
  DESTACADO: 'destacado'
};

export const COLORS_DESTACADOS = {
  DESTACADO: '#FFD700', // Dorado para elementos destacados
  DESTACADO_BORDE: '#FFA500', // Naranja para el borde
  DESTACADO_GLOW: '#FFF3CD' // Amarillo claro para efectos de brillo
};
export const AREA_TYPES = {
  AULA: 'aula',
  // SALON: 'salon', // ❌ QUITAMOS SALÓN (opcional)
  DEPARTAMENTO: 'departamento',
  HALL: 'hall',
  BANO: 'bano',
  ESCALERA: 'escalera',
  PUNTO: 'punto',
  PASILLO: 'pasillo',
  EXTINTOR: 'extintor',
  SALIDA_EMERGENCIA: 'salida_emergencia',
  DESFIBRILADOR: 'desfibrilador',
  BOTIQUIN: 'botiquin',
  ALARMA: 'alarma',
  TOTEM: 'totem',
   AREA_GENERICA: 'area_generica'
};

export const COLORS = {
  // Colores existentes
  [AREA_TYPES.AULA]: '#4CAF50', // Verde
  [AREA_TYPES.DEPARTAMENTO]: '#FF9800', // Naranja para Departamento
  [AREA_TYPES.BANO]: '#2196F3', // Azul
  [AREA_TYPES.ESCALERA]: '#9C27B0', // Púrpura
  [AREA_TYPES.PASILLO]: '#795548', // Marrón
  [AREA_TYPES.PUNTO]: '#F44336', // Rojo
  [AREA_TYPES.EXTINTOR]: '#FF5722', // Rojo oscuro
  [AREA_TYPES.SALIDA_EMERGENCIA]: '#E91E63', // Rosa
  [AREA_TYPES.DESFIBRILADOR]: '#00BCD4', // Cyan
  [AREA_TYPES.BOTIQUIN]: '#8BC34A', // Verde claro
  [AREA_TYPES.ALARMA]: '#FFC107', // Amarillo
  [AREA_TYPES.TOTEM]: '#607D8B', // Gris azulado
  [AREA_TYPES.AREA_GENERICA]: '#9E9E9E' // Gris para Área Genérica
};

export const CARRERAS = {
  SISTEMAS: "sistemas",
  QUIMICA: "quimica", 
  MECANICA: "mecanica",
  CIVIL: "civil",
  INDUSTRIAL: "industrial",
  ELECTRICA: "electrica"
};

export const PISOS = {
  PLANTA_PRINCIPAL: "Planta Principal",
  PISO1: "Piso 1",
  PISO2: "Piso 2", 
  PISO3: "Piso 3",
  PISO4: "Piso 4"
};

export const ICONS = {
  // 🔥 ICONOS PARA TODOS LOS TIPOS
  [AREA_TYPES.AULA]: '🏫',
  // [AREA_TYPES.SALON]: '🏛️', // ❌ QUITAMOS SALÓN
  [AREA_TYPES.DEPARTAMENTO]: '🏢',
  [AREA_TYPES.BANO]: '🚻',
  [AREA_TYPES.ESCALERA]: '🪜',
  [AREA_TYPES.PUNTO]: '📍',
  [AREA_TYPES.PASILLO]: '🛣️',
  [AREA_TYPES.EXTINTOR]: '🧯',
  [AREA_TYPES.SALIDA_EMERGENCIA]: '🚪',
  [AREA_TYPES.DESFIBRILADOR]: '💓',
  [AREA_TYPES.BOTIQUIN]: '🩹',
  [AREA_TYPES.ALARMA]: '🚨',
  [AREA_TYPES.TOTEM]: '📟',
  [AREA_TYPES.AREA_GENERICA]: '📦'
};

export const TYPE_DISPLAY_NAMES = {
  [AREA_TYPES.AULA]: 'Aula',
  // [AREA_TYPES.SALON]: 'Salón', // ❌ QUITAMOS SALÓN
  [AREA_TYPES.DEPARTAMENTO]: 'Departamento',
  [AREA_TYPES.BANO]: 'Baño',
  [AREA_TYPES.ESCALERA]: 'Escalera',
  [AREA_TYPES.PUNTO]: 'Punto',
  [AREA_TYPES.PASILLO]: 'Pasillo',
  [AREA_TYPES.EXTINTOR]: 'Matafuegos',
  [AREA_TYPES.SALIDA_EMERGENCIA]: 'Salida Emergencia',
  [AREA_TYPES.DESFIBRILADOR]: 'Desfibrilador',
  [AREA_TYPES.BOTIQUIN]: 'Botiquín',
  [AREA_TYPES.ALARMA]: 'Alarma',
   [AREA_TYPES.TOTEM]: 'Tótem' ,
   [AREA_TYPES.AREA_GENERICA]: 'Area generica'
};
export const PLANOS_CONFIG = {
  // Planta Principal
  planta_principal: {
    id: 'planta_principal',
    nombre: 'Planta Principal',
    carrera: 'general',
    piso: 'planta_principal',
    src: plata_principal,
    naturalWidth: 1012,
    naturalHeight: 768,
    areas: []
  },
  
  // Sistemas - Piso 1
  sistemas_p1: {
    id: 'sistemas_p1',
    nombre: 'Sistemas - Piso 1',
    carrera: CARRERAS.SISTEMAS,
    piso: PISOS.PISO1,
    src: sistemas_p1,
    naturalWidth: 1012,
    naturalHeight: 768,
    areas: []
  },
  
  // Sistemas - Piso 2
  sistemas_p2: {
    id: 'sistemas_p2',
    nombre: 'Sistemas - Piso 2',
    carrera: CARRERAS.SISTEMAS,
    piso: PISOS.PISO2,
    src: sistemas_p2,
    naturalWidth: 1012,
    naturalHeight: 768,
    areas: []
  },
  
  // Química - Piso 1
  quimica_p1: {
    id: 'quimica_p1',
    nombre: 'Química - Piso 1',
    carrera: CARRERAS.QUIMICA,
    piso: PISOS.PISO1,
    src: quimica_p1,
    naturalWidth: 1012,
    naturalHeight: 768,
    areas: []
  },
  
  // Química - Piso 2
  quimica_p2: {
    id: 'quimica_p2',
    nombre: 'Química - Piso 2',
    carrera: CARRERAS.QUIMICA,
    piso: PISOS.PISO2,
    src: '/planos/quimica-p2.png',
    naturalWidth: 1012,
    naturalHeight: 768,
    areas: []
  }
};

// Helper para obtener información de un nodo
export const getNodeInfo = (nodeId, areas, points) => {
  const node = areas.find(a => a.id === nodeId) || points.find(p => p.id === nodeId);
  return node || null;
};

// Helper para obtener planos por carrera
export const getPlanosByCarrera = (carrera) => {
  return Object.values(PLANOS_CONFIG).filter(plano => 
    carrera === 'general' ? plano.carrera === 'general' : plano.carrera === carrera
  );
};

// Helper para obtener todas las carreras disponibles
export const getCarrerasDisponibles = () => {
  const carreras = new Set();
  Object.values(PLANOS_CONFIG).forEach(plano => {
    if (plano.carrera !== 'general') {
      carreras.add(plano.carrera);
    }
  });
  return Array.from(carreras);
};

export const CONTROL_PANEL_STYLE = {
  position: "absolute",
  top: 20,
  left: 20,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  width: "320px",
  fontFamily: "Inter, Arial, sans-serif",
};

export const ESCALERA_DIRECCIONES = {
  SUBIDA: 'subida',
  BAJADA: 'bajada', 
  AMBOS: 'ambos'
};

export const TIPOS_DESTINO_ESCALERA = {
  UNICO: 'unico',
  MULTIPLE: 'multiple'
};