import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import AreaPolygon from './AreaPolygon';
import ConnectionLine from './ConnectionLine';
import TemporaryElements from './TemporaryElements';
import { COLORS } from '../utils/constants';

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
  getRelativeCoords
}) => {
  return (
    <TransformWrapper
      minScale={1}
      centerOnInit
      limitToBounds
      onZoom={onZoom}
    >
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: "100%", height: "100%" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
          style={{
            display: "block",
            background: "#fff",
            cursor: modoEdicion ? "crosshair" : "default"
          }}
          onClick={onClickSVG}
          onMouseMove={onMouseMove}
        >
          <image
            href={src}
            x="0"
            y="0"
            width={naturalWidth}
            height={naturalHeight}
            preserveAspectRatio="xMidYMid slice"
            style={{ pointerEvents: "none", userSelect: "none" }}
          />

          {/* Pasillos */}
          {areas
            .filter((a) => a.tipo === "pasillo")
            .map((a) => (
              <ConnectionLine
                key={a.id}
                area={a}
                getPolygonCenter={getRelativeCoords.getPolygonCenter}
              />
            ))}

          {/* Áreas */}
          {areas
            .filter((a) => a.tipo !== "pasillo")
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

          {/* Puntos */}
          {points.map((p) => (
            <AreaPolygon
              key={p.id}
              area={p}
              zoomScale={zoomScale}
              isSelectable={modoEdicion && tipoActual === "pasillo"}
              onNodeClick={onNodeClick}
            />
          ))}

          {/* Ruta */}
          {rutaActual.length > 1 && (
            <polyline
              points={rutaActual.map(id => {
                const node = areas.find(a => a.id === id) || points.find(p => p.id === id);
                return node.tipo === "punto"
                  ? `${node.x},${node.y}`
                  : getRelativeCoords.getPolygonCenter(node.points).join(",");
              }).join(" ")}
              stroke={COLORS.ruta}
              strokeWidth={5}
              fill="none"
            />
          )}

          {/* Elementos temporales */}
          <TemporaryElements
            tipoActual={tipoActual}
            puntosTemporales={puntosTemporales}
            cursorPos={cursorPos}
            modoEdicion={modoEdicion}
          />
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default SVGEditor;