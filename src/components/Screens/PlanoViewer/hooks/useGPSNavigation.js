import { useState, useCallback } from 'react';
import { geometryUtils } from '../utils/geometry';

export const useGPSNavigation = (areas, points) => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [rutaActual, setRutaActual] = useState([]);

  const buildGraph = useCallback(() => {
    const graph = {};
    
    // Agregar todos los nodos (áreas y puntos) al grafo
    [...areas.filter(a => a.tipo !== "pasillo"), ...points].forEach(n => {
      graph[n.id] = {};
    });

    // Conectar nodos con pasillos
    areas.filter(a => a.tipo === "pasillo").forEach(p => {
      const from = p.from.tipo === "punto"
        ? [p.from.x, p.from.y]
        : geometryUtils.getPolygonCenter(p.from.points);
      const to = p.to.tipo === "punto"
        ? [p.to.x, p.to.y]
        : geometryUtils.getPolygonCenter(p.to.points);
      
      const dist = geometryUtils.calculateDistance(from, to);
      
      if (!graph[p.from.id]) graph[p.from.id] = {};
      if (!graph[p.to.id]) graph[p.to.id] = {};
      
      graph[p.from.id][p.to.id] = dist;
      graph[p.to.id][p.from.id] = dist;
    });

    return graph;
  }, [areas, points]);

  const findShortestPath = useCallback((graph, start, end) => {
    const distances = {};
    const visited = new Set();
    const prev = {};
    
    // Inicializar distancias
    Object.keys(graph).forEach(n => {
      distances[n] = Infinity;
    });
    distances[start] = 0;

    while (visited.size < Object.keys(graph).length) {
      let current = null;
      let smallest = Infinity;
      
      // Encontrar el nodo no visitado con la distancia más pequeña
      Object.keys(distances).forEach(n => {
        if (!visited.has(n) && distances[n] < smallest) {
          smallest = distances[n];
          current = n;
        }
      });

      if (current === null) break;
      if (current === end) break;

      visited.add(current);

      // Actualizar distancias de los vecinos
      for (const neighbor in graph[current]) {
        const newDistance = distances[current] + graph[current][neighbor];
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          prev[neighbor] = current;
        }
      }
    }

    // Reconstruir el camino
    const path = [];
    let node = end;
    while (node) {
      path.unshift(node);
      node = prev[node];
    }

    return path.length > 1 ? path : [];
  }, []);

  const handleCalcularRuta = useCallback(() => {
    if (!origen || !destino) return;
    
    const graph = buildGraph();
    const path = findShortestPath(graph, origen, destino);
    setRutaActual(path);
  }, [origen, destino, buildGraph, findShortestPath]);

  return {
    origen,
    destino,
    rutaActual,
    setOrigen,
    setDestino,
    setRutaActual,
    handleCalcularRuta
  };
};