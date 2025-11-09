// utils/initialData.js
export const generarIdUnicoReal = (prefijo = 'elemento') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const performanceMark = performance.now().toString(36).replace('.', '');
  return `${prefijo}_${timestamp}_${random}_${performanceMark}`;
};

// Datos de puntos (estos funcionan bien)
export const initialPuntos = {
  'planta_principal': [
    {
      id: 'punto_mhgvsods_l1110',
      tipo: 'punto',
      nombre: 'Punto 1',
      x: 362.46514892578125,
      y: 375,
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal'
    },
    {
      id: 'punto_mhgvsods_23owd',
      tipo: 'punto',
      nombre: 'Punto 2',
      x: 363,
      y: 402,
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal'
    },
    {
      id: 'punto_mhgvsods_yk6bq',
      tipo: 'punto',
      nombre: 'Punto 3',
      x: 361,
      y: 427,
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal'
    },
    {
      id: 'punto_mhgvsods_9dwcg',
      tipo: 'punto',
      nombre: 'Punto 4',
      x: 362,
      y: 454.2236633300781,
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal'
    },
    {
      id: 'punto_mhgvsods_4zrfv',
      tipo: 'punto',
      nombre: 'Punto 5',
      x: 362,
      y: 477.45416259765625,
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal'
    }
  ],
  'sistemas_p1': [
    {
      id: 'punto_mhgvvw4c_k0psu',
      tipo: 'punto',
      nombre: 'Punto 1',
      x: 508.9072570800781,
      y: 285.9262390136719,
      carrera: 'sistemas',
      piso: 'Piso 1',
      planoId: 'sistemas_p1'
    },
    {
      id: 'punto_mhgvvw4c_p1c22',
      tipo: 'punto',
      nombre: 'Punto 2',
      x: 494.68096923828125,
      y: 259.2975769042969,
      carrera: 'sistemas',
      piso: 'Piso 1',
      planoId: 'sistemas_p1'
    }
  ]
};

// Áreas (escaleras)
export const initialAreas = {
  'planta_principal': [
    {
      id: 'area_mhgvvdq8_p5vu7',
      nombre: 'Escalera Principal',
      tipo: 'escalera',
      points: [[350, 300], [400, 300], [400, 350], [350, 350]],
      carrera: 'general',
      piso: 'planta_principal',
      planoId: 'planta_principal',
      carreraActual: 'sistemas',
      pisoActual: 'Planta Principal',
      carreraDestino: 'sistemas',
      pisoDestino: 'Piso 1',
      direccion: 'ambos'
    }
  ],
  'sistemas_p1': [
    {
      id: 'area_mhgvvr4c_zewqa',
      nombre: 'Escalera Sistemas',
      tipo: 'escalera',
      points: [[500, 250], [550, 250], [550, 300], [500, 300]],
      carrera: 'sistemas',
      piso: 'Piso 1',
      planoId: 'sistemas_p1',
      carreraActual: 'sistemas',
      pisoActual: 'Piso 1',
      carreraDestino: 'sistemas',
      pisoDestino: 'Planta Principal',
      direccion: 'ambos'
    }
  ]
};

// Función para obtener datos completos
export const getDatosInicialesCompletos = () => {
  return {
    'planta_principal': {
      areas: [...initialAreas['planta_principal']],
      points: [...initialPuntos['planta_principal']]
    },
    'sistemas_p1': {
      areas: [...initialAreas['sistemas_p1']],
      points: [...initialPuntos['sistemas_p1']]
    }
  };
};