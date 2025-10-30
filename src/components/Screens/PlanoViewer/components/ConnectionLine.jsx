import React from 'react';
import { COLORS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/ConnectionLine.css';

const ConnectionLine = ({ area, getPolygonCenter }) => {
  const from = area.from.tipo === "punto"
    ? [area.from.x, area.from.y]
    : getPolygonCenter(area.from.points);
  
  const to = area.to.tipo === "punto"
    ? [area.to.x, area.to.y]
    : getPolygonCenter(area.to.points);

  return (
    <g className="connection-line">
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        className="connection-line__path"
      />
      
      {(area.from.piso !== area.to.piso) && (
        <circle
          cx={(from[0] + to[0]) / 2}
          cy={(from[1] + to[1]) / 2}
          r="8"
          className="connection-line__transition-indicator"
        />
      )}
      
      <text
        x={(from[0] + to[0]) / 2}
        y={(from[1] + to[1]) / 2 - 8}
        textAnchor="middle"
        className="connection-line__label"
      >
        {area.nombre}
      </text>
    </g>
  );
};

export default ConnectionLine;