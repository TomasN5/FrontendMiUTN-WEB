import React from 'react';
import { COLORS, AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import Staircase from './Staircase';
import './../styles/AreaPolygon.css';

const AreaPolygon = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter ,
  tipoActual
}) => {
  if (area.tipo === AREA_TYPES.ESCALERA) {
    return (
      <Staircase
        area={area}
        zoomScale={zoomScale}
        isSelectable={isSelectable}
        onNodeClick={onNodeClick}
        getPolygonCenter={getPolygonCenter}
      />
    );
  }

  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

    const polygonClass = `area-polygon ${
      isSelectable ? 'area-polygon--selectable' : ''
    } ${tipoActual === AREA_TYPES.PASILLO ? 'area-polygon--pasillo-mode' : ''}`;


  if (area.tipo === "punto") {
    return (
      <g
        onClick={handleClick}
        className={polygonClass}
      >
        <circle
          cx={area.x}
          cy={area.y}
          r="3"
          className={`area-polygon__shape area-polygon__shape--punto area-polygon__point ${
            isSelectable ? 'area-polygon__point--selectable' : ''
          }`}
        />
        {zoomScale >= 3 && (
          <text
            x={area.x + 6}
            y={area.y - 6}
            fill="black"
            className={`area-polygon__label ${
              zoomScale >= 4 ? 'area-polygon__label--medium' : 'area-polygon__label--small'
            }`}
          >
            {area.nombre}
          </text>
        )}
      </g>
    );
  }

  const [centerX, centerY] = getPolygonCenter(area.points);

  return (
    <g
      onClick={handleClick}
      className={polygonClass}
    >
      <polygon
        points={geometryUtils.toPointsAttr(area.points)}
        className={`area-polygon__shape area-polygon__shape--${area.tipo}`}
      />
      {zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          className={`area-polygon__label ${
            zoomScale >= 3 ? 'area-polygon__label--medium' : 'area-polygon__label--small'
          }`}
        >
          {area.nombre}
        </text>
      )}
    </g>
  );
};

export default AreaPolygon;