// useGPSNavigation.js - VERSIÓN CORREGIDA
import { useState, useCallback } from 'react';
import { geometryUtils } from '../utils/geometry';

export const useGPSNavigation = (areas, points, todosLosDatos = {}) => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [rutaActual, setRutaActual] = useState([]);
  const [debugGraph, setDebugGraph] = useState(null);

  const getAllNodes = useCallback(() => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData?.areas) allAreas.push(...planoData.areas);
      if (planoData?.points) allPoints.push(...planoData.points);
    });
    
    return { allAreas, allPoints };
  }, [todosLosDatos]);

  // FUNCIÓN CORREGIDA - CON CONEXIÓN AUTOMÁTICA DE ESCALERAS
  const buildGraphWithExplicitConnections = useCallback(() => {
    const graph = {};
    const { allAreas, allPoints } = getAllNodes();
    const todosLosNodos = [...allAreas, ...allPoints];

    console.log("=== 🏗️ CONSTRUYENDO GRAFO ===");
    console.log(`📊 Total de nodos: ${todosLosNodos.length}`);

    // 1. Agregar todos los nodos al grafo
    todosLosNodos.forEach(n => {
      if (n && n.id) graph[n.id] = {};
    });

    // 2. CONEXIÓN AUTOMÁTICA DE ESCALERAS GEMELAS
    const escaleras = allAreas.filter(a => a && a.tipo === "escalera");
    console.log(`🪜 ESCALERAS ENCONTRADAS: ${escaleras.length}`);
    
    // Buscar y conectar escaleras gemelas automáticamente
    escaleras.forEach((escalera, index) => {
      console.log(`\n📋 ESCALERA ${index + 1}:`);
      console.log(`   ID: ${escalera.id}`);
      console.log(`   Nombre: ${escalera.nombre}`);
      console.log(`   Origen: ${escalera.carreraActual} ${escalera.pisoActual}`);
      console.log(`   Destino: ${escalera.carreraDestino} ${escalera.pisoDestino}`);
      
      // BUSCAR ESCALERA GEMELA AUTOMÁTICAMENTE
      const escaleraGemela = escaleras.find(e => 
        e.id !== escalera.id &&
        e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino &&
        e.carreraDestino === escalera.carreraActual &&
        e.pisoDestino === escalera.pisoActual
      );
      
      if (escaleraGemela) {
        console.log(`   ✅ ENCONTRADA ESCALERA GEMELA: ${escaleraGemela.id}`);
        // Conectar las escaleras gemelas bidireccionalmente
        const distancia = 10; // Distancia mínima entre escaleras conectadas
        
        if (!graph[escalera.id]) graph[escalera.id] = {};
        if (!graph[escaleraGemela.id]) graph[escaleraGemela.id] = {};
        
        graph[escalera.id][escaleraGemela.id] = distancia;
        graph[escaleraGemela.id][escalera.id] = distancia;
        
        console.log(`   🔗 CONECTADA: ${escalera.id} <-> ${escaleraGemela.id}`);
      } else {
        console.log(`   ❌ NO SE ENCONTRÓ ESCALERA GEMELA`);
      }
    });

    // 3. CONEXIONES ENTRE NODOS EN EL MISMO PLANO (pasillos existentes)
    allAreas
      .filter(a => a && a.tipo === "pasillo")
      .forEach(pasillo => {
        if (pasillo.from && pasillo.to && graph[pasillo.from.id] && graph[pasillo.to.id]) {
          const distancia = geometryUtils.calculateDistance(
            [pasillo.from.x || 0, pasillo.from.y || 0],
            [pasillo.to.x || 0, pasillo.to.y || 0]
          );
          
          graph[pasillo.from.id][pasillo.to.id] = distancia;
          graph[pasillo.to.id][pasillo.from.id] = distancia;
        }
      });

    // 4. CONEXIONES POR PROXIMIDAD EN EL MISMO PLANO
    todosLosNodos.forEach((nodo, i) => {
      if (!nodo || !nodo.id) return;
      
      todosLosNodos.forEach((otroNodo, j) => {
        if (i === j || !otroNodo || !otroNodo.id) return;
        
        // Solo conectar nodos en el mismo plano y que no sean escaleras
        if (nodo.planoId === otroNodo.planoId && 
            nodo.tipo !== "escalera" && 
            otroNodo.tipo !== "escalera") {
          
          const distancia = geometryUtils.calculateDistance(
            [nodo.x || 0, nodo.y || 0],
            [otroNodo.x || 0, otroNodo.y || 0]
          );
          
          // Conectar si están lo suficientemente cerca
          if (distancia < 200) { // Radio de conexión
            if (!graph[nodo.id]) graph[nodo.id] = {};
            if (!graph[otroNodo.id]) graph[otroNodo.id] = {};
            
            graph[nodo.id][otroNodo.id] = distancia;
            graph[otroNodo.id][nodo.id] = distancia;
          }
        }
      });
    });

    console.log("✅ GRAFO CONSTRUIDO CON ÉXITO");
    console.log(`📈 Nodos en el grafo: ${Object.keys(graph).length}`);
    
    // Debug del grafo
    Object.keys(graph).forEach(nodeId => {
      const conexiones = Object.keys(graph[nodeId]);
      if (conexiones.length > 0) {
        console.log(`📍 ${nodeId}: ${conexiones.length} conexiones`);
      }
    });

    return graph;
  }, [getAllNodes]);

const findShortestPath = useCallback((graph, start, end) => {
  console.log(`🔍 Buscando ruta: ${start} -> ${end}`);
  
  if (!graph[start]) {
    console.log(`❌ Origen ${start} no está en el grafo`);
    return [];
  }
  if (!graph[end]) {
    console.log(`❌ Destino ${end} no está en el grafo`);
    return [];
  }

  const distances = {};
  const visited = new Set();
  const prev = {};
  
  Object.keys(graph).forEach(n => distances[n] = Infinity);
  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let smallest = Infinity;
    
    Object.keys(distances).forEach(n => {
      if (!visited.has(n) && distances[n] < smallest) {
        smallest = distances[n];
        current = n;
      }
    });

    if (current === null) {
      console.log("❌ No hay nodos accesibles desde el origen");
      break;
    }
    
    if (current === end) {
      console.log("✅ Destino encontrado!");
      break;
    }

    visited.add(current);

    for (const neighbor in graph[current]) {
      const newDistance = distances[current] + graph[current][neighbor];
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        prev[neighbor] = current;
      }
    }
  }

  const path = [];
  let node = end;
  while (node) {
    path.unshift(node); // ← SOLO EL ID, NO OBJETO COMPLETO
    node = prev[node];
  }
  
  console.log(`📏 Ruta encontrada: ${path.length} pasos`);
  return path.length > 1 ? path : [];
}, []);


  const handleCalcularRuta = useCallback(() => {
    if (!origen || !destino) {
      alert("❌ Selecciona origen y destino");
      return;
    }
    
    console.log("🎯 ===== CALCULANDO RUTA =====");
    console.log(`   Origen: ${origen}, Destino: ${destino}`);

    try {
      const graph = buildGraphWithExplicitConnections();
      const ruta = findShortestPath(graph, origen, destino);
      
      if (ruta.length > 0) {
        setRutaActual(ruta);
        console.log("✅ RUTA ENCONTRADA!");
        
        // Mostrar detalles de la ruta
        const { allAreas, allPoints } = getAllNodes();
        const todosLosNodos = [...allAreas, ...allPoints];
        
        ruta.forEach((nodeId, index) => {
          const node = todosLosNodos.find(n => n.id === nodeId);
          if (node) {
            console.log(`   ${index + 1}. ${node.nombre} (${node.piso}) ${node.tipo === 'escalera' ? '🪜' : ''}`);
          }
        });
      } else {
        setRutaActual([]);
        console.log("❌ NO SE ENCONTRÓ RUTA");
        alert("❌ No se encontró ruta. Revisa la consola para ver los detalles.");
      }
    } catch (error) {
      console.error("💥 Error crítico:", error);
      alert("❌ Error calculando ruta");
    }
  }, [origen, destino, buildGraphWithExplicitConnections, findShortestPath, getAllNodes]);

  return {
    origen,
    destino,
    rutaActual,
    setOrigen,
    setDestino,
    setRutaActual,
    handleCalcularRuta,
    debugGraph
  };
};