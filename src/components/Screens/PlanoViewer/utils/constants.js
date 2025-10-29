export const COLORS = {
  aula: "rgba(66, 135, 245, 0.28)",
  salon: "rgba(255, 165, 0, 0.30)",
  hall: "rgba(255, 235, 59, 0.35)",
  pasillo: "rgba(0, 0, 255, 0.8)",
  bano: "rgba(186, 104, 200, 0.30)",
  borde: "rgba(0,0,0,0.6)",
  punto: "red",
  ruta: "green"
};

export const AREA_TYPES = {
  AULA: "aula",
  SALON: "salon", 
  HALL: "hall",
  BANO: "bano",
  PUNTO: "punto",
  PASILLO: "pasillo"
};

export const CONTROL_PANEL_STYLE = {
  position: "absolute",
  top: 20,
  left: 20,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  width: "320px",
  fontFamily: "Inter, Arial, sans-serif",
};