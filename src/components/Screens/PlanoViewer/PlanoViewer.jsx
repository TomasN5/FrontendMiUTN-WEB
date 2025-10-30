import React, { useState, useCallback, useEffect, useRef } from "react";
import { usePlanoEditor } from './hooks/usePlanoEditor';
import { useSVGCoordinates } from './hooks/useSVGCoordinates';
import { useGPSNavigation } from './hooks/useGPSNavigation';
import { useEdgeDetection } from './hooks/useEdgeDetection';
import { useRouteAnimation } from './hooks/useRouteAnimation';
import { usePlanoManager } from './hooks/usePlanoManager';
import ControlPanel from './components/ControlPanel.jsx';
import SVGEditor from './components/SVGEditor';
import StairConfigModal from './components/StairConfigModal';
import SnapIndicators from './components/SnapIndicators';
import DebugEdges from './components/DebugEdges';
import { geometryUtils } from './utils/geometry';
import { AREA_TYPES } from './utils/constants';

const PlanoViewer = () => {
  const [zoomScale, setZoomScale] = useState(1);
  const [showStairConfig, setShowStairConfig] = useState(false);
  const [stairConfigData, setStairConfigData] = useState(null);
  const [edges, setEdges] = useState([]);
  const [snapResult, setSnapResult] = useState(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [showDebugEdges, setShowDebugEdges] = useState(false);
  const [floorNotifications, setFloorNotifications] = useState([]);
  
  // Hooks personalizados - ORDEN CORRECTO
  const editor = usePlanoEditor();
  const planoManager = usePlanoManager();
  const coordinates = useSVGCoordinates(planoManager.naturalWidth, planoManager.naturalHeight);
  const gps = useGPSNavigation(editor.areas, editor.points, editor.todosLosDatos);
  const edgeDetection = useEdgeDetection(planoManager.naturalWidth, planoManager.naturalHeight);
  const routeAnimation = useRouteAnimation();

  // Usar useRef para valores que cambian frecuentemente
  const editorRef = useRef();
  const prevRutaRef = useRef([]);
  const prevPlanoSrcRef = useRef('');

  // Actualizar la ref cuando editor cambie
  useEffect(() => {
    editorRef.current = editor;
  });

  // Inicializar planos al montar - SOLO UNA VEZ
  useEffect(() => {
    planoManager.inicializarPlanosCarrera('general');
  }, []);

  // Actualizar editor cuando cambia el plano
  useEffect(() => {
    if (planoManager.planoActual) {
      console.log("🔄 Cambiando a plano:", planoManager.planoActual.nombre);
      editor.actualizarPlanoActual(planoManager.planoActual);
    }
  }, [planoManager.planoActual, editor]);

  // CORREGIDO: Detectar bordes SOLO cuando cambia el src del plano
  useEffect(() => {
    const loadEdges = async () => {
      try {
        if (planoManager.src && planoManager.src !== prevPlanoSrcRef.current) {
          console.log("🔄 Cargando bordes para:", planoManager.src);
          prevPlanoSrcRef.current = planoManager.src;
          
          const detectedEdges = await edgeDetection.detectEdges(planoManager.src);
          setEdges(detectedEdges);
        }
      } catch (error) {
        console.warn('Error cargando bordes:', error);
        setEdges([]);
      }
    };
    
    loadEdges();
  }, [planoManager.src, edgeDetection]);

  useEffect(() => {
    // Verificar si hay IDs duplicados y limpiar automáticamente
    const verificarIDsUnicos = () => {
      const todosLosNodos = [];
      Object.values(editor.todosLosDatos || {}).forEach(planoData => {
        todosLosNodos.push(...(planoData.areas || []));
        todosLosNodos.push(...(planoData.points || []));
      });
      
      const ids = todosLosNodos.map(n => n.id);
      const idsUnicos = new Set(ids);
      
      if (ids.length !== idsUnicos.size) {
        console.warn("🔄 Se detectaron IDs duplicados, limpiando...");
        editor.limpiarIDsDuplicados();
      }
    };
    
    const timer = setTimeout(verificarIDsUnicos, 1000);
    return () => clearTimeout(timer);
  }, [editor]);

  // Helper para obtener todos los nodos del editor - DEFINIR PRIMERO
  const getAllNodesFromEditor = useCallback((editorInstance) => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(editorInstance.todosLosDatos || {}).forEach(planoData => {
      allAreas.push(...(planoData.areas || []));
      allPoints.push(...(planoData.points || []));
    });
    
    return { allAreas, allPoints };
  }, []);

  // Función para obtener información del nodo - DEFINIR SEGUNDO
  // Función para obtener información del nodo - DEFINIR SEGUNDO
const getNodeInfo = useCallback((nodeId) => {
  // Asegurarse de que nodeId sea un string
  const nodeIdStr = typeof nodeId === 'object' ? nodeId.id : nodeId;
  
  const currentEditor = editorRef.current;
  if (!currentEditor) {
    console.warn("❌ Editor no disponible");
    return null;
  }
  
  const { allAreas, allPoints } = getAllNodesFromEditor(currentEditor);
  const node = allAreas.find(a => a.id === nodeIdStr) || allPoints.find(p => p.id === nodeIdStr);
  
  if (!node) {
    console.warn(`❌ Nodo no encontrado: ${nodeIdStr}`);
    return null;
  }
  
  return node;
}, [getAllNodesFromEditor]);

  // Función para obtener coordenadas - DEFINIR TERCERO (usa getNodeInfo)
 const getPointCoordinates = useCallback((nodeId) => {
  // Asegurarse de que nodeId sea un string
  const nodeIdStr = typeof nodeId === 'object' ? nodeId.id : nodeId;
  
  const nodeInfo = getNodeInfo(nodeIdStr);
  
  if (!nodeInfo) {
    console.warn(`❌ No se pudo obtener info para nodo: ${nodeIdStr}`);
    return { x: -1000, y: -1000 }; // Fuera de vista
  }
  
  // SOLO devolver coordenadas si el nodo está en el plano actual
  if (nodeInfo.planoId === planoManager.planoActual?.id) {
    if (nodeInfo.tipo === "punto") {
      return { x: nodeInfo.x, y: nodeInfo.y };
    } else {
      const center = geometryUtils.getPolygonCenter(nodeInfo.points);
      return { x: center[0], y: center[1] };
    }
  } else {
    // Nodo no está en el plano actual - fuera de vista
    return { x: -1000, y: -1000 };
  }
}, [getNodeInfo, planoManager.planoActual]);
  // Handler para transiciones entre pisos (solo notifica, no cambia plano)
  const handleFloorTransition = useCallback((fromFloor, toFloor) => {
    console.log(`🔄 Ruta continúa en otro piso: ${fromFloor} → ${toFloor}`);
    
    // Agregar notificación
    const notification = {
      id: Date.now(),
      message: `La ruta continúa en: ${toFloor}`,
      fromFloor: fromFloor,
      toFloor: toFloor,
      timestamp: new Date().toISOString()
    };
    
    setFloorNotifications(prev => [...prev, notification]);
    
    // Auto-eliminar notificación después de 5 segundos
    setTimeout(() => {
      setFloorNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Animación de ruta - DEFINIR DESPUÉS de todas las funciones que usa
 useEffect(() => {
  if (gps.rutaActual.length > 1 && 
      JSON.stringify(gps.rutaActual) !== JSON.stringify(prevRutaRef.current)) {
    
    console.log("🎬 Iniciando animación multi-piso con notificaciones");
    
    // Asegurar que la ruta solo contiene IDs (strings)
    const rutaSoloIds = gps.rutaActual.map(node => 
      typeof node === 'object' ? node.id : node
    );
    
    // Función local para obtener info del nodo (usa la función ya definida)
    const getNodeInfoForAnimation = (nodeId) => {
      return getNodeInfo(nodeId);
    };

    // Usar animación con notificaciones
    routeAnimation.startRouteAnimation(
      rutaSoloIds, // ← Pasar solo IDs
      getPointCoordinates, 
      getNodeInfoForAnimation,
      handleFloorTransition,
      4000
    );
    
    prevRutaRef.current = gps.rutaActual;
  }
}, [gps.rutaActual, routeAnimation.startRouteAnimation, getPointCoordinates, getNodeInfo, handleFloorTransition]);

  // Reset animation cuando la ruta se vacía
  useEffect(() => {
    if (gps.rutaActual.length === 0 && prevRutaRef.current.length > 0) {
      routeAnimation.resetAnimation();
      prevRutaRef.current = [];
      setFloorNotifications([]);
    }
  }, [gps.rutaActual, routeAnimation.resetAnimation]);


  // Handlers
  const handleZoom = useCallback((ref) => {
    setZoomScale(ref.state.scale);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (editor.modoEdicion) {
      const rawCoords = coordinates.getRelativeCoords(e);
      
      let finalCoords = rawCoords;
      let snapData = null;
      
      if (isSnapEnabled && edges.length > 0) {
        snapData = edgeDetection.findMidPointBetweenWalls(edges, rawCoords);
        finalCoords = snapData.point;
        setSnapResult(snapData);
      } else {
        setSnapResult(null);
      }
      
      editor.handleMouseMove(e, () => finalCoords);
    }
  }, [editor.modoEdicion, editor.handleMouseMove, coordinates.getRelativeCoords, isSnapEnabled, edges, edgeDetection]);

  const handleClickSVG = useCallback((e) => {
    if (editor.modoEdicion) {
      const rawCoords = coordinates.getRelativeCoords(e);
      
      let finalCoords = rawCoords;
      
      if (isSnapEnabled && edges.length > 0) {
        const snapData = edgeDetection.findMidPointBetweenWalls(edges, rawCoords);
        finalCoords = snapData.point;
      }
      
      editor.handleClickSVG(e, () => finalCoords);
    }
  }, [editor.modoEdicion, editor.handleClickSVG, coordinates.getRelativeCoords, isSnapEnabled, edges, edgeDetection]);

  const handleGuardarArea = useCallback(() => {
    if (editor.puntosTemporales.length > 2) {
      if (editor.tipoActual === AREA_TYPES.ESCALERA) {
        setStairConfigData({
          points: editor.puntosTemporales,
          nombre: editor.nombreArea || "Escalera"
        });
        setShowStairConfig(true);
      } else {
        const nuevaArea = {
          id: `a${editor.areas.length + 1}`,
          nombre: editor.nombreArea || `Nueva ${editor.tipoActual}`,
          tipo: editor.tipoActual,
          points: editor.puntosTemporales
        };
        editor.handleGuardarArea(nuevaArea);
      }
    }
  }, [editor.puntosTemporales, editor.tipoActual, editor.nombreArea, editor.areas.length, editor.handleGuardarArea]);

  const handleGuardarPuntos = useCallback(() => {
    editor.handleGuardarPuntos();
  }, [editor.handleGuardarPuntos]);

  const handleSaveStair = useCallback((config) => {
    const nuevaEscalera = {
      id: `a${editor.areas.length + 1}`,
      nombre: config.nombre,
      tipo: AREA_TYPES.ESCALERA,
      points: stairConfigData.points,
      carreraActual: config.carreraActual,
      pisoActual: config.pisoActual,
      carreraDestino: config.carreraDestino,
      pisoDestino: config.pisoDestino,
      direccion: config.direccion
    };
    
    editor.handleGuardarArea(nuevaEscalera);
    setShowStairConfig(false);
    setStairConfigData(null);
  }, [editor.areas.length, editor.handleGuardarArea, stairConfigData]);

  const handleDeshacer = useCallback(() => {
    editor.handleDeshacer();
  }, [editor.handleDeshacer]);

  const handleCancelar = useCallback(() => {
    editor.handleCancelar();
    setSnapResult(null);
  }, [editor.handleCancelar]);

  const toggleSnap = useCallback(() => {
    setIsSnapEnabled(prev => !prev);
    setSnapResult(null);
  }, []);

  const todasLasEscaleras = Object.values(editor.todosLosDatos || {}).flatMap(planoData => 
    (planoData.areas || []).filter(area => area.tipo === "escalera")
  );

  const toggleDebugEdges = useCallback(() => {
    setShowDebugEdges(prev => !prev);
  }, []);

  const handleCalcularRuta = useCallback(() => {
    gps.handleCalcularRuta();
  }, [gps.handleCalcularRuta]);

  const handleSavePasillo = useCallback(() => {
    if (editor.selectedNode) {
      console.log("Guardando configuración de pasillo para:", editor.selectedNode.nombre);
      
      const { allAreas, allPoints } = getAllNodesFromEditor(editor);
      const idBase = allAreas.length + allPoints.length + 1;
      
      const pasilloMarcador = {
        id: `pm${idBase}`,
        tipo: AREA_TYPES.PASILLO,
        from: editor.selectedNode,
        to: editor.selectedNode,
        nombre: `Punto ${editor.selectedNode.nombre}`
      };
      
      editor.handleGuardarArea(pasilloMarcador);
      editor.setSelectedNode(null);
      
      alert(`✅ Punto ${editor.selectedNode.nombre} guardado como referencia de pasillo`);
    }
  }, [editor.selectedNode, editor.handleGuardarArea, editor.setSelectedNode, getAllNodesFromEditor]);

  const handleCambiarPlano = useCallback((planoId) => {
    console.log("🎯 Cambiando a plano ID:", planoId);
    planoManager.cambiarPlano(planoId);
    // NO limpiar la ruta - mantenerla visible
    setFloorNotifications([]);
  }, [planoManager]);

  const handleCambiarCarrera = useCallback((carrera) => {
    console.log("🏢 Cambiando a carrera:", carrera);
    planoManager.cambiarCarrera(carrera);
    // NO limpiar la ruta - mantenerla visible
    setFloorNotifications([]);
  }, [planoManager]);

  const handleClearRoute = useCallback(() => {
    gps.setRutaActual([]);
    routeAnimation.resetAnimation();
    setFloorNotifications([]);
  }, [gps.setRutaActual, routeAnimation.resetAnimation]);

  const containerStyle = {
    width: "100%",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f5f7fa 0%, #cbd5e1 100%)"
  };

  return (
    <div style={containerStyle}>
      <ControlPanel
        // Estado del editor
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        nombreArea={editor.nombreArea}
        puntosTemporales={editor.puntosTemporales}
        areas={editor.areas || []}
        points={editor.points || []}
        selectedNode={editor.selectedNode}
        todosLosDatos={editor.todosLosDatos || {}}
        
        // Navegación GPS
        origen={gps.origen}
        destino={gps.destino}
        rutaActual={gps.rutaActual}
        
        // Zoom y visualización
        zoomScale={zoomScale}
        isSnapEnabled={isSnapEnabled}
        showDebugEdges={showDebugEdges}
        edgesCount={edges.length}
        isRouteAnimating={routeAnimation.isAnimating}
        floorTransitions={[]} // routeAnimation no tiene esta propiedad
        
        // Sistema de planos
        carreraActual={planoManager.carreraActual}
        planoActual={planoManager.planoActual}
        planosCarreraActual={planoManager.planosCarreraActual || []}
        infoPlanoActual={planoManager.infoPlanoActual}
        carrerasDisponibles={planoManager.carrerasDisponibles || []}
        
        // Handlers de edición
        onSavePasillo={handleSavePasillo}
        onToggleEdit={() => editor.setModoEdicion(!editor.modoEdicion)}
        onChangeType={editor.setTipoActual}
        onChangeName={editor.setNombreArea}
        onSaveArea={handleGuardarArea}
        onSavePoints={handleGuardarPuntos}
        onUndo={handleDeshacer}
        onCancel={handleCancelar}
        
        // Handlers de navegación
        onCalculateRoute={handleCalcularRuta}
        onOriginChange={gps.setOrigen}
        onDestinationChange={gps.setDestino}
        onClearRoute={handleClearRoute}
        
        // Handlers de configuración
        onToggleSnap={toggleSnap}
        onToggleDebugEdges={toggleDebugEdges}
        onStopAnimation={routeAnimation.stopAnimation}
        
        // Handlers de planos
        onCambiarPlano={handleCambiarPlano}
        onCambiarCarrera={handleCambiarCarrera}
        onAvanzarPlano={planoManager.avanzarPlano}
        onRetrocederPlano={planoManager.retrocederPlano}
      />

      <SVGEditor
        src={planoManager.src}
        todosLosDatos={editor.todosLosDatos || {}} 
        naturalWidth={planoManager.naturalWidth}
        naturalHeight={planoManager.naturalHeight}
        areas={editor.areas || []}
        points={editor.points || []}
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        puntosTemporales={editor.puntosTemporales}
        cursorPos={editor.cursorPos}
        rutaActual={gps.rutaActual}
        animatedPath={routeAnimation.animatedPath}
        isRouteAnimating={routeAnimation.isAnimating}
        selectedNode={editor.selectedNode}
        zoomScale={zoomScale}
        debugGraph={gps.debugGraph}
        floorNotifications={floorNotifications}
        floorTransitions={[]} // routeAnimation no tiene esta propiedad
        planoActual={planoManager.planoActual}
        infoPlanoActual={planoManager.infoPlanoActual}
        onZoom={handleZoom}
        onClickSVG={handleClickSVG}
        onMouseMove={handleMouseMove}
        onNodeClick={editor.handleNodeClick}
        getRelativeCoords={{ ...coordinates, getPolygonCenter: geometryUtils.getPolygonCenter }}
        snapIndicators={
          <SnapIndicators 
            snapResult={snapResult} 
            isVisible={editor.modoEdicion && isSnapEnabled} 
          />
        }
        debugEdges={
          <DebugEdges 
            edges={edges} 
            isVisible={showDebugEdges} 
          />
        }
      />

      <StairConfigModal
        isOpen={showStairConfig}
        onClose={() => setShowStairConfig(false)}
        onSave={handleSaveStair}
        initialData={stairConfigData}
        todasLasEscaleras={todasLasEscaleras}
      />
    </div>
  );
};

export default PlanoViewer;