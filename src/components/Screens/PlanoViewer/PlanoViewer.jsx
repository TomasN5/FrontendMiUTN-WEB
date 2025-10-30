import React, { useState } from "react";
import { usePlanoEditor } from './hooks/usePlanoEditor';
import { useSVGCoordinates } from './hooks/useSVGCoordinates';
import { useGPSNavigation } from './hooks/useGPSNavigation';
import ControlPanel from './components/ControlPanel';
import SVGEditor from './components/SVGEditor';
import { geometryUtils } from './utils/geometry';

const PlanoViewer = ({
  src,
  naturalWidth = 1012,
  naturalHeight = 768
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  
  // Hooks personalizados
  const editor = usePlanoEditor();
  const coordinates = useSVGCoordinates(naturalWidth, naturalHeight);
  const gps = useGPSNavigation(editor.areas, editor.points);

  // Handlers
  const handleClickSVG = (e) => {
    editor.handleClickSVG(e, coordinates.getRelativeCoords);
  };

  const handleMouseMove = (e) => {
    editor.handleMouseMove(e, coordinates.getRelativeCoords);
  };

  const handleZoom = (e) => {
    setZoomScale(e.state.scale);
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
        
        // Handlers
        onToggleEdit={() => editor.setModoEdicion(true)}
        onChangeType={editor.setTipoActual}
        onChangeName={editor.setNombreArea}
        onSaveArea={editor.handleGuardarArea}
        onSavePoints={editor.handleGuardarPuntos}
        onUndo={editor.handleDeshacer}
        onCancel={editor.handleCancelar}
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
      />
    </div>
  );
};

const containerStyle = {
  width: "100%",
  height: "100vh",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(#f5f7fa, #ffffff)"
};

export default PlanoViewer;