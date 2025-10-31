import { useState, useCallback } from 'react';
import { geometryUtils } from '../utils/geometry';
import { AREA_TYPES } from '../utils/constants';

export const usePlanoEditor = () => {
  // Estado principal que almacena TODOS los datos por plano
  const [datosPorPlano, setDatosPorPlano] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoActual, setTipoActual] = useState(AREA_TYPES.AULA);
  const [puntosTemporales, setPuntosTemporales] = useState([]);
  const [cursorPos, setCursorPos] = useState(null);
  const [nombreArea, setNombreArea] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [planoActual, setPlanoActual] = useState(null);

  // Generar ID único usando timestamp + random
  const generarIdUnico = useCallback((prefijo) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefijo}_${timestamp}_${random}`;
  }, []);

  // Obtener datos del plano actual
  const getDatosPlanoActual = useCallback(() => {
    if (!planoActual) return { areas: [], points: [] };
    return datosPorPlano[planoActual.id] || { areas: [], points: [] };
  }, [planoActual, datosPorPlano]);

  const { areas, points } = getDatosPlanoActual();

  // FUNCIÓN resetEditorState
  const resetEditorState = useCallback(() => {
    setPuntosTemporales([]);
    setModoEdicion(false);
    setCursorPos(null);
    setNombreArea("");
    setSelectedNode(null);
  }, []);

  // Actualizar datos de un plano específico
  const actualizarDatosPlano = useCallback((planoId, nuevasAreas, nuevosPoints) => {
    setDatosPorPlano(prev => ({
      ...prev,
      [planoId]: {
        areas: nuevasAreas || [],
        points: nuevosPoints || []
      }
    }));
  }, []);

  const limpiarIDsDuplicados = useCallback(() => {
  setDatosPorPlano(prev => {
    const nuevosDatos = {};
    
    Object.keys(prev).forEach(planoId => {
      const planoData = prev[planoId];
      const areasUnicas = [];
      const pointsUnicos = [];
      const idsUsados = new Set();
      
      // Procesar áreas
      planoData.areas.forEach(area => {
        let nuevoId = area.id;
        if (idsUsados.has(area.id)) {
          nuevoId = generarIdUnico('area_corregida');
          console.warn(`🔄 Corrigiendo ID duplicado: ${area.id} -> ${nuevoId}`);
        }
        idsUsados.add(nuevoId);
        areasUnicas.push({ ...area, id: nuevoId });
      });
      
      // Procesar puntos
      planoData.points.forEach(point => {
        let nuevoId = point.id;
        if (idsUsados.has(point.id)) {
          nuevoId = generarIdUnico('punto_corregido');
          console.warn(`🔄 Corrigiendo ID duplicado: ${point.id} -> ${nuevoId}`);
        }
        idsUsados.add(nuevoId);
        pointsUnicos.push({ ...point, id: nuevoId });
      });
      
      nuevosDatos[planoId] = {
        areas: areasUnicas,
        points: pointsUnicos
      };
    });
    
    return nuevosDatos;
  });
}, [generarIdUnico]);
  

  // En usePlanoEditor.js - función para limpiar IDs duplicados

  const handleClickSVG = useCallback((e, getRelativeCoords) => {
    if (!modoEdicion) return;

    const { x, y } = getRelativeCoords(e);

    if (tipoActual === AREA_TYPES.PUNTO) {
      setPuntosTemporales((prev) => [...prev, [x, y]]);
      return;
    }

    if (tipoActual === AREA_TYPES.PASILLO) return;

    setPuntosTemporales((prev) => [...prev, [x, y]]);
  }, [modoEdicion, tipoActual]);

  const handleMouseMove = useCallback((e, getRelativeCoords) => {
    if (!modoEdicion || tipoActual === AREA_TYPES.PASILLO) return;
    const { x, y } = getRelativeCoords(e);
    setCursorPos([x, y]);
  }, [modoEdicion, tipoActual]);

  // Cuando se crea un área - GUARDAR CON ID ÚNICO
  const handleGuardarArea = useCallback((nuevaArea, planoInfo) => {
    if (puntosTemporales.length > 2 && planoInfo) {
      const areaConInfo = {
        ...nuevaArea,
        id: generarIdUnico('area'), // ← ID único con timestamp
        carrera: planoInfo.carrera || 'general',
        piso: planoInfo.piso || 'planta_principal',
        planoId: planoInfo.id
      };
      
      const datosActuales = getDatosPlanoActual();
      const nuevasAreas = [...datosActuales.areas, areaConInfo];
      
      actualizarDatosPlano(planoInfo.id, nuevasAreas, datosActuales.points);
      resetEditorState();
      
      console.log("✅ Área creada con ID único:", areaConInfo.id);
    }
  }, [puntosTemporales, getDatosPlanoActual, actualizarDatosPlano, resetEditorState, generarIdUnico]);

  // Cuando se crean puntos - GUARDAR CON IDs ÚNICOS
  const handleGuardarPuntos = useCallback((planoInfo) => {
    if (puntosTemporales.length > 0 && planoInfo) {
      const datosActuales = getDatosPlanoActual();
      const nuevosPuntos = puntosTemporales.map((pt, i) => ({
        id: generarIdUnico('punto'), // ← ID único con timestamp
        tipo: AREA_TYPES.PUNTO,
        nombre: `Punto ${datosActuales.points.length + i + 1}`,
        x: pt[0],
        y: pt[1],
        carrera: planoInfo.carrera || 'general',
        piso: planoInfo.piso || 'planta_principal',
        planoId: planoInfo.id
      }));
      
      const nuevosPoints = [...datosActuales.points, ...nuevosPuntos];
      actualizarDatosPlano(planoInfo.id, datosActuales.areas, nuevosPoints);
      resetEditorState();
      
      console.log("✅ Puntos creados con IDs únicos:", nuevosPuntos.map(p => p.id));
    }
  }, [puntosTemporales, getDatosPlanoActual, actualizarDatosPlano, resetEditorState, generarIdUnico]);

  const handleDeshacer = useCallback(() => {
    setPuntosTemporales((prev) => prev.slice(0, -1));
  }, []);

  const handleCancelar = useCallback(() => {
    resetEditorState();
  }, [resetEditorState]);

  const handleNodeClick = useCallback((node) => {
    if (!modoEdicion || tipoActual !== AREA_TYPES.PASILLO || !planoActual) return;
    
    if (!selectedNode) {
      setSelectedNode(node);
    } else if (selectedNode.id !== node.id) {
      const datosActuales = getDatosPlanoActual();
      
      const pasillo1 = {
        id: generarIdUnico('pasillo'), // ← ID único con timestamp
        tipo: AREA_TYPES.PASILLO,
        from: selectedNode,
        to: node,
        nombre: `Pasillo ${selectedNode.nombre}-${node.nombre}`,
        carrera: planoActual.carrera || 'general',
        piso: planoActual.piso || 'planta_principal',
        planoId: planoActual.id
      };
      const pasillo2 = {
        id: generarIdUnico('pasillo'), // ← ID único con timestamp
        tipo: AREA_TYPES.PASILLO,
        from: node,
        to: selectedNode,
        nombre: `Pasillo ${node.nombre}-${selectedNode.nombre}`,
        carrera: planoActual.carrera || 'general',
        piso: planoActual.piso || 'planta_principal',
        planoId: planoActual.id
      };
      
      const nuevasAreas = [...datosActuales.areas, pasillo1, pasillo2];
      actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
      setSelectedNode(null);
      
      console.log("✅ Pasillos creados con IDs únicos:", pasillo1.id, pasillo2.id);
    }
  }, [modoEdicion, tipoActual, selectedNode, planoActual, getDatosPlanoActual, actualizarDatosPlano, generarIdUnico]);

  // Actualizar plano actual cuando cambia
  const actualizarPlanoActual = useCallback((planoInfo) => {
    setPlanoActual(planoInfo);
    
    // Inicializar datos si no existen para este plano
    if (planoInfo && !datosPorPlano[planoInfo.id]) {
      actualizarDatosPlano(planoInfo.id, [], []);
    }
  }, [datosPorPlano, actualizarDatosPlano]);

  const handleEliminarNodo = useCallback((nodeId) => {
  if (!planoActual) return;
  
  console.log("🗑️ Eliminando nodo:", nodeId);
  
  const datosActuales = getDatosPlanoActual();
  
  // Buscar y eliminar el nodo de areas o points
  const nuevasAreas = datosActuales.areas.filter(area => area.id !== nodeId);
  const nuevosPoints = datosActuales.points.filter(point => point.id !== nodeId);
  
  // También eliminar todas las conexiones (pasillos) que involucren este nodo
  const areasFiltradas = nuevasAreas.filter(area => {
    if (area.tipo === AREA_TYPES.PASILLO) {
      // Eliminar pasillos que conecten con el nodo eliminado
      return area.from?.id !== nodeId && area.to?.id !== nodeId;
    }
    return true;
  });
  
  actualizarDatosPlano(planoActual.id, areasFiltradas, nuevosPoints);
  console.log("✅ Nodo eliminado:", nodeId);
  
  // Si el nodo seleccionado era el que se eliminó, limpiar selección
  if (selectedNode && selectedNode.id === nodeId) {
    setSelectedNode(null);
  }
}, [planoActual, getDatosPlanoActual, actualizarDatosPlano, selectedNode]);

    // 🔥 NUEVA FUNCIÓN: Eliminar conexión (pasillo)
    const handleEliminarConexion = useCallback((conexionId) => {
      if (!planoActual) return;
      
      console.log("🗑️ Eliminando conexión:", conexionId);
      
      const datosActuales = getDatosPlanoActual();
      
      // Eliminar la conexión (pasillo) por su ID
      const nuevasAreas = datosActuales.areas.filter(area => 
        area.id !== conexionId
      );
      
      actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
      console.log("✅ Conexión eliminada:", conexionId);
    }, [planoActual, getDatosPlanoActual, actualizarDatosPlano]);

    // 🔥 NUEVA FUNCIÓN: Eliminar todos los pasillos de un nodo específico
    const handleEliminarConexionesNodo = useCallback((nodeId) => {
      if (!planoActual) return;
      
      console.log("🗑️ Eliminando todas las conexiones del nodo:", nodeId);
      
      const datosActuales = getDatosPlanoActual();
      
      // Eliminar todos los pasillos que involucren este nodo
      const nuevasAreas = datosActuales.areas.filter(area => {
        if (area.tipo === AREA_TYPES.PASILLO) {
          return area.from?.id !== nodeId && area.to?.id !== nodeId;
        }
        return true;
      });
      
      actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
      console.log("✅ Conexiones eliminadas para nodo:", nodeId);
    }, [planoActual, getDatosPlanoActual, actualizarDatosPlano]);

  return {
    // Estado del plano actual
    areas,
    points,
    modoEdicion,
    tipoActual,
    puntosTemporales,
    cursorPos,
    nombreArea,
    selectedNode,
    planoActual,
    
    // Setters
    setModoEdicion,
    setTipoActual,
    setNombreArea,
    setSelectedNode,
    setCursorPos,
    actualizarPlanoActual,
    
    // Handlers
    handleClickSVG,
    handleMouseMove,
    handleGuardarArea: (nuevaArea) => handleGuardarArea(nuevaArea, planoActual),
    handleGuardarPuntos: () => handleGuardarPuntos(planoActual),
    handleDeshacer,
    handleCancelar,
    handleNodeClick,
    limpiarIDsDuplicados,
    
    // 🔥 NUEVOS HANDLERS PARA ELIMINAR
    handleEliminarNodo,
    handleEliminarConexion,
    handleEliminarConexionesNodo,

    // Para debug - ver todos los datos
    todosLosDatos: datosPorPlano
  };
};