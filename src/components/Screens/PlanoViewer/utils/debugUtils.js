export const debugGraph = (graph, todosLosNodos) => {
  console.log("🐛 DEBUG DEL GRAFO:");
  
  Object.keys(graph).forEach(nodeId => {
    const node = todosLosNodos.find(n => n.id === nodeId);
    const connections = Object.keys(graph[nodeId]);
    
    if (connections.length > 0) {
      console.log(`📍 ${node?.nombre || nodeId} (${node?.carrera || '?'} ${node?.piso || '?'}):`);
      connections.forEach(connId => {
        const connNode = todosLosNodos.find(n => n.id === connId);
        const weight = graph[nodeId][connId];
        console.log(`   └─➤ ${connNode?.nombre || connId} (${weight}px)`);
      });
    }
  });
};