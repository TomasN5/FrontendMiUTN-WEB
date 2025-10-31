export const geometryUtils = {
  toPointsAttr: (pts) => pts.map(([x, y]) => `${x},${y}`).join(" "),

  getPolygonCenter: (points) => {
    // 🔥 AGREGAR VALIDACIÓN PARA EVITAR ERROR
    if (!points || !Array.isArray(points) || points.length === 0) {
      console.warn('❌ Puntos inválidos en getPolygonCenter:', points);
      return [0, 0]; // Retornar coordenadas por defecto
    }
    
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    const y = ys.reduce((a, b) => a + b, 0) / ys.length;
    return [x, y];
  },

  calculateDistance: (point1, point2) => {
    return Math.hypot(point2[0] - point1[0], point2[1] - point1[1]);
  }
};