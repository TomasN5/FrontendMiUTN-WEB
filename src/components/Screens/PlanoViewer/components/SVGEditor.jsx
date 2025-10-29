import React, { useState, useEffect, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import AreaPolygon from './AreaPolygon';
import ConnectionLine from './ConnectionLine';
import TemporaryElements from './TemporaryElements';
import { COLORS } from '../utils/constants';
import { platformUtils } from '../utils/helpers';

const SVGEditor = ({
  src,
  naturalWidth,
  naturalHeight,
  areas,
  points,
  modoEdicion,
  tipoActual,
  puntosTemporales,
  cursorPos,
  rutaActual,
  selectedNode,
  zoomScale,
  onZoom,
  onClickSVG,
  onMouseMove,
  onNodeClick,
  getRelativeCoords,
  snapIndicators,
  debugEdges,
  animatedPath,
  isRouteAnimating,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Detectar cuando se presiona Ctrl
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Determinar si el panning debe estar deshabilitado
  const isPanningDisabled = useCallback(() => {
    // Panning SOLO permitido cuando Ctrl está presionado
    return !isCtrlPressed;
  }, [isCtrlPressed]);

  // Determinar si las funcionalidades de edición están deshabilitadas
  const isEditingDisabled = useCallback(() => {
    // Edición deshabilitada cuando Ctrl está presionado
    return isCtrlPressed;
  }, [isCtrlPressed]);

  // Handler para clicks en el SVG
  const handleSVGClick = useCallback((e) => {
    // Si Ctrl está presionado, NO permitir funcionalidades de edición
    if (isEditingDisabled()) {
      e.preventDefault();
      return;
    }
    
    if (!isDragging || modoEdicion) {
      onClickSVG(e);
    }
  }, [isEditingDisabled, isDragging, modoEdicion, onClickSVG]);

  // Handler para movimiento del mouse
  const handleSVGMouseMove = useCallback((e) => {
    // Si Ctrl está presionado, NO permitir funcionalidades de edición
    if (isEditingDisabled()) {
      return;
    }
    
    onMouseMove(e);
  }, [isEditingDisabled, onMouseMove]);

  // Handler para clicks en nodos
  const handleNodeClickWrapper = useCallback((node) => {
    // Si Ctrl está presionado, NO permitir clicks en nodos
    if (isEditingDisabled()) {
      return;
    }
    
    onNodeClick(node);
  }, [isEditingDisabled, onNodeClick]);

  // Estilos definidos dentro del componente
  const zoomControlsStyle = {
    position: "absolute",
    top: 20,
    right: 20,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(8px)",
    padding: "12px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
    border: "1px solid rgba(0,0,0,0.1)",
    fontFamily: "Inter, Arial, sans-serif"
  };

  const zoomButtonStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#475569",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const zoomInfoStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
    marginTop: "4px",
    fontFamily: "Inter, Arial, sans-serif"
  };

  const zoomMessageStyle = {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: 5,
    backdropFilter: "blur(8px)",
    animation: "fadeInOut 3s ease-in-out infinite",
    fontFamily: "Inter, Arial, sans-serif",
    pointerEvents: "none"
  };

  const fadeInOutAnimation = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
  `;

  return (
    <TransformWrapper
      minScale={1}
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
      centerOnInit={true}
      limitToBounds={true}
      onZoom={onZoom}
      onPanningStart={() => setIsDragging(true)}
      onPanningStop={() => setIsDragging(false)}
      panning={{
        disabled: isPanningDisabled(),
        lockAxisX: false,
        lockAxisY: false,
        velocityDisabled: true
      }}
      wheel={{
        disabled: false,
        step: 0.1,
        wheelDisabled: false,
        touchPadDisabled: false
      }}
      doubleClick={{
        disabled: true,
        step: 0.5
      }}
    >
      {({ zoomIn, zoomOut, resetTransform, setTransform, ...utils }) => (
        <>
          {/* Inyectar animación CSS */}
          <style>{fadeInOutAnimation}</style>

          {/* Controles de zoom flotantes */}
          <div style={zoomControlsStyle}>
            <button 
              onClick={() => zoomIn()} 
              style={zoomButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "none";
              }}
              title="Acercar (Ctrl + Scroll)"
            >
              +
            </button>
            <button 
              onClick={() => zoomOut()} 
              style={zoomButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "none";
              }}
              title="Alejar (Ctrl + Scroll)"
            >
              −
            </button>
            <button 
              onClick={() => resetTransform()} 
              style={zoomButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "none";
              }}
              title="Resetear vista"
            >
              ⎌
            </button>
            <div style={zoomInfoStyle}>
              {Math.round(zoomScale * 100)}%
            </div>
          </div>

          <TransformComponent
            wrapperStyle={{ 
              width: "100%", 
              height: "100%",
              cursor: isPanningDisabled() 
                ? 'default' 
                : (isDragging ? 'grabbing' : 'grab')
            }}
            contentStyle={{ 
              width: "100%", 
              height: "100%",
              transition: "transform 0.15s ease-out"
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
              style={{
                display: "block",
                background: "#fff",
                cursor: isPanningDisabled() 
                  ? (modoEdicion && !isEditingDisabled() ? "crosshair" : "default")
                  : (isDragging ? 'grabbing' : 'grab'),
                shapeRendering: "geometricPrecision"
              }}
              onClick={handleSVGClick}
              onMouseMove={handleSVGMouseMove}
            >
              <image
                href={src}
                x="0"
                y="0"
                width={naturalWidth}
                height={naturalHeight}
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  pointerEvents: "none", 
                  userSelect: "none"
                }}
              />

              {/* Pasillos - Solo se muestran en modo edición */}
              {modoEdicion && areas
                .filter((a) => a.tipo === "pasillo")
                .map((a) => (
                  <ConnectionLine
                    key={a.id}
                    area={a}
                    getPolygonCenter={getRelativeCoords.getPolygonCenter}
                  />
                ))}

              {/* Áreas - Siempre visibles */}
              {areas
                .filter((a) => a.tipo !== "pasillo")
                .map((a) => (
                  <AreaPolygon
                    key={a.id}
                    area={a}
                    zoomScale={zoomScale}
                    isSelectable={modoEdicion && tipoActual === "pasillo" && !isEditingDisabled()}
                    onNodeClick={handleNodeClickWrapper}
                    getPolygonCenter={getRelativeCoords.getPolygonCenter}
                  />
                ))}

              {/* Puntos - Siempre visibles */}
              {points.map((p) => (
                <AreaPolygon
                  key={p.id}
                  area={p}
                  zoomScale={zoomScale}
                  isSelectable={modoEdicion && tipoActual === "pasillo" && !isEditingDisabled()}
                  onNodeClick={handleNodeClickWrapper}
                />
              ))}

              {/* Ruta Animada */}
              {animatedPath && animatedPath.length > 1 && (
                <g>
                  <polyline
                    points={animatedPath.map(point => `${point.x},${point.y}`).join(" ")}
                    stroke={COLORS.ruta}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="6,3"
                  />
                  
                  {isRouteAnimating && animatedPath.length > 0 && (
                    <circle
                      cx={animatedPath[animatedPath.length - 1].x}
                      cy={animatedPath[animatedPath.length - 1].y}
                      r="4"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="1.5"
                    >
                      <animate
                        attributeName="r"
                        values="4;6;4"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="1;0.7;1"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              )}

              {/* Ruta Completa (solo si no hay animación) */}
              {!isRouteAnimating && rutaActual && rutaActual.length > 1 && (
                <polyline
                  points={rutaActual.map(id => {
                    const node = areas.find(a => a.id === id) || points.find(p => p.id === id);
                    return node.tipo === "punto"
                      ? `${node.x},${node.y}`
                      : getRelativeCoords.getPolygonCenter(node.points).join(",");
                  }).join(" ")}
                  stroke={COLORS.ruta}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6,3"
                  opacity="0.6"
                />
              )}

              {/* Elementos temporales - Solo en modo edición y cuando Ctrl NO está presionado */}
              {modoEdicion && !isEditingDisabled() && (
                <TemporaryElements
                  tipoActual={tipoActual}
                  puntosTemporales={puntosTemporales}
                  cursorPos={cursorPos}
                  modoEdicion={modoEdicion}
                />
              )}

              {/* Snap Indicators - Solo cuando Ctrl NO está presionado */}
              {!isEditingDisabled() && snapIndicators}
              {debugEdges}

              {/* Overlay informativo */}
              {isPanningDisabled() && !modoEdicion && (
                <rect
                  x="0"
                  y="0"
                  width={naturalWidth}
                  height={naturalHeight}
                  fill="transparent"
                  style={{ pointerEvents: "none" }}
                >
                  <title>Presiona {platformUtils.getModifierSymbol()} para navegar por el mapa</title>
                </rect>
              )}
            </svg>
          </TransformComponent>

          {/* Mensajes informativos */}
          {isPanningDisabled() && !modoEdicion && (
            <div style={zoomMessageStyle}>
              🔍 Haz zoom y presiona {platformUtils.getModifierSymbol()} para navegar
            </div>
          )}

          {isPanningDisabled() && modoEdicion && !isCtrlPressed && (
            <div style={{
              ...zoomMessageStyle,
              background: "rgba(59, 130, 246, 0.9)",
              animation: "none",
              opacity: 1
            }}>
              ✏️ Modo edición activo - Haz clic para agregar puntos
            </div>
          )}

          {/* Mensaje cuando Ctrl está presionado en modo edición */}
          {modoEdicion && isCtrlPressed && (
            <div style={{
              ...zoomMessageStyle,
              background: "rgba(139, 92, 246, 0.9)",
              animation: "none",
              opacity: 1
            }}>
              🎮 {platformUtils.getModifierSymbol()} presionado - Arrastra para mover el mapa
            </div>
          )}

          {/* Mensaje cuando se necesita Ctrl para navegar (zoom alto) */}
          {!modoEdicion && !isCtrlPressed && zoomScale > 1.1 && (
            <div style={{
              ...zoomMessageStyle,
              background: "rgba(139, 92, 246, 0.9)",
              animation: "none",
              opacity: 1
            }}>
              🎮 Presiona {platformUtils.getModifierSymbol()} + Arrastrar para moverte por el mapa
            </div>
          )}
        </>
      )}
    </TransformWrapper>
  );
};

export default SVGEditor;