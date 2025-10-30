import React from 'react';
import './../styles/DebugGraph.css';

const DebugGraph = ({ debugGraph, getNodeCoordinates, isVisible, planoActual }) => {
  if (!isVisible || !debugGraph) return null;

  const { graph, nodes } = debugGraph;

  return (
    <g className="debug-graph">
      {Object.keys(graph).map(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return null;

        const nodeCoords = getNodeCoordinates(nodeId);
        
        // No dibujar nodos fuera del plano actual
        if (!nodeCoords || nodeCoords.x === -1000 || nodeCoords.y === -1000) {
          return null;
        }
        
        return Object.keys(graph[nodeId]).map(neighborId => {
          const neighbor = nodes.find(n => n.id === neighborId);
          if (!neighbor) return null;

          const neighborCoords = getNodeCoordinates(neighborId);
          
          // No dibujar conexiones donde alguno de los nodos esté fuera del plano
          if (!neighborCoords || neighborCoords.x === -1000 || neighborCoords.y === -1000) {
            return null;
          }
          
          return (
            <g key={`debug-${nodeId}-${neighborId}`}>
              <line
                x1={nodeCoords.x}
                y1={nodeCoords.y}
                x2={neighborCoords.x}
                y2={neighborCoords.y}
                className={`debug-graph__connection ${
                  neighbor.tipo === 'escalera' ? 'debug-graph__connection--escalera' : 'debug-graph__connection--normal'
                }`}
              />
              
              <circle
                cx={nodeCoords.x}
                cy={nodeCoords.y}
                r="3"
                className={`debug-graph__node ${
                  node.tipo === 'escalera' ? 'debug-graph__node--escalera' : ''
                }`}
              />
            </g>
          );
        });
      })}
    </g>
  );
};
export default DebugGraph;