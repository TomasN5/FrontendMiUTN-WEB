import { useState, useCallback } from 'react';
import { geometryUtils } from '../utils/geometry';
import { AREA_TYPES } from '../utils/constants';

export const usePlanoEditor = () => {
  const [areas, setAreas] = useState([]);
  const [points, setPoints] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoActual, setTipoActual] = useState(AREA_TYPES.AULA);
  const [puntosTemporales, setPuntosTemporales] = useState([]);
  const [cursorPos, setCursorPos] = useState(null);
  const [nombreArea, setNombreArea] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);

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

// En la función handleGuardarArea, agrega soporte para escaleras:
const handleGuardarArea = useCallback(() => {
  if (puntosTemporales.length > 2) {
    const nuevaArea = {
      id: `a${areas.length + 1}`,
      nombre: nombreArea || `Nueva ${tipoActual}`,
      tipo: tipoActual,
      points: puntosTemporales,
      // Propiedades específicas para escaleras
      ...(tipoActual === AREA_TYPES.ESCALERA && {
        pisoActual: "1", // Por defecto
        pisoDestino: "2" // Por defecto
      })
    };
    setAreas((prev) => [...prev, nuevaArea]);
    resetEditorState();
  }
}, [puntosTemporales, tipoActual, nombreArea, areas.length]);

  const handleGuardarPuntos = useCallback(() => {
    if (puntosTemporales.length > 0) {
      const nuevosPuntos = puntosTemporales.map((pt, i) => ({
        id: `pt${points.length + i + 1}`,
        tipo: AREA_TYPES.PUNTO,
        nombre: `Punto ${points.length + i + 1}`,
        x: pt[0],
        y: pt[1],
      }));
      setPoints((prev) => [...prev, ...nuevosPuntos]);
      resetEditorState();
    }
  }, [puntosTemporales, points.length]);

  const handleDeshacer = useCallback(() => {
    setPuntosTemporales((prev) => prev.slice(0, -1));
  }, []);

  const handleCancelar = useCallback(() => {
    resetEditorState();
  }, []);

  const resetEditorState = () => {
    setPuntosTemporales([]);
    setModoEdicion(false);
    setCursorPos(null);
    setNombreArea("");
    setSelectedNode(null);
  };

  const handleNodeClick = useCallback((node) => {
    if (!modoEdicion || tipoActual !== AREA_TYPES.PASILLO) return;
    
    if (!selectedNode) {
      setSelectedNode(node);
    } else if (selectedNode.id !== node.id) {
      const idBase = areas.length + points.length + 1;
      const pasillo1 = {
        id: `p${idBase}`,
        tipo: AREA_TYPES.PASILLO,
        from: selectedNode,
        to: node,
        nombre: `Pasillo ${selectedNode.id}-${node.id}`
      };
      const pasillo2 = {
        id: `p${idBase + 1}`,
        tipo: AREA_TYPES.PASILLO,
        from: node,
        to: selectedNode,
        nombre: `Pasillo ${node.id}-${selectedNode.id}`
      };
      setAreas((prev) => [...prev, pasillo1, pasillo2]);
      setSelectedNode(null);
    }
  }, [modoEdicion, tipoActual, selectedNode, areas.length, points.length]);

  return {
    // Estado
    areas,
    points,
    modoEdicion,
    tipoActual,
    puntosTemporales,
    cursorPos,
    nombreArea,
    selectedNode,
    
    // Setters
    setAreas,
    setPoints,
    setModoEdicion,
    setTipoActual,
    setNombreArea,
    setSelectedNode,
    
    // Handlers
    handleClickSVG,
    handleMouseMove,
    handleGuardarArea,
    handleGuardarPuntos,
    handleDeshacer,
    handleCancelar,
    handleNodeClick
  };
};