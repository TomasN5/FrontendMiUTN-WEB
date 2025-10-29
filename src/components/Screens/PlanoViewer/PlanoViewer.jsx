import React, { useState, useCallback, useEffect } from "react";
import { usePlanoEditor } from './hooks/usePlanoEditor';
import { useSVGCoordinates } from './hooks/useSVGCoordinates';
import { useGPSNavigation } from './hooks/useGPSNavigation';
import { useEdgeDetection } from './hooks/useEdgeDetection';
import ControlPanel from './components/ControlPanel';
import SVGEditor from './components/SVGEditor';
import StairConfigModal from './components/StairConfigModal';
import SnapIndicators from './components/SnapIndicators';
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
  
  // Hooks personalizados
  const editor = usePlanoEditor();
  const coordinates = useSVGCoordinates(naturalWidth, naturalHeight);
  const gps = useGPSNavigation(editor.areas, editor.points);
  const edgeDetection = useEdgeDetection(naturalWidth, naturalHeight);

  // Detectar bordes cuando se carga la imagen
  useEffect(() => {
    const loadEdges = async () => {
      try {
        const detectedEdges = await edgeDetection.detectEdges(src);
        setEdges(detectedEdges);
        console.log(`Detectados ${detectedEdges.length} bordes`);
      } catch (error) {
        console.warn('No se pudieron detectar bordes:', error);
      }
    };
    
    loadEdges();
  }, [src, edgeDetection]);

  // Handler optimizado para zoom
  const handleZoom = useCallback((ref) => {
    setZoomScale(ref.state.scale);
  }, []);

  // Handler para movimiento del mouse con snap
  const handleMouseMove = useCallback((e) => {
    if (editor.modoEdicion) {
      const coords = coordinates.getRelativeCoords(e);
      
      let finalCoords = coords;
      let snapData = null;
      
      // Aplicar snap si está habilitado y hay bordes detectados
      if (isSnapEnabled && edges.length > 0) {
        snapData = edgeDetection.findMidPointBetweenWalls(edges, coords);
        finalCoords = snapData.point;
        setSnapResult(snapData);
      } else {
        setSnapResult(null);
      }
      
      editor.handleMouseMove(e, () => finalCoords);
    }
  }, [editor.modoEdicion, editor.handleMouseMove, coordinates.getRelativeCoords, isSnapEnabled, edges, edgeDetection]);

  // Handler para clicks en SVG con snap
  const handleClickSVG = useCallback((e) => {
    if (editor.modoEdicion) {
      const coords = coordinates.getRelativeCoords(e);
      
      let finalCoords = coords;
      
      // Aplicar snap si está habilitado
      if (isSnapEnabled && edges.length > 0) {
        const snapData = edgeDetection.findMidPointBetweenWalls(edges, coords);
        finalCoords = snapData.point;
      }
      
      // Crear un evento simulado con las coordenadas ajustadas
      const simulatedEvent = {
        ...e,
        simulatedCoords: finalCoords
      };
      
      editor.handleClickSVG(simulatedEvent, () => finalCoords);
    }
  }, [editor.modoEdicion, editor.handleClickSVG, coordinates.getRelativeCoords, isSnapEnabled, edges, edgeDetection]);

  // Handler para guardar área (modificado para escaleras)
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

  // Handler para guardar puntos
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

  // Handler para guardar la escalera configurada
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

  // Handler para deshacer
  const handleDeshacer = useCallback(() => {
    editor.handleDeshacer();
  }, [editor.handleDeshacer]);

  // Handler para cancelar
  const handleCancelar = useCallback(() => {
    editor.handleCancelar();
    setSnapResult(null);
  }, [editor.handleCancelar]);

  // Toggle para snap
  const toggleSnap = useCallback(() => {
    setIsSnapEnabled(prev => !prev);
    setSnapResult(null);
  }, []);

  // Estilos inline para el contenedor principal
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
        // Estado
        modoEdicion={editor.modoEdicion}
        tipoActual={editor.tipoActual}
        nombreArea={editor.nombreArea}
        puntosTemporales={editor.puntosTemporales}
        origen={gps.origen}
        destino={gps.destino}
        areas={editor.areas}
        points={editor.points}
        zoomScale={zoomScale}
        
        // NUEVAS PROPS PARA SNAP
        isSnapEnabled={isSnapEnabled}
        onToggleSnap={toggleSnap}
        
        // Handlers existentes
        onToggleEdit={() => editor.setModoEdicion(true)}
        onChangeType={editor.setTipoActual}
        onChangeName={editor.setNombreArea}
        onSaveArea={handleGuardarArea}
        onSavePoints={handleGuardarPuntos}
        onUndo={handleDeshacer}
        onCancel={handleCancelar}
        onCalculateRoute={gps.handleCalcularRuta}
        onOriginChange={gps.setOrigen}
        onDestinationChange={gps.setDestino}
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
      />

      {/* Modal de configuración de escaleras */}
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