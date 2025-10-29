import React, { useState, useCallback, useEffect, useRef } from "react";
import { usePlanoEditor } from './hooks/usePlanoEditor';
import { useSVGCoordinates } from './hooks/useSVGCoordinates';
import { useGPSNavigation } from './hooks/useGPSNavigation';
import { useEdgeDetection } from './hooks/useEdgeDetection';
import { useRouteAnimation } from './hooks/useRouteAnimation';
import ControlPanel from './components/ControlPanel';
import SVGEditor from './components/SVGEditor';
import StairConfigModal from './components/StairConfigModal';
import SnapIndicators from './components/SnapIndicators';
import DebugEdges from './components/DebugEdges';
import { geometryUtils } from './utils/geometry';
import { AREA_TYPES } from './utils/constants';

const PlanoViewer = ({
  src,
  naturalWidth = 1012,
  naturalHeight = 768
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [showStairConfig, setShowStairConfig] = useState(false);
  const [stairConfigData, setStairConfigData] = useState(null);
  const [edges, setEdges] = useState([]);
  const [snapResult, setSnapResult] = useState(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [showDebugEdges, setShowDebugEdges] = useState(false);
  
  // Hooks personalizados
  const editor = usePlanoEditor();
  const coordinates = useSVGCoordinates(naturalWidth, naturalHeight);
  const gps = useGPSNavigation(editor.areas, editor.points);
  const edgeDetection = useEdgeDetection(naturalWidth, naturalHeight);
  const routeAnimation = useRouteAnimation();

  // Usar useRef para valores que cambian frecuentemente
  const editorRef = useRef();
  const prevRutaRef = useRef([]);

  // Actualizar la ref cuando editor cambie
  useEffect(() => {
    editorRef.current = editor;
  });

  // Detectar bordes cuando se carga la imagen
  useEffect(() => {
    const loadEdges = async () => {
      try {
      
        const detectedEdges = await edgeDetection.detectEdges(src);
        setEdges(detectedEdges);
       
      } catch (error) {
        
        setEdges([]);
      }
    };
    
    if (src) {
      loadEdges();
    }
  }, [src, edgeDetection]);

  // SOLUCIÓN: useEffect separado y simplificado para la animación
  useEffect(() => {
    // Solo animar si la ruta cambió y tiene más de 1 punto
    if (gps.rutaActual.length > 1 && 
        JSON.stringify(gps.rutaActual) !== JSON.stringify(prevRutaRef.current)) {
      
      console.log("Iniciando animación para nueva ruta:", gps.rutaActual);
      
      const getPointCoordinates = (nodeId) => {
        const currentEditor = editorRef.current;
        if (!currentEditor) return { x: 0, y: 0 };
        
        const node = currentEditor.areas.find(a => a.id === nodeId) || 
                     currentEditor.points.find(p => p.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        
        if (node.tipo === "punto") {
          return { x: node.x, y: node.y };
        } else {
          const center = geometryUtils.getPolygonCenter(node.points);
          return { x: center[0], y: center[1] };
        }
      };

      routeAnimation.startRouteAnimation(gps.rutaActual, getPointCoordinates, 1500);
      prevRutaRef.current = gps.rutaActual;
    }
  }, [gps.rutaActual, routeAnimation]); // ← Solo estas dependencias

  // Reset animation cuando la ruta se vacía
  useEffect(() => {
    if (gps.rutaActual.length === 0 && prevRutaRef.current.length > 0) {
      routeAnimation.resetAnimation();
      prevRutaRef.current = [];
    }
  }, [gps.rutaActual, routeAnimation]);

  // ... (mantén todos los demás handlers igual) ...
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
        editor.setAreas((prev) => [...prev, nuevaArea]);
        editor.handleCancelar();
      }
    }
  }, [editor.puntosTemporales, editor.tipoActual, editor.nombreArea, editor.areas.length, editor.handleCancelar]);

  const handleGuardarPuntos = useCallback(() => {
    if (editor.puntosTemporales.length > 0) {
      const nuevosPuntos = editor.puntosTemporales.map((pt, i) => ({
        id: `pt${editor.points.length + i + 1}`,
        tipo: AREA_TYPES.PUNTO,
        nombre: `Punto ${editor.points.length + i + 1}`,
        x: pt[0],
        y: pt[1],
      }));
      editor.setPoints((prev) => [...prev, ...nuevosPuntos]);
      editor.handleCancelar();
    }
  }, [editor.puntosTemporales, editor.points.length, editor.handleCancelar]);

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
    
    editor.setAreas((prev) => [...prev, nuevaEscalera]);
    editor.handleCancelar();
    setShowStairConfig(false);
    setStairConfigData(null);
  }, [editor.areas.length, editor.handleCancelar, stairConfigData]);

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

  const toggleDebugEdges = useCallback(() => {
    setShowDebugEdges(prev => !prev);
  }, []);

  const handleCalcularRuta = useCallback(() => {
    gps.handleCalcularRuta();
  }, [gps.handleCalcularRuta]);

  const containerStyle = {
    width: "100%",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f5f7fa 0%, #cbd5e1 100%)"
  };

  const handleSavePasillo = useCallback(() => {
      // Si hay un nodo seleccionado, forzar la creación de un pasillo
      // Esto simula hacer clic en el mismo nodo para "guardar" la selección actual
      if (editor.selectedNode) {
        // Podemos crear un pasillo especial o simplemente resetear la selección
        console.log("Guardando configuración de pasillo para:", editor.selectedNode.nombre);
        
        // Opción 1: Crear un pasillo que conecte consigo mismo (como marcador)
        const idBase = editor.areas.length + editor.points.length + 1;
        const pasilloMarcador = {
          id: `pm${idBase}`,
          tipo: AREA_TYPES.PASILLO,
          from: editor.selectedNode,
          to: editor.selectedNode, // Se conecta consigo mismo
          nombre: `Punto ${editor.selectedNode.nombre}`
        };
        
        editor.setAreas((prev) => [...prev, pasilloMarcador]);
        
        // Opción 2: Simplemente resetear la selección
        editor.setSelectedNode(null);
        
        // Mostrar mensaje de confirmación
        alert(`✅ Punto ${editor.selectedNode.nombre} guardado como referencia de pasillo`);
      }
    }, [editor.selectedNode, editor.areas.length, editor.points.length, editor.setAreas, editor.setSelectedNode]);

  return (
    <div style={containerStyle}>
      <ControlPanel
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        nombreArea={editor.nombreArea}
        puntosTemporales={editor.puntosTemporales}
        origen={gps.origen}
        destino={gps.destino}
        areas={editor.areas}
        points={editor.points}
        zoomScale={zoomScale}
        isSnapEnabled={isSnapEnabled}
        showDebugEdges={showDebugEdges}
        edgesCount={edges.length}
        isRouteAnimating={routeAnimation.isAnimating}
        selectedNode={editor.selectedNode}
        onSavePasillo={handleSavePasillo}
        
        onToggleEdit={() => editor.setModoEdicion(true)}
        onChangeType={editor.setTipoActual}
        onChangeName={editor.setNombreArea}
        onSaveArea={handleGuardarArea}
        onSavePoints={handleGuardarPuntos}
        onUndo={handleDeshacer}
        onCancel={handleCancelar}
        onCalculateRoute={handleCalcularRuta}
        onOriginChange={gps.setOrigen}
        onDestinationChange={gps.setDestino}
        onToggleSnap={toggleSnap}
        onToggleDebugEdges={toggleDebugEdges}
        onStopAnimation={routeAnimation.stopAnimation}
      />

      <SVGEditor
        src={src}
        naturalWidth={naturalWidth}
        naturalHeight={naturalHeight}
        areas={editor.areas}
        points={editor.points}
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        puntosTemporales={editor.puntosTemporales}
        cursorPos={editor.cursorPos}
        rutaActual={gps.rutaActual}
        animatedPath={routeAnimation.animatedPath}
        isRouteAnimating={routeAnimation.isAnimating}
        selectedNode={editor.selectedNode}
        zoomScale={zoomScale}
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
      />
    </div>
  );
};

export default PlanoViewer;