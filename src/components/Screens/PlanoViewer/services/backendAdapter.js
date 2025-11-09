// backendAdapter.js - VERSIÓN CORREGIDA
import { AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry'; // 🔥 IMPORTAR geometryUtils

const esTipoPunto = (tipo) => {
  const tiposPunto = [
    'punto', 'extintor', 'salida_emergencia', 'desfibrilador', 
    'botiquin', 'alarma', 'totem'
  ];
  return tiposPunto.includes(tipo?.toLowerCase());
};

// 🔥 FUNCIÓN PARA PARSEAR IDs (CORREGIDA)
const parseNodeId = (nodeId) => {
  if (!nodeId) {
    console.warn("❌ ID de nodo vacío o undefined");
    return 1;
  }
  
  // Si el ID es un número, convertirlo
  if (typeof nodeId === 'number') return nodeId;
  
  // Si es string, intentar extraer el número
  if (typeof nodeId === 'string') {
    // Buscar secuencia de números al final del string
    const match = nodeId.match(/(\d+)$/);
    if (match) return parseInt(match[1]);
    
    // Si no encuentra números, usar valor por defecto
    console.warn(`❌ No se pudo extraer ID numérico de: "${nodeId}"`);
    return 1;
  }
  
  console.warn("❌ ID de nodo inválido:", nodeId);
  return 1;
};

export const backendAdapter = {
  // 🔄 CONVERTIR NODO FRONTEND → BACKEND DTO
  frontendNodeToBackendDTO: (node, planoId, careerId, floorId) => {
    const baseDTO = {
      nombre: node.nombre,
      tipo: node.tipo.toUpperCase(),
      planoId: planoId,
      careerId: careerId,
      floorId: floorId
    };

    // Si es un PUNTO (incluyendo puntos especiales)
    if (esTipoPunto(node.tipo) && node.x !== undefined && node.y !== undefined) {
      return {
        ...baseDTO,
        coordenadaX: node.x,
        coordenadaY: node.y,
        puntos: []
      };
    }

    // Si es un ÁREA (aula, hall, baño, escalera)
    if (node.points && node.points.length > 0) {
      return {
        ...baseDTO,
        coordenadaX: null,
        coordenadaY: null,
        puntos: node.points.map(point => ({ x: point[0], y: point[1] }))
      };
    }

    return baseDTO;
  },

  // 🔄 CONVERTIR ESCALERA FRONTEND → BACKEND DTO (VERSIÓN ÚNICA CORREGIDA)
  frontendStairToBackendDTO: (stair, planoId, careerId, floorId, config) => {
    return {
      nombre: config.nombre,
      tipo: 'ESCALERA',
      planoId: planoId,
      careerId: careerId,
      floorId: floorId,
      puntos: stair.points.map(point => ({ x: point[0], y: point[1] })),
      // 🔥 CORREGIR: Usar backendAdapter en lugar de this
      carreraActualId: backendAdapter.mapCareerNameToId(config.carreraActual),
      pisoActualId: backendAdapter.mapFloorNameToId(config.pisoActual),
      direccion: config.direccion?.toUpperCase() || 'AMBOS',
      carrerasDestinoIds: [backendAdapter.mapCareerNameToId(config.carreraDestino)],
      pisosDestinoIds: [backendAdapter.mapFloorNameToId(config.pisoDestino)],
      escalerasConectadasIds: config.escaleraConectadaId ? 
        [parseNodeId(config.escaleraConectadaId)] : []
    };
  },

  // 🔄 CONVERTIR CONEXIÓN FRONTEND → BACKEND DTO
  frontendConnectionToBackendDTO: (connection, planoId, careerId, floorId) => {
    return {
      nombre: connection.nombre,
      desdeNodoId: parseNodeId(connection.from?.id),
      hastaNodoId: parseNodeId(connection.to?.id),
      planoId: planoId,
      careerId: careerId,
      floorId: floorId,
      distancia: backendAdapter.calculateDistance(connection.from, connection.to)
    };
  },
   
  // 🗺️ MAPEAR NOMBRES A IDs
  mapCareerNameToId: (careerName) => {
    const careerMap = {
      'sistemas': 1,
      'quimica': 2, 
      'mecanica': 3,
      'civil': 4,
      'industrial': 5,
      'electrica': 6,
      'general': 1
    };
    return careerMap[careerName?.toLowerCase()] || 1;
  },

  mapFloorNameToId: (floorName) => {
    const floorMap = {
      'planta_principal': 1,
      'piso1': 2,
      'piso2': 3,
      'piso3': 4,
      'piso4': 5
    };
    return floorMap[floorName] || 1;
  },

  // 🔥 CALCULAR DISTANCIA (USANDO geometryUtils)
  calculateDistance: (fromNode, toNode) => {
    try {
      // Obtener coordenadas del nodo origen
      let fromX, fromY;
      if (fromNode?.x !== undefined && fromNode?.y !== undefined) {
        fromX = fromNode.x;
        fromY = fromNode.y;
      } else if (fromNode?.points && fromNode.points.length > 0) {
        // Para áreas, usar el centro del polígono
        const center = geometryUtils.getPolygonCenter(fromNode.points);
        fromX = center[0];
        fromY = center[1];
      } else {
        console.warn("❌ No se pueden obtener coordenadas del nodo origen:", fromNode);
        return 10;
      }
      
      // Obtener coordenadas del nodo destino
      let toX, toY;
      if (toNode?.x !== undefined && toNode?.y !== undefined) {
        toX = toNode.x;
        toY = toNode.y;
      } else if (toNode?.points && toNode.points.length > 0) {
        // Para áreas, usar el centro del polígono
        const center = geometryUtils.getPolygonCenter(toNode.points);
        toX = center[0];
        toY = center[1];
      } else {
        console.warn("❌ No se pueden obtener coordenadas del nodo destino:", toNode);
        return 10;
      }
      
      const dx = toX - fromX;
      const dy = toY - fromY;
      return Math.sqrt(dx * dx + dy * dy);
      
    } catch (error) {
      console.error("❌ Error calculando distancia:", error);
      return 10;
    }
  },

  // 🔄 MAPEAR IDs A NOMBRES (para carga de datos)
  mapCareerIdToName: (careerId) => {
    const careerMap = {
      1: 'sistemas',
      2: 'quimica',
      3: 'mecanica', 
      4: 'civil',
      5: 'industrial',
      6: 'electrica'
    };
    return careerMap[careerId] || 'sistemas';
  },

  mapFloorIdToName: (floorId) => {
    const floorMap = {
      1: 'planta_principal',
      2: 'piso1', 
      3: 'piso2',
      4: 'piso3',
      5: 'piso4'
    };
    return floorMap[floorId] || 'planta_principal';
  },
  
  // 🔄 CONVERTIR BACKEND DTO → FRONTEND NODE (para carga)
  backendDTOToFrontendNode: (nodoDTO, planoInfo) => {
    const baseNode = {
      id: nodoDTO.id?.toString() || `temp_${Date.now()}`,
      tipo: nodoDTO.tipo?.toLowerCase() || 'punto',
      nombre: nodoDTO.nombre || 'Sin nombre',
      carrera: planoInfo?.carrera || 'general',
      piso: planoInfo?.piso || 'planta_principal',
      planoId: planoInfo?.id || 'unknown'
    };
    
    // Si tiene coordenadas individuales (puntos)
    if (nodoDTO.coordenadaX !== null && nodoDTO.coordenadaY !== null) {
      return {
        ...baseNode,
        x: nodoDTO.coordenadaX,
        y: nodoDTO.coordenadaY
      };
    }
    
    // Si tiene polígono (áreas)
    if (nodoDTO.puntos && nodoDTO.puntos.length > 0) {
      return {
        ...baseNode,
        points: nodoDTO.puntos.map(p => [p.x, p.y])
      };
    }
    
    return baseNode;
  },

  // 🔥 EXPORTAR FUNCIONES AUXILIARES
  esTipoPunto: esTipoPunto,
  parseNodeId: parseNodeId // 🔥 AGREGAR ESTA LÍNEA
};