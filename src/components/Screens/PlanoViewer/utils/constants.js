import plata_principal from "./../assets/Dibujo1-Presentación1.png";
import sistemas_p1 from "./../assets/sistemas-piso-1.png"


export const COLORS = {
  aula: "rgba(66, 135, 245, 0.28)",
  salon: "rgba(255, 165, 0, 0.30)",
  hall: "rgba(255, 235, 59, 0.35)",
  pasillo: "rgba(0, 0, 255, 0.8)",
  bano: "rgba(186, 104, 200, 0.30)",
  escalera: "rgba(120, 40, 40, 0.35)",
  borde: "rgba(0,0,0,0.6)",
  punto: "red",
  ruta: "green",
  pisoActivo: "rgba(34, 197, 94, 0.3)",
  pisoInactivo: "rgba(148, 163, 184, 0.1)"
};

export const AREA_TYPES = {
  AULA: "aula",
  SALON: "salon", 
  HALL: "hall",
  BANO: "bano",
  PUNTO: "punto",
  PASILLO: "pasillo",
  ESCALERA: "escalera"
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
    src: '/planos/sistemas-p2.png',
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
    src: '/planos/quimica-p1.png',
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