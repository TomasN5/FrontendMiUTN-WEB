import React, { useState,useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import AreaPolygon from './AreaPolygon';
import ConnectionLine from './ConnectionLine';
import TemporaryElements from './TemporaryElements';
import { COLORS,AREA_TYPES } from '../utils/constants';
import DebugGraph from './DebugGraph';
import './../styles//SVGEditor.css';

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
  todosLosDatos = {},
  highlightedNode,
  connectionLines,
}) => {


    const [isDragging, setIsDragging] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.ctrlKey || e.metaKey) {
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



   const getNodeCoordinates = (nodeId) => {
      // Buscar en áreas del plano actual
      const areaNode = areas.find(a => a && a.id === nodeId);
      if (areaNode) {
        if (areaNode.tipo === "punto") {
          return { x: areaNode.x, y: areaNode.y };
        } else if (areaNode.points && areaNode.points.length > 0) {
          // ✅ VERIFICAR que points existe y tiene elementos
          const center = getRelativeCoords.getPolygonCenter(areaNode.points);
          return { x: center[0], y: center[1] };
        } else {
          // Si es un área sin points (como pasillos), usar coordenadas alternativas
          console.warn(`⚠️ Área ${areaNode.id} no tiene puntos definidos`, areaNode);
          return { x: -1000, y: -1000 };
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
            (planoData.areas && planoData.areas.find(a => a && a.id === nodeId)) || 
            (planoData.points && planoData.points.find(p => p && p.id === nodeId));
          if (nodeInPlano) return nodeInPlano;
        }
      }
      
      console.warn(`❌ Nodo no encontrado: ${nodeId}`);
      return null;
    };

    const isPanningDisabled = !isCtrlPressed || zoomScale <= 1.1;


  const svgClass = `svg-editor__svg ${
      modoEdicion 
        ? (tipoActual === AREA_TYPES.PASILLO 
            ? 'svg-editor__svg--pasillo'  // Clase específica para pasillos
            : 'svg-editor__svg--edition')
        : isDragging 
          ? 'svg-editor__svg--dragging' 
          : 'svg-editor__svg--navigation'
    }`;

  const messageClass = `svg-editor__message ${
    modoEdicion ? 'svg-editor__message--edition' : ''
  }`;

  return (
    <div className="svg-editor-container">
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
             <div className="svg-editor__zoom-simple">
            <div className="svg-editor__zoom-percentage">
                {Math.round(zoomScale * 100)}%
              </div>
            </div>

            <TransformComponent
              wrapperStyle={{ 
                width: "100%", 
                height: "100%",
                cursor: isPanningDisabled 
                  ? (modoEdicion ? 'crosshair' : 'default') // 🔥 cursor diferente en edición
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
                className={svgClass}
                onClick={(e) => {
                  // 🔥 MODIFICACIÓN: En modo edición, solo crear puntos si NO hay Ctrl presionado
                  if (modoEdicion && isCtrlPressed) {
                    // Con Ctrl presionado: ignorar clicks (solo mover)
                    return;
                  }
                  
                  if (!isDragging || modoEdicion) {
                    onClickSVG(e);
                  }
                }}
                onMouseMove={(e) => {
                  // 🔥 MODIFICACIÓN: En modo edición, solo actualizar cursor si NO hay Ctrl
                  if (modoEdicion && isCtrlPressed) {
                    return; // No actualizar posición del cursor durante movimiento
                  }
                  onMouseMove(e);
                }}
              >
              
                <image
                  href={src}
                  x="0"
                  y="0"
                  width={naturalWidth}
                  height={naturalHeight}
                  preserveAspectRatio="xMidYMid meet"
                  className="svg-editor__image"
                />

                <DebugGraph 
                  debugGraph={debugGraph}
                  getNodeCoordinates={getNodeCoordinates}
                  isVisible={true}
                />

                {modoEdicion && areas
                  .filter((a) => a && a.tipo === "pasillo")
                  .map((a) => (
                    <ConnectionLine
                      key={a.id}
                      area={a}
                      getPolygonCenter={getRelativeCoords.getPolygonCenter}
                    />
                  ))}

                {areas
            .filter((a) => a && a.tipo !== "pasillo")
            .map((a) => (
              <AreaPolygon
                key={a.id}
                area={a}
                zoomScale={zoomScale}
                isSelectable={modoEdicion && tipoActual === AREA_TYPES.PASILLO} // 🔥 IMPORTANTE
                onNodeClick={onNodeClick}
                getPolygonCenter={getRelativeCoords.getPolygonCenter}
                tipoActual={tipoActual}
              />
            ))}

            {points.map((p) => (
                p && (
                  <AreaPolygon
                    key={p.id}
                    area={p}
                    zoomScale={zoomScale}
                    isSelectable={modoEdicion && tipoActual === AREA_TYPES.PASILLO} // 🔥 IMPORTANTE
                    onNodeClick={onNodeClick}
                    tipoActual={tipoActual}
                  />
                )
              ))}

             {/*!isRouteAnimating && rutaActual && rutaActual.length > 1 && (
            <g>
              {rutaActual
                .map((nodeId, index) => {
                  if (index < rutaActual.length - 1) {
                    const currentNode = getNodeInfo(nodeId);
                    const nextNode = getNodeInfo(rutaActual[index + 1]);
                    
                    // ✅ SOLO dibujar si AMBOS están en el MISMO plano actual
                    if (currentNode && nextNode && 
                        currentNode.planoId === planoActual?.id && 
                        nextNode.planoId === planoActual?.id) {
                      
                      const currentCoords = getNodeCoordinates(nodeId);
                      const nextCoords = getNodeCoordinates(rutaActual[index + 1]);
                      
                      // 🔥 EVITAR dibujar si la conexión es entre escaleras
                      // (incluso si están en el mismo plano)
                      if (currentNode.tipo === "escalera" && nextNode.tipo === "escalera") {
                        console.log(`❌ No dibujar conexión entre escaleras: ${currentNode.id} -> ${nextNode.id}`);
                        return null;
                      }
                      
                      return (
                        <line
                          key={`route-line-${index}`}
                          x1={currentCoords.x}
                          y1={currentCoords.y}
                          x2={nextCoords.x}
                          y2={nextCoords.y}
                          className="svg-editor__route-line"
                        />
                      );
                    }
                  }
                  return null;
                })
                .filter(line => line !== null)}
              
                  {/* Puntos de la ruta - SOLO los del plano actual }
                  {rutaActual.map(nodeId => {
                    const nodeInfo = getNodeInfo(nodeId);
                    if (nodeInfo && nodeInfo.planoId === planoActual?.id) {
                      const coords = getNodeCoordinates(nodeId);
                      return (
                        <circle
                          key={`route-point-${nodeId}`}
                          cx={coords.x}
                          cy={coords.y}
                          r="4"
                          className="svg-editor__route-point"
                        />
                      );
                    }
                    return null;
                  }).filter(circle => circle !== null)}
                </g>
              )*/}

                {floorNotifications.map(notification => (
                  <g key={notification.id}>
                    <rect
                      x="20"
                      y="100"
                      width="400"
                      height="40"
                      className="svg-editor__floor-notification"
                    />
                    <text
                      x="40"
                      y="125"
                      className="svg-editor__floor-notification-text"
                    >
                      🔄 {notification.message}
                    </text>
                    <text
                      x="40"
                      y="145"
                      className="svg-editor__floor-notification-subtext"
                    >
                      Desde: {notification.fromFloor} → Hacia: {notification.toFloor}
                    </text>
                  </g>
                ))}

                {floorTransitions.map((transition, index) => {
                  const stairCoords = getNodeCoordinates(transition.stairNode);
                  return (
                    <g key={`transition-${index}`}>
                      <circle
                        cx={stairCoords.x}
                        cy={stairCoords.y}
                        r="12"
                        className="svg-editor__transition-indicator"
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
                      
                      <rect
                        x={stairCoords.x - 80}
                        y={stairCoords.y - 50}
                        width="160"
                        height="30"
                        className="svg-editor__transition-text-bg"
                      />
                      <text
                        x={stairCoords.x}
                        y={stairCoords.y - 30}
                        textAnchor="middle"
                        className="svg-editor__transition-text"
                      >
                        {transition.fromFloor} → {transition.toFloor}
                      </text>
                    </g>
                  );
                })}

                {isRouteAnimating && animatedPath && animatedPath.length > 1 && (
                <g className="svg-editor__animated-route-container">
                  {/* Línea animada principal */}
                  <polyline
                    points={animatedPath.map(point => `${point.x},${point.y}`).join(" ")}
                    className="svg-editor__animated-route"
                    fill="none"
                    strokeWidth="4"
                  />
                  
                  {/* Punto que se mueve (efecto de "viajero") */}
                  {animatedPath.length > 0 && (
                    <g>
                      {/* Círculo principal del viajero */}
                      <circle
                        cx={animatedPath[animatedPath.length - 1].x}
                        cy={animatedPath[animatedPath.length - 1].y}
                        r="8"
                        className="svg-editor__animated-traveler"
                      />
                      
                      {/* Efecto de pulso alrededor del viajero */}
                      <circle
                        cx={animatedPath[animatedPath.length - 1].x}
                        cy={animatedPath[animatedPath.length - 1].y}
                        r="12"
                        className="svg-editor__animated-pulse"
                      />
                      
                      {/* Rastro luminoso detrás del viajero */}
                      {animatedPath.slice(-8).map((point, index) => (
                        <circle
                          key={`trail-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r={4 - (index * 0.4)}
                          className="svg-editor__animated-trail"
                          opacity={0.6 - (index * 0.08)}
                        />
                      ))}
                    </g>
                  )}
                </g>
              )}

              {!isRouteAnimating && rutaActual && rutaActual.length > 1 && (
              <g>
                {rutaActual
                  .map((nodeId, index) => {
                    if (index < rutaActual.length - 1) {
                      const currentNode = getNodeInfo(nodeId);
                      const nextNode = getNodeInfo(rutaActual[index + 1]);
                      
                      // ✅ VERIFICACIÓN ADICIONAL: Ambos nodos deben existir
                      if (!currentNode || !nextNode) {
                        console.warn(`❌ Nodo faltante en ruta: ${nodeId} o ${rutaActual[index + 1]}`);
                        return null;
                      }
                      
                      // ✅ SOLO dibujar si AMBOS están en el MISMO plano actual
                      if (currentNode.planoId === planoActual?.id && 
                          nextNode.planoId === planoActual?.id) {
                        
                        const currentCoords = getNodeCoordinates(nodeId);
                        const nextCoords = getNodeCoordinates(rutaActual[index + 1]);
                        
                        // ✅ VERIFICAR que las coordenadas son válidas
                        if (currentCoords.x === -1000 || currentCoords.y === -1000 ||
                            nextCoords.x === -1000 || nextCoords.y === -1000) {
                          return null;
                        }
                        
                        // 🔥 EVITAR dibujar si la conexión es entre escaleras
                        if (currentNode.tipo === "escalera" && nextNode.tipo === "escalera") {
                          return null;
                        }
                        
                        return (
                          <line
                            key={`route-line-${index}`}
                            x1={currentCoords.x}
                            y1={currentCoords.y}
                            x2={nextCoords.x}
                            y2={nextCoords.y}
                            className="svg-editor__route-line"
                          />
                        );
                      }
                    }
                    return null;
                  })
                  .filter(line => line !== null)}
                
                {/* Puntos de la ruta - SOLO los del plano actual */}
              {rutaActual.map(nodeId => {
                  const nodeInfo = getNodeInfo(nodeId);
                  if (nodeInfo && nodeInfo.planoId === planoActual?.id) {
                    const coords = getNodeCoordinates(nodeId);
                    
                    // Saltar origen y destino (ya tienen animación especial)
                    if (nodeId === rutaActual[0] || nodeId === rutaActual[rutaActual.length - 1]) {
                      return null;
                    }
                    
                    return (
                      <circle
                        key={`route-point-${nodeId}`}
                        cx={coords.x}
                        cy={coords.y}
                        r="4"
                        className="svg-editor__route-point"
                      />
                    );
                  }
                  return null;
                }).filter(circle => circle !== null)}
              </g>
            )}

                {rutaActual && rutaActual.length >= 2 && (
                  <g className="svg-permanent-markers">
                    {/* Punto ORIGEN - Primero en la ruta */}
                    {getNodeCoordinates(rutaActual[0]) && (
                      <g className="svg-origin-marker">
                        {/* Círculo de pulso */}
                        <circle
                          cx={getNodeCoordinates(rutaActual[0]).x}
                          cy={getNodeCoordinates(rutaActual[0]).y}
                          r="12"
                          className="svg-origin-pulse"
                        />
                        {/* Círculo principal */}
                        <circle
                          cx={getNodeCoordinates(rutaActual[0]).x}
                          cy={getNodeCoordinates(rutaActual[0]).y}
                          r="8"
                          className="svg-origin-main"
                        />
                        {/* Icono de origen */}
                        <text
                          x={getNodeCoordinates(rutaActual[0]).x}
                          y={getNodeCoordinates(rutaActual[0]).y + 5}
                          textAnchor="middle"
                          className="svg-origin-icon"
                        >
                          
                        </text>
                      </g>
                    )}
                    
                    {/* Punto DESTINO - Último en la ruta */}
                    {getNodeCoordinates(rutaActual[rutaActual.length - 1]) && (
                      <g className="svg-destination-marker">
                        {/* Círculo de pulso */}
                        <circle
                          cx={getNodeCoordinates(rutaActual[rutaActual.length - 1]).x}
                          cy={getNodeCoordinates(rutaActual[rutaActual.length - 1]).y}
                          r="12"
                          className="svg-destination-pulse"
                        />
                        {/* Círculo principal */}
                        <circle
                          cx={getNodeCoordinates(rutaActual[rutaActual.length - 1]).x}
                          cy={getNodeCoordinates(rutaActual[rutaActual.length - 1]).y}
                          r="8"
                          className="svg-destination-main"
                        />
                        {/* Icono de destino */}
                        <text
                          x={getNodeCoordinates(rutaActual[rutaActual.length - 1]).x}
                          y={getNodeCoordinates(rutaActual[rutaActual.length - 1]).y + 5}
                          textAnchor="middle"
                          className="svg-destination-icon"
                        >
                          
                        </text>
                      </g>
                    )}
                  </g>
                )}


                {modoEdicion && (
                  <TemporaryElements
                    tipoActual={tipoActual}
                    puntosTemporales={puntosTemporales}
                    cursorPos={cursorPos}
                    modoEdicion={modoEdicion}
                  />
                )}

                {snapIndicators}
                {debugEdges}

              {/* Highlight overlay for hovered node */}
                {highlightedNode && (
                <g className="svg-highlight-group">
                  {highlightedNode.tipo === "punto" ? (
                    // Si es un punto
                    <g>
                      <circle
                        cx={highlightedNode.x}
                        cy={highlightedNode.y}
                        r="12"
                        className="svg-highlight-point-glow"
                      />
                      <circle
                        cx={highlightedNode.x}
                        cy={highlightedNode.y}
                        r="8"
                        className="svg-highlight-point"
                      />
                    </g>
                  ) : (
                    // Si es un área (tiene points)
                    highlightedNode.points && (
                      <g>
                        <polygon
                          points={geometryUtils.toPointsAttr(highlightedNode.points)}
                          className="svg-highlight-area-glow"
                        />
                        <polygon
                          points={geometryUtils.toPointsAttr(highlightedNode.points)}
                          className="svg-highlight-area"
                        />
                      </g>
                    )
                  )}
                </g>
              )}
              {/* Connection lines */}
              
                {connectionLines && connectionLines.map((line, index) => (
                  <g key={`connection-${index}`}>
                    <line
                      x1={line.from.x}
                      y1={line.from.y}
                      x2={line.to.x}
                      y2={line.to.y}
                      className="svg-connection-line"
                    />
                    <circle
                      cx={line.from.x}
                      cy={line.from.y}
                      r="5"
                      className="svg-connection-point"
                    />
                    <circle
                      cx={line.to.x}
                      cy={line.to.y}
                      r="5"
                      className="svg-connection-point"
                    />
                  </g>
                ))}


                {zoomScale <= 1.1 && !modoEdicion && (
                  <rect
                    x="0"
                    y="0"
                    width={naturalWidth}
                    height={naturalHeight}
                    fill="transparent"
                    className="svg-editor__overlay"
                  >
                    <title>Haz zoom para navegar por el mapa o entra en modo edición</title>
                  </rect>
                )}

                {planoActual && (
                  <text
                    x="20"
                    y="30"
                    className="svg-editor__plano-info"
                  >
                    🏢 {planoActual.nombre}
                    {infoPlanoActual && (
                      <tspan dx="10" className="svg-editor__plano-subinfo">
                        ({infoPlanoActual.numero}/{infoPlanoActual.total})
                      </tspan>
                    )}
                  </text>
                )}
              </svg>
            </TransformComponent>

            {!modoEdicion && !isCtrlPressed && (
              <div className={messageClass}>
                🔍 Mantén presionado <strong>Ctrl</strong> para mover el mapa
              </div>
            )}
            {modoEdicion && (
              <div className={messageClass}>
                {isCtrlPressed 
                  ? "🎯 Modo movimiento (Ctrl) - Suelta Ctrl para editar"
                  : "✏️ Modo edición activo - Haz clic para agregar puntos"
                }
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default SVGEditor;