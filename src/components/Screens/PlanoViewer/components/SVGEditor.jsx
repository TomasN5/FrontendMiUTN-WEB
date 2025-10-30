import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import AreaPolygon from './AreaPolygon';
import ConnectionLine from './ConnectionLine';
import TemporaryElements from './TemporaryElements';
import { COLORS } from '../utils/constants';
import DebugGraph from './DebugGraph';

const SVGEditor = ({
  src,
  naturalWidth,
  naturalHeight,
  areas = [],
  points = [],
  modoEdicion,
  tipoActual,
  puntosTemporales,
  cursorPos,
  rutaActual = [],
  selectedNode,
  zoomScale,
  floorNotifications = [],
  floorTransitions = [],
  onZoom,
  onClickSVG,
  onMouseMove,
  onNodeClick,
  getRelativeCoords,
  snapIndicators,
  debugEdges,
  animatedPath,
  isRouteAnimating,
  planoActual,
  infoPlanoActual,
  debugGraph,
  todosLosDatos = {}, // ← AGREGAR ESTA PROP CON VALOR POR DEFECTO
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Helper para obtener coordenadas de un nodo de forma segura
    const getNodeCoordinates = (nodeId) => {
      // Buscar en áreas del plano actual
      const areaNode = areas.find(a => a && a.id === nodeId);
      if (areaNode) {
        if (areaNode.tipo === "punto") {
          return { x: areaNode.x, y: areaNode.y };
        } else {
          const center = getRelativeCoords.getPolygonCenter(areaNode.points);
          return { x: center[0], y: center[1] };
        }
      }
      
      // Buscar en puntos del plano actual
      const pointNode = points.find(p => p && p.id === nodeId);
      if (pointNode) {
        return { x: pointNode.x, y: pointNode.y };
      }
      
      // Si el nodo no está en este plano, retornar coordenadas fuera de vista
      return { x: -1000, y: -1000 };
    };

  // Helper para obtener info del nodo
      const getNodeInfo = (nodeId) => {
        // Primero buscar en el plano actual
        const areaNode = areas.find(a => a && a.id === nodeId);
        const pointNode = points.find(p => p && p.id === nodeId);
        
        if (areaNode) return areaNode;
        if (pointNode) return pointNode;
        
        // Si no está en el plano actual, buscar en todos los datos
        if (todosLosDatos) {
          for (const planoId in todosLosDatos) {
            const planoData = todosLosDatos[planoId];
            const nodeInPlano = 
              planoData.areas.find(a => a && a.id === nodeId) || 
              planoData.points.find(p => p && p.id === nodeId);
            if (nodeInPlano) return nodeInPlano;
          }
        }
        
        return null;
      };

  // Estilos
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

  // Determinar si el panning debe estar deshabilitado
  const isPanningDisabled = zoomScale <= 1.1 && !modoEdicion;

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
        disabled: isPanningDisabled,
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
              cursor: isPanningDisabled 
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
                cursor: modoEdicion ? "crosshair" : (isPanningDisabled ? 'default' : (isDragging ? 'grabbing' : 'grab')),
                shapeRendering: "geometricPrecision"
              }}
              onClick={(e) => {
                if (!isDragging || modoEdicion) {
                  onClickSVG(e);
                }
              }}
              onMouseMove={onMouseMove}
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

              {/* DEBUG VISUAL DEL GRAFO */}
              <DebugGraph 
                debugGraph={debugGraph}
                getNodeCoordinates={getNodeCoordinates}
                isVisible={true} // Puedes hacerlo toggleable
              />

              {/* Pasillos - Solo se muestran en modo edición */}
              {modoEdicion && areas
                .filter((a) => a && a.tipo === "pasillo")
                .map((a) => (
                  <ConnectionLine
                    key={a.id}
                    area={a}
                    getPolygonCenter={getRelativeCoords.getPolygonCenter}
                  />
                ))}

              {/* Áreas - Siempre visibles */}
              {areas
                .filter((a) => a && a.tipo !== "pasillo")
                .map((a) => (
                  <AreaPolygon
                    key={a.id}
                    area={a}
                    zoomScale={zoomScale}
                    isSelectable={modoEdicion && tipoActual === "pasillo"}
                    onNodeClick={onNodeClick}
                    getPolygonCenter={getRelativeCoords.getPolygonCenter}
                  />
                ))}

              {/* Puntos - Siempre visibles */}
              {points.map((p) => (
                p && (
                  <AreaPolygon
                    key={p.id}
                    area={p}
                    zoomScale={zoomScale}
                    isSelectable={modoEdicion && tipoActual === "pasillo"}
                    onNodeClick={onNodeClick}
                  />
                )
              ))}

              {/* Ruta Animada - Solo mostrar si los puntos están en el plano actual */}
              {animatedPath && animatedPath.length > 1 && (
                <g>
                  {/* Filtrar solo los puntos que están en el plano actual */}
                  {(() => {
                    const puntosEnPlanoActual = animatedPath.filter((point, index) => {
                      if (index === 0) return true; // Siempre mostrar el primer punto
                      
                      const puntoAnterior = animatedPath[index - 1];
                      // Solo mostrar línea si AMBOS puntos están en coordenadas válidas (no fuera de vista)
                      return point.x > 0 && point.y > 0 && puntoAnterior.x > 0 && puntoAnterior.y > 0;
                    });

                    if (puntosEnPlanoActual.length > 1) {
                      return (
                        <polyline
                          points={puntosEnPlanoActual.map(point => `${point.x},${point.y}`).join(" ")}
                          stroke={COLORS.ruta}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="8,4"
                          strokeLinecap="round"
                        />
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Punto animado solo si está en el plano actual */}
                  {isRouteAnimating && animatedPath.length > 0 && 
                  animatedPath[animatedPath.length - 1].x > 0 && 
                  animatedPath[animatedPath.length - 1].y > 0 && (
                    <circle
                      cx={animatedPath[animatedPath.length - 1].x}
                      cy={animatedPath[animatedPath.length - 1].y}
                      r="6"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <animate
                        attributeName="r"
                        values="4;8;4"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              )}

             // Ruta Completa estática - SOLO segmentos donde AMBOS nodos están en el plano actual
            {!isRouteAnimating && rutaActual && rutaActual.length > 1 && (
              <g>
                {rutaActual
                  .map((nodeId, index) => {
                    if (index < rutaActual.length - 1) {
                      const currentNode = getNodeInfo(nodeId);
                      const nextNode = getNodeInfo(rutaActual[index + 1]);
                      
                      // SOLO mostrar línea si AMBOS nodos están en ESTE plano actual
                      if (currentNode && nextNode && 
                          currentNode.planoId === planoActual?.id && 
                          nextNode.planoId === planoActual?.id) {
                        
                        const currentCoords = getNodeCoordinates(nodeId);
                        const nextCoords = getNodeCoordinates(rutaActual[index + 1]);
                        
                        // Verificar que las coordenadas sean válidas (no fuera de vista)
                        if (currentCoords.x > 0 && currentCoords.y > 0 && 
                            nextCoords.x > 0 && nextCoords.y > 0) {
                          
                          return (
                            <line
                              key={`route-line-${index}`}
                              x1={currentCoords.x}
                              y1={currentCoords.y}
                              x2={nextCoords.x}
                              y2={nextCoords.y}
                              stroke={COLORS.ruta}
                              strokeWidth="3"
                              strokeDasharray="6,3"
                              opacity="0.7"
                            />
                          );
                        }
                      }
                    }
                    return null;
                  })
                  .filter(line => line !== null)}
                
                {/* Mostrar puntos de la ruta SOLO si están en este plano */}
                {rutaActual.map(nodeId => {
                  const nodeInfo = getNodeInfo(nodeId);
                  if (nodeInfo && nodeInfo.planoId === planoActual?.id) {
                    const coords = getNodeCoordinates(nodeId);
                    // Solo mostrar si las coordenadas son válidas
                    if (coords.x > 0 && coords.y > 0) {
                      return (
                        <circle
                          key={`route-point-${nodeId}`}
                          cx={coords.x}
                          cy={coords.y}
                          r="4"
                          fill={COLORS.ruta}
                          stroke="white"
                          strokeWidth="1.5"
                        />
                      );
                    }
                  }
                  return null;
                }).filter(circle => circle !== null)}
              </g>
            )}

              {/* NOTIFICACIONES DE CAMBIO DE PISO */}
              {floorNotifications.map(notification => (
                <g key={notification.id}>
                  <rect
                    x="20"
                    y="100"
                    width="400"
                    height="40"
                    fill="rgba(59, 130, 246, 0.9)"
                    rx="8"
                  />
                  <text
                    x="40"
                    y="125"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    🔄 {notification.message}
                  </text>
                  <text
                    x="40"
                    y="145"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="11"
                    style={{ pointerEvents: "none" }}
                  >
                    Desde: {notification.fromFloor} → Hacia: {notification.toFloor}
                  </text>
                </g>
              ))}

              {/* INDICADORES DE CONEXIÓN ENTRE ESCALERAS */}
              {floorTransitions.map((transition, index) => {
                const stairCoords = getNodeCoordinates(transition.stairNode);
                return (
                  <g key={`transition-${index}`}>
                    {/* Círculo indicador en la escalera */}
                    <circle
                      cx={stairCoords.x}
                      cy={stairCoords.y}
                      r="12"
                      fill="rgba(239, 68, 68, 0.8)"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={stairCoords.x}
                      y={stairCoords.y + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      style={{ pointerEvents: "none" }}
                    >
                      ⬆️⬇️
                    </text>
                    
                    {/* Texto informativo */}
                    <rect
                      x={stairCoords.x - 80}
                      y={stairCoords.y - 50}
                      width="160"
                      height="30"
                      fill="rgba(0,0,0,0.8)"
                      rx="6"
                    />
                    <text
                      x={stairCoords.x}
                      y={stairCoords.y - 30}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      style={{ pointerEvents: "none" }}
                    >
                      {transition.fromFloor} → {transition.toFloor}
                    </text>
                  </g>
                );
              })}

              {/* Elementos temporales - Solo en modo edición */}
              {modoEdicion && (
                <TemporaryElements
                  tipoActual={tipoActual}
                  puntosTemporales={puntosTemporales}
                  cursorPos={cursorPos}
                  modoEdicion={modoEdicion}
                />
              )}

              {/* Snap Indicators - Se renderizan aquí */}
              {snapIndicators}
              {debugEdges}

              {/* Overlay informativo cuando el zoom es mínimo y no estamos editando */}
              {zoomScale <= 1.1 && !modoEdicion && (
                <rect
                  x="0"
                  y="0"
                  width={naturalWidth}
                  height={naturalHeight}
                  fill="transparent"
                  style={{ pointerEvents: "none" }}
                >
                  <title>Haz zoom para navegar por el mapa o entra en modo edición</title>
                </rect>
              )}

              {/* Información del plano actual */}
              {planoActual && (
                <text
                  x="20"
                  y="30"
                  fill="#1f2937"
                  fontSize="14"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  🏢 {planoActual.nombre}
                  {infoPlanoActual && (
                    <tspan dx="10" fill="#64748b" fontSize="12">
                      ({infoPlanoActual.numero}/{infoPlanoActual.total})
                    </tspan>
                  )}
                </text>
              )}
            </svg>
          </TransformComponent>

          {/* Mensaje flotante cuando el zoom es mínimo y no estamos editando */}
          {zoomScale <= 1.1 && !modoEdicion && (
            <div style={zoomMessageStyle}>
              🔍 Haz zoom para navegar o ✏️ Entra en edición
            </div>
          )}

          {/* Mensaje cuando estamos en modo edición */}
          {modoEdicion && (
            <div style={{
              ...zoomMessageStyle,
              background: "rgba(59, 130, 246, 0.9)",
              animation: "none",
              opacity: 1
            }}>
              ✏️ Modo edición activo - Haz clic para agregar puntos
            </div>
          )}
        </>
      )}
    </TransformWrapper>
  );
};

export default SVGEditor;