export const crearPasillosIniciales = (editor) => {
  if (!editor || !editor.actualizarDatosPlano) {
    console.error("❌ Editor no disponible");
    return;
  }

  const pasillos = [
    // Planta Principal
    {
      planoId: 'planta_principal',
      fromId: 'punto_mhgvsods_l1110',
      toId: 'punto_mhgvsods_23owd',
      nombre: 'Pasillo P1-P2'
    },
    {
      planoId: 'planta_principal', 
      fromId: 'punto_mhgvsods_23owd',
      toId: 'punto_mhgvsods_yk6bq',
      nombre: 'Pasillo P2-P3'
    },
    {
      planoId: 'planta_principal',
      fromId: 'punto_mhgvsods_yk6bq', 
      toId: 'punto_mhgvsods_9dwcg',
      nombre: 'Pasillo P3-P4'
    },
    {
      planoId: 'planta_principal',
      fromId: 'punto_mhgvsods_9dwcg',
      toId: 'punto_mhgvsods_4zrfv',
      nombre: 'Pasillo P4-P5'
    },
    // Sistemas P1
    {
      planoId: 'sistemas_p1',
      fromId: 'punto_mhgvvw4c_p1c22',
      toId: 'punto_mhgvvw4c_k0psu', 
      nombre: 'Pasillo P2-P1'
    },
    {
      planoId: 'sistemas_p1',
      fromId: 'punto_mhgvvw4c_k0psu',
      toId: 'area_mhgvvr4c_zewqa',
      nombre: 'Pasillo P1-Escalera'
    }
  ];

  console.log("🛣️ Creando pasillos iniciales...");
  
  pasillos.forEach(pasilloConfig => {
    // Aquí iría la lógica para crear cada pasillo
    console.log(`📍 Creando pasillo: ${pasilloConfig.nombre}`);
  });
  
  console.log("✅ Pasillos listos para crear (ejecuta esta función manualmente)");
};