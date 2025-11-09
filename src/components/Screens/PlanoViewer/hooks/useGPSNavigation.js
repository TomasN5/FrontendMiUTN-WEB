// useGPSNavigation.js - VERSIÓN CORREGIDA PARA NUEVAS ÁREAS
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

  // 🔥 FUNCIÓN CORREGIDA - CONECTAR TODOS LOS TIPOS DE ÁREAS
  const buildGraphWithExplicitConnections = useCallback(() => {
    const graph = {};
    const { allAreas, allPoints } = getAllNodes();
    const todosLosNodos = [...allAreas, ...allPoints];

    console.log("=== 🏗️ CONSTRUYENDO GRAFO CORREGIDO ===");
    console.log(`📊 Total de nodos: ${todosLosNodos.length}`);

    // 1. Agregar TODOS los nodos al grafo
    todosLosNodos.forEach(n => {
      if (n && n.id) graph[n.id] = {};
    });

    // 2. CONEXIÓN AUTOMÁTICA DE ESCALERAS (sin cambios)
    const escaleras = allAreas.filter(a => a && a.tipo === "escalera");
    console.log(`🪜 ESCALERAS ENCONTRADAS: ${escaleras.length}`);
    
    escaleras.forEach((escalera, index) => {
      console.log(`\n📋 ESCALERA ${index + 1}: ${escalera.nombre}`);
      
      const tieneDestinosMultiples = Array.isArray(escalera.destinos) && escalera.destinos.length > 0;
      
      if (tieneDestinosMultiples) {
        escalera.destinos.forEach((destinoConfig, destIndex) => {
          const escaleraGemela = escaleras.find(e => 
            e.id !== escalera.id &&
            e.carreraActual === destinoConfig.carrera &&
            e.pisoActual === destinoConfig.piso
          );
          
          if (escaleraGemela) {
            const puedeConectar = verificarDireccionPermitida(
              escalera.pisoActual, 
              destinoConfig.piso, 
              destinoConfig.direccion
            );
            
            if (puedeConectar) {
              const distancia = 10;
              
              if (!graph[escalera.id]) graph[escalera.id] = {};
              if (!graph[escaleraGemela.id]) graph[escaleraGemela.id] = {};
              
              graph[escalera.id][escaleraGemela.id] = distancia;
              graph[escaleraGemela.id][escalera.id] = distancia;
              
              console.log(`   🔗 CONECTADA ESCALERA: ${escalera.id} <-> ${escaleraGemela.id}`);
            }
          }
        });
      } else {
        // Escalera con destino único
        const escaleraGemela = escaleras.find(e => 
          e.id !== escalera.id &&
          e.carreraActual === escalera.carreraDestino &&
          e.pisoActual === escalera.pisoDestino &&
          e.carreraDestino === escalera.carreraActual &&
          e.pisoDestino === escalera.pisoActual
        );
        
        if (escaleraGemela) {
          const puedeConectar = verificarDireccionPermitida(
            escalera.pisoActual, 
            escalera.pisoDestino, 
            escalera.direccion || "ambos"
          );
          
          if (puedeConectar) {
            const distancia = 10;
            
            if (!graph[escalera.id]) graph[escalera.id] = {};
            if (!graph[escaleraGemela.id]) graph[escaleraGemela.id] = {};
            
            graph[escalera.id][escaleraGemela.id] = distancia;
            graph[escaleraGemela.id][escalera.id] = distancia;
            
            console.log(`   🔗 CONECTADA ESCALERA: ${escalera.id} <-> ${escaleraGemela.id}`);
          }
        }
      }
    });

    // 3. 🔥 CORREGIDO: CONEXIONES ENTRE NODOS EN EL MISMO PLANO (INCLUYENDO NUEVAS ÁREAS)
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
          
          console.log(`   🔗 CONECTADO POR PASILLO: ${pasillo.from.id} <-> ${pasillo.to.id}`);
        }
      });

    // 4. 🔥 NUEVA LÓGICA: CONEXIÓN POR PROXIMIDAD ENTRE TODOS LOS TIPOS DE ÁREAS
    console.log("🔗 CONECTANDO ÁREAS POR PROXIMIDAD...");
    
    // Agrupar nodos por plano
    const nodosPorPlano = {};
    todosLosNodos.forEach(nodo => {
      if (!nodo || !nodo.planoId) return;
      if (!nodosPorPlano[nodo.planoId]) {
        nodosPorPlano[nodo.planoId] = [];
      }
      nodosPorPlano[nodo.planoId].push(nodo);
    });

    // Conectar nodos dentro de cada plano
    Object.values(nodosPorPlano).forEach(nodosDelPlano => {
      nodosDelPlano.forEach((nodo, i) => {
        if (!nodo || !nodo.id) return;
        
        nodosDelPlano.forEach((otroNodo, j) => {
          if (i === j || !otroNodo || !otroNodo.id) return;
          
          // 🔥 IMPORTANTE: Conectar TODOS los tipos de áreas excepto escaleras entre sí
          if (nodo.tipo !== "escalera" && otroNodo.tipo !== "escalera") {
            
            // Calcular distancia entre centros
            const centroNodo = getCentroNodo(nodo);
            const centroOtroNodo = getCentroNodo(otroNodo);
            
            const distancia = geometryUtils.calculateDistance(centroNodo, centroOtroNodo);
            
            // 🔥 RADIO DE CONEXIÓN MÁS AMPLIO para asegurar conexiones
            if (distancia < 1) { // Aumentado de 1 a 150 píxeles
              if (!graph[nodo.id]) graph[nodo.id] = {};
              if (!graph[otroNodo.id]) graph[otroNodo.id] = {};
              
              graph[nodo.id][otroNodo.id] = distancia;
              graph[otroNodo.id][nodo.id] = distancia;
              
              console.log(`   🔗 CONECTADOS POR PROXIMIDAD: ${nodo.nombre} (${nodo.tipo}) <-> ${otroNodo.nombre} (${otroNodo.tipo}) - Dist: ${Math.round(distancia)}px`);
            }
          }
        });
      });
    });

    console.log("✅ GRAFO CONSTRUIDO CORRECTAMENTE");
    console.log(`📈 Nodos en el grafo: ${Object.keys(graph).length}`);
    
    // Debug del grafo
    let totalConexiones = 0;
    Object.keys(graph).forEach(nodeId => {
      const conexiones = Object.keys(graph[nodeId]);
      totalConexiones += conexiones.length;
      if (conexiones.length > 0) {
        const nodeInfo = todosLosNodos.find(n => n.id === nodeId);
        console.log(`📍 ${nodeInfo?.nombre} (${nodeInfo?.tipo}): ${conexiones.length} conexiones`);
      }
    });
    
    console.log(`🔗 Total de conexiones en el grafo: ${totalConexiones}`);

    return graph;
  }, [getAllNodes]);

  // 🔥 FUNCIÓN AUXILIAR PARA OBTENER EL CENTRO DE CUALQUIER NODO
  const getCentroNodo = (nodo) => {
    if (!nodo) return [0, 0];
    
    // Si es un punto especial o punto normal
    if (nodo.tipo === 'punto' || 
        nodo.tipo === 'extintor' ||
        nodo.tipo === 'salida_emergencia' ||
        nodo.tipo === 'desfibrilador' ||
        nodo.tipo === 'botiquin' ||
        nodo.tipo === 'alarma' ||
        nodo.tipo === 'totem') {
      return [nodo.x || 0, nodo.y || 0];
    }
    
    // Si es un área con puntos (aula, departamento, área genérica, etc.)
    if (nodo.points && nodo.points.length > 0) {
      return geometryUtils.getPolygonCenter(nodo.points);
    }
    
    // Fallback
    return [nodo.x || 0, nodo.y || 0];
  };

  const verificarDireccionPermitida = (pisoOrigen, pisoDestino, direccion) => {
    if (direccion === "ambos") return true;
    
    const pisosOrden = {
      'planta_baja': 0,
      'planta_principal': 1, 
      'piso1': 1,
      'piso2': 2,
      'piso3': 3,
      'piso4': 4,
      'piso5': 5
    };
    
    const numOrigen = pisosOrden[pisoOrigen] || 0;
    const numDestino = pisosOrden[pisoDestino] || 0;
    
    if (direccion === "subida") {
      return numDestino > numOrigen;
    } else if (direccion === "bajada") {
      return numDestino < numOrigen;
    }
    
    return true;
  };

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
      path.unshift(node);
      node = prev[node];
    }
    
    console.log(`📏 Ruta encontrada: ${path.length} pasos`);
    
    // 🔥 DEBUG: Mostrar detalles de la ruta
    const { allAreas, allPoints } = getAllNodes();
    const todosLosNodos = [...allAreas, ...allPoints];
    
    console.log("🗺️ DETALLES DE LA RUTA ENCONTRADA:");
    path.forEach((nodeId, index) => {
      const node = todosLosNodos.find(n => n.id === nodeId);
      if (node) {
        console.log(`   ${index + 1}. ${node.nombre} (${node.tipo}) - ${node.planoId}`);
      }
    });
    
    return path.length > 1 ? path : [];
  }, [getAllNodes]);

  const handleCalcularRuta = useCallback(() => {
    if (!origen || !destino) {
      alert("❌ Selecciona origen y destino");
      return;
    }
    
    console.log("🎯 ===== CALCULANDO RUTA CON GRAFO CORREGIDO =====");
    console.log(`   Origen: ${origen}, Destino: ${destino}`);

    try {
      const graph = buildGraphWithExplicitConnections();
      const ruta = findShortestPath(graph, origen, destino);
      
      if (ruta.length > 0) {
        setRutaActual(ruta);
        console.log("✅ RUTA ENCONTRADA CORRECTAMENTE!");
        
        // Mostrar estadísticas de la ruta
        const { allAreas, allPoints } = getAllNodes();
        const todosLosNodos = [...allAreas, ...allPoints];
        
        const tiposEnRuta = {};
        ruta.forEach(nodeId => {
          const node = todosLosNodos.find(n => n.id === nodeId);
          if (node) {
            tiposEnRuta[node.tipo] = (tiposEnRuta[node.tipo] || 0) + 1;
          }
        });
        
        console.log("📊 ESTADÍSTICAS DE LA RUTA:");
        Object.entries(tiposEnRuta).forEach(([tipo, count]) => {
          console.log(`   ${tipo}: ${count} nodos`);
        });
      } else {
        setRutaActual([]);
        console.log("❌ NO SE ENCONTRÓ RUTA");
        alert("❌ No se encontró ruta entre los puntos seleccionados");
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