import React, { useState, useCallback, useEffect, useRef } from "react";
import { usePlanoEditor } from './hooks/usePlanoEditor';
import { useSVGCoordinates } from './hooks/useSVGCoordinates';
import { useGPSNavigation } from './hooks/useGPSNavigation';
import { useEdgeDetection } from './hooks/useEdgeDetection';
import { useRouteAnimation } from './hooks/useRouteAnimation';
import { usePlanoManager } from './hooks/usePlanoManager';
import ControlPanel from './components/ControlPanel'
import SVGEditor from './components/SVGEditor';
import StairConfigModal from './components/StairConfigModal';
import SnapIndicators from './components/SnapIndicators';
import DebugEdges from './components/DebugEdges';
import { geometryUtils } from './utils/geometry';
import { AREA_TYPES } from './utils/constants';
import RelationsPanel from './components/RelationsPanel';
import './styles/PlanoViewer.css';

const PlanoViewer = () => {
  const [zoomScale, setZoomScale] = useState(1);
  const [showStairConfig, setShowStairConfig] = useState(false);
  const [stairConfigData, setStairConfigData] = useState(null);
  const [edges, setEdges] = useState([]);
  const [snapResult, setSnapResult] = useState(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [showDebugEdges, setShowDebugEdges] = useState(false);
  const [floorNotifications, setFloorNotifications] = useState([]);
  const [showRelationsPanel, setShowRelationsPanel] = useState(false);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [connectionLines, setConnectionLines] = useState([]);
  const [hideNames, setHideNames] = useState(false);
  
  // Hooks personalizados
  const editor = usePlanoEditor();
  const planoManager = usePlanoManager();
  const coordinates = useSVGCoordinates(planoManager.naturalWidth, planoManager.naturalHeight);
  const gps = useGPSNavigation(editor.areas, editor.points, editor.todosLosDatos);
  const edgeDetection = useEdgeDetection(planoManager.naturalWidth, planoManager.naturalHeight);
  const routeAnimation = useRouteAnimation();

  // Refs
  const editorRef = useRef();
  const prevRutaRef = useRef([]);
  const prevPlanoSrcRef = useRef('');

  // Actualizar ref del editor
  useEffect(() => {
    editorRef.current = editor;
  });

  // Inicializar planos
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

  // Detectar bordes
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

  // Verificar IDs duplicados
  useEffect(() => {
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

  // Helper functions
  const getAllNodesFromEditor = useCallback((editorInstance) => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(editorInstance.todosLosDatos || {}).forEach(planoData => {
      allAreas.push(...(planoData.areas || []));
      allPoints.push(...(planoData.points || []));
    });
    
    return { allAreas, allPoints };
  }, []);

  const getNodeInfo = useCallback((nodeId) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      console.warn("❌ Editor no disponible");
      return null;
    }
    
    const { allAreas, allPoints } = getAllNodesFromEditor(currentEditor);
    const node = allAreas.find(a => a.id === nodeId) || allPoints.find(p => p.id === nodeId);
    
    if (!node) {
      console.warn(`❌ Nodo no encontrado: ${nodeId}`);
      return null;
    }
    
    return node;
  }, [getAllNodesFromEditor]);

  const getPointCoordinates = useCallback((nodeId) => {
    const nodeInfo = getNodeInfo(nodeId);
    
    if (!nodeInfo) {
      console.warn(`❌ No se pudo obtener info para nodo: ${nodeId}`);
      return { x: -1000, y: -1000 };
    }
    
    // 🔥 VALIDAR QUE EL NODO TENGA PUNTOS VÁLIDOS
    if (nodeInfo.planoId === planoManager.planoActual?.id) {
      // 🔥 CORREGIDO: Incluir TODOS los tipos de puntos especiales
      const esPuntoEspecial = [
        AREA_TYPES.PUNTO,
        AREA_TYPES.EXTINTOR,
        AREA_TYPES.SALIDA_EMERGENCIA,
        AREA_TYPES.DESFIBRILADOR,
        AREA_TYPES.BOTIQUIN,
        AREA_TYPES.ALARMA,
        AREA_TYPES.TOTEM
      ].includes(nodeInfo.tipo);

      if (esPuntoEspecial) {
        return { 
          x: nodeInfo.x || -1000, 
          y: nodeInfo.y || -1000 
        };
      } else {
        // Validar que tenga points antes de calcular el centro
        if (!nodeInfo.points || !Array.isArray(nodeInfo.points) || nodeInfo.points.length === 0) {
          console.warn(`❌ Nodo ${nodeId} no tiene puntos válidos:`, nodeInfo);
          return { x: -1000, y: -1000 };
        }
        
        const center = geometryUtils.getPolygonCenter(nodeInfo.points);
        return { x: center[0], y: center[1] };
      }
    } else {
      return { x: -1000, y: -1000 };
    }
  }, [getNodeInfo, planoManager.planoActual]);

  const handleFloorTransition = useCallback((fromFloor, toFloor) => {
    console.log(`🔄 Ruta continúa en otro piso: ${fromFloor} → ${toFloor}`);
    
    const notification = {
      id: Date.now(),
      message: `La ruta continúa en: ${toFloor}`,
      fromFloor: fromFloor,
      toFloor: toFloor,
      timestamp: new Date().toISOString()
    };
    
    setFloorNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setFloorNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // 🔥 NUEVA FUNCIÓN: Navegar a nodo desde RelationsPanel
  const handleNavigateToNode = useCallback((node) => {
    console.log("🎯 Navegando a nodo desde RelationsPanel:", node.nombre, node.planoId);
    
    // 1. Cambiar al plano del nodo si es necesario
    if (node.planoId && node.planoId !== planoManager.planoActual?.id) {
      console.log("🔄 Cambiando al plano:", node.planoId);
      planoManager.cambiarPlano(node.planoId);
    }
    
    // 2. Aplicar highlight al nodo
    setHighlightedNode(node);
    
    // 3. Mostrar notificación
    const notification = {
      id: Date.now(),
      message: `Navegando a: ${node.nombre}`,
      type: 'navigation',
      timestamp: new Date().toISOString()
    };
    
    setFloorNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setFloorNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
    
    // 4. Quitar highlight después de un tiempo
    setTimeout(() => {
      setHighlightedNode(null);
      setConnectionLines([]);
    }, 5000);
    
  }, [planoManager]);

  // 🔥 NUEVA FUNCIÓN: Toggle destacado para nodos
  const handleToggleDestacado = useCallback((nodeId, destacado) => {
    console.log("⭐ Toggle destacado desde RelationsPanel:", nodeId, destacado);
    
    if (editor.actualizarDestacadoNodo) {
      editor.actualizarDestacadoNodo(nodeId, destacado);
    } else {
      console.warn("❌ Función actualizarDestacadoNodo no disponible en editor");
      // Implementación de respaldo
      const nodeInfo = getNodeInfo(nodeId);
      if (nodeInfo) {
        console.log(`🔄 Actualizando destacado para: ${nodeInfo.nombre} a ${destacado}`);
        // Aquí deberías implementar la lógica para actualizar el estado del nodo
      }
    }
    
    // Mostrar notificación
    const notification = {
      id: Date.now(),
      message: destacado ? `⭐ ${getNodeInfo(nodeId)?.nombre} marcado como destacado` : `☆ Destacado removido de ${getNodeInfo(nodeId)?.nombre}`,
      type: 'destacado',
      timestamp: new Date().toISOString()
    };
    
    setFloorNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setFloorNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  }, [editor, getNodeInfo]);

  // Animación de ruta
  useEffect(() => {
    if (gps.rutaActual.length > 1 && 
        JSON.stringify(gps.rutaActual) !== JSON.stringify(prevRutaRef.current)) {
      
      console.log("🎬 Iniciando animación multi-piso con notificaciones");
      
      const getNodeInfoForAnimation = (nodeId) => {
        return getNodeInfo(nodeId);
      };

      routeAnimation.startRouteAnimation(
        gps.rutaActual, 
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
          points: editor.puntosTemporales,
          destacado: editor.esDestacado || false // 🔥 INCLUIR ESTADO DESTACADO
        };
        editor.handleGuardarArea(nuevaArea);
      }
    }
  }, [editor.puntosTemporales, editor.tipoActual, editor.nombreArea, editor.areas.length, editor.handleGuardarArea, editor.esDestacado]);

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
      // Para compatibilidad, mantener estos campos
      carreraDestino: config.tipoDestino === 'multiple' ? 
        config.destinosMultiples[0]?.carrera : config.carreraDestino,
      pisoDestino: config.tipoDestino === 'multiple' ? 
        config.destinosMultiples[0]?.piso : config.pisoDestino,
      direccion: config.direccion,
      destacado: editor.esDestacado || false, // 🔥 INCLUIR ESTADO DESTACADO
      // Nuevo campo para destinos múltiples
      destinos: config.tipoDestino === 'multiple' ? 
        config.destinosMultiples.map(destino => ({
          carrera: destino.carrera,
          piso: destino.piso,
          direccion: destino.direccion
        })) : null
    };
    
    editor.handleGuardarArea(nuevaEscalera);
    setShowStairConfig(false);
    setStairConfigData(null);
  }, [editor.areas.length, editor.handleGuardarArea, stairConfigData, editor.esDestacado]);

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
        nombre: `Punto ${editor.selectedNode.nombre}`,
        destacado: editor.esDestacado || false // 🔥 INCLUIR ESTADO DESTACADO
      };
      
      editor.handleGuardarArea(pasilloMarcador);
      editor.setSelectedNode(null);
      
      alert(`✅ Punto ${editor.selectedNode.nombre} guardado como referencia de pasillo`);
    }
  }, [editor.selectedNode, editor.handleGuardarArea, editor.setSelectedNode, getAllNodesFromEditor, editor.esDestacado]);

  const handleCambiarPlano = useCallback((planoId) => {
    console.log("🎯 Cambiando a plano ID:", planoId);
    planoManager.cambiarPlano(planoId);
    setFloorNotifications([]);
    setHighlightedNode(null);
    setConnectionLines([]);
  }, [planoManager]);

  const handleCambiarCarrera = useCallback((carrera) => {
    console.log("🏢 Cambiando a carrera:", carrera);
    planoManager.cambiarCarrera(carrera);
    setFloorNotifications([]);
    setHighlightedNode(null);
    setConnectionLines([]);
  }, [planoManager]);

  const handleClearRoute = useCallback(() => {
    gps.setOrigen("");
    gps.setDestino("");
    gps.setRutaActual([]);
    routeAnimation.resetAnimation();
    setFloorNotifications([]);
    setHighlightedNode(null);
    setConnectionLines([]);
  }, [gps.setOrigen, gps.setDestino, gps.setRutaActual, routeAnimation.resetAnimation]);

  // Función para encontrar conexiones de un nodo
  const findNodeConnections = useCallback((nodeId) => {
    const connections = [];
    
    Object.values(editor.todosLosDatos || {}).forEach(planoData => {
      if (planoData.areas) {
        planoData.areas
          .filter(area => area.tipo === AREA_TYPES.PASILLO)
          .forEach(pasillo => {
            if (pasillo.from && pasillo.from.id === nodeId) {
              connections.push({ node: pasillo.to, type: 'pasillo' });
            }
            if (pasillo.to && pasillo.to.id === nodeId) {
              connections.push({ node: pasillo.from, type: 'pasillo' });
            }
          });
      }
    });
    
    return connections;
  }, [editor.todosLosDatos]);

  // 🔥 CORREGIDO: Handler para click en nodo desde RelationsPanel - AHORA INCLUYE TODOS LOS TIPOS
  const handleNodeClick = useCallback((node) => {
    console.log("🎯 handleNodeClick recibió nodo:", node?.nombre, "Tipo:", node?.tipo);
    
    // Si estamos en modo edición de pasillos, usar el handler original
    if (editor.modoEdicion && editor.tipoActual === AREA_TYPES.PASILLO) {
      editor.handleNodeClick(node);
      return;
    }
    
    if (node && node.id) {
      console.log("✅ Aplicando highlight en mapa para:", node.nombre, "Tipo:", node.tipo);
      setHighlightedNode(node);
      
      // Encontrar conexiones de este nodo
      const connections = findNodeConnections(node.id);
      console.log("🔗 Conexiones encontradas:", connections.length);
      
      // Crear líneas para las conexiones
      const lines = connections.map(conn => {
        const fromCoords = getPointCoordinates(node.id);
        const toCoords = getPointCoordinates(conn.node.id);
        return { 
          from: fromCoords, 
          to: toCoords,
          isClicked: true 
        };
      });
      
      setConnectionLines(lines);
    }
  }, [getPointCoordinates, findNodeConnections, editor.modoEdicion, editor.tipoActual, editor.handleNodeClick]);

  const handleNodeLeave = useCallback(() => {
    console.log("🎯 handleNodeLeave - Limpiando highlight");
    setHighlightedNode(null);
    setConnectionLines([]);
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    console.log("🗑️ Eliminando nodo desde RelationsPanel:", nodeId);
    editor.handleEliminarNodo(nodeId);
    // Limpiar highlight si el nodo eliminado estaba seleccionado
    if (highlightedNode && highlightedNode.id === nodeId) {
      setHighlightedNode(null);
      setConnectionLines([]);
    }
  }, [editor.handleEliminarNodo, highlightedNode]);

  const handleDeleteConnection = useCallback((connectionId) => {
    console.log("🗑️ Eliminando conexión desde RelationsPanel:", connectionId);
    editor.handleEliminarConexion(connectionId);
    // Actualizar connectionLines si es necesario
    setConnectionLines(prev => prev.filter(line => 
      !line.connectionId || line.connectionId !== connectionId
    ));
  }, [editor.handleEliminarConexion]);

  return (
    <div className="plano-viewer">
      <ControlPanel
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        nombreArea={editor.nombreArea}
        puntosTemporales={editor.puntosTemporales}
        areas={editor.areas || []}
        points={editor.points || []}
        selectedNode={editor.selectedNode}
        todosLosDatos={editor.todosLosDatos || {}}
        
        origen={gps.origen}
        destino={gps.destino}
        rutaActual={gps.rutaActual}
        
        zoomScale={zoomScale}
        isSnapEnabled={isSnapEnabled}
        showDebugEdges={showDebugEdges}
        edgesCount={edges.length}
        isRouteAnimating={routeAnimation.isAnimating}
 
        floorTransitions={[]}
        
        carreraActual={planoManager.carreraActual}
        planoActual={planoManager.planoActual}
        planosCarreraActual={planoManager.planosCarreraActual || []}
        infoPlanoActual={planoManager.infoPlanoActual}
        carrerasDisponibles={planoManager.carrerasDisponibles || []}
        
        onSavePasillo={handleSavePasillo}
        onToggleEdit={() => editor.setModoEdicion(!editor.modoEdicion)}
        onChangeType={editor.setTipoActual}
        onChangeName={editor.setNombreArea}
        onSaveArea={handleGuardarArea}
        onSavePoints={handleGuardarPuntos}
        onUndo={handleDeshacer}
        onCancel={handleCancelar}
        
        onCalculateRoute={handleCalcularRuta}
        onOriginChange={gps.setOrigen}
        onDestinationChange={gps.setDestino}
        onClearRoute={handleClearRoute}
        
        onToggleSnap={toggleSnap}
        onToggleDebugEdges={toggleDebugEdges}
        onStopAnimation={routeAnimation.stopAnimation}
        
        onCambiarPlano={handleCambiarPlano}
        onCambiarCarrera={handleCambiarCarrera}
        onAvanzarPlano={planoManager.avanzarPlano}
        onRetrocederPlano={planoManager.retrocederPlano}

        onToggleRelationsPanel={() => setShowRelationsPanel(prev => !prev)}

        onExportAllData={editor.exportarTodosLosDatos}
        onExportByType={editor.exportarDatosPorTipo}
        onExportJSON={editor.exportarDatosJSON}
        onDescargarJSON={editor.descargarJSON}
        onCopiarJSON={editor.copiarJSONAlPortapapeles}
        onSimularGuardado={editor.simularGuardadoEnHooks}
        
        onShowRelationsPanel={() => setShowRelationsPanel(true)}
        hideNames={hideNames}
        onToggleHideNames={setHideNames}

        // 🔥 NUEVAS PROPS PARA DESTACADOS
        esDestacado={editor.esDestacado || false}
        onToggleDestacado={editor.toggleDestacado}
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
        floorTransitions={[]}
        planoActual={planoManager.planoActual}
        infoPlanoActual={planoManager.infoPlanoActual}
        finalPath={routeAnimation.finalPath}
        onZoom={handleZoom}
        onClickSVG={handleClickSVG}
        onMouseMove={handleMouseMove}
        onNodeClick={editor.handleNodeClick}
        hideNames={hideNames}
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
        highlightedNode={highlightedNode}
        connectionLines={connectionLines}
      />

      {editor.modoEdicion && (
        <RelationsPanel
          isVisible={showRelationsPanel}
          onClose={() => setShowRelationsPanel(false)}
          areas={editor.areas}
          points={editor.points}
          todosLosDatos={editor.todosLosDatos}
          planoActual={planoManager.planoActual}
          onNodeClick={handleNodeClick}
          onNodeLeave={handleNodeLeave}
          highlightedNode={highlightedNode}
          connectionLines={connectionLines}
          onDeleteNode={handleDeleteNode}
          onDeleteConnection={handleDeleteConnection}
          onNavigateToNode={handleNavigateToNode}
          // 🔥 NUEVA PROP: Función para destacar nodos
          onToggleDestacado={handleToggleDestacado}
        />
      )}

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