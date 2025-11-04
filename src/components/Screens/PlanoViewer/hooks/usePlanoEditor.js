import { useState, useCallback,useEffect,useRef } from 'react';
import { geometryUtils } from '../utils/geometry';
import { AREA_TYPES } from '../utils/constants';

export const usePlanoEditor = () => {
  // Estado principal que almacena TODOS los datos por plano
  const [datosPorPlano, setDatosPorPlano] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoActual, setTipoActual] = useState(AREA_TYPES.AULA);
  const [puntosTemporales, setPuntosTemporales] = useState([]);
  const [cursorPos, setCursorPos] = useState(null);
  const [nombreArea, setNombreArea] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [planoActual, setPlanoActual] = useState(null);

  const datosPorPlanoRef = useRef(datosPorPlano);

  useEffect(() => {
    const cargarDatosDesdeAPI = async () => {
      try {
        console.log("🔄 Cargando datos desde API...");
        debugger
        const response = await fetch('https://e13217bbfd70.ngrok-free.app/api/map/getPoint',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
        
      debugger
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const datos = await response.json();
        
        if (!datos || !datos.planos || Object.keys(datos.planos).length === 0) {
          console.log("📭 API respondió pero sin datos");
          return;
        }
        
        console.log("✅ Datos cargados desde API correctamente");
        cargarDatosEnEditor(datos);
        
      } catch (error) {
        console.log('📭 Error cargando datos desde API:', error.message);
        console.log('💡 Continuando sin datos preguardados...');
      }
    };

    // Pequeño delay para asegurar que la app esté lista
    setTimeout(cargarDatosDesdeAPI, 1000);
    
  }, []);
  
  useEffect(() => {
    datosPorPlanoRef.current = datosPorPlano;
  }, [datosPorPlano]);

  // 2️⃣ FUNCIONES DE EXPORTACIÓN (en orden de dependencia)
  const exportarDatosJSON = useCallback(() => {
    const datosActuales = datosPorPlanoRef.current;
    const datosCompletos = {
      metadata: {
        fechaExportacion: new Date().toISOString(),
        totalPlanos: Object.keys(datosActuales).length,
        version: "2.0", // Actualizamos versión por el cambio
        soporteDestinosMultiples: true
      },
      planos: {}
    };
    
    Object.entries(datosActuales).forEach(([planoId, planoData]) => {
      datosCompletos.planos[planoId] = {
        areas: (planoData.areas || []).map(area => {
          // Para escaleras, formatear correctamente los destinos
          if (area.tipo === "escalera") {
            const escaleraFormateada = { ...area };
            
            // Si tiene destinos múltiples, incluirlos en el JSON
            if (Array.isArray(area.destinos) && area.destinos.length > 0) {
              escaleraFormateada.destinos = area.destinos.map(destino => ({
                carrera: destino.carrera,
                piso: destino.piso,
                direccion: destino.direccion || "ambos"
              }));
              
              // Mantener compatibilidad: también incluir destino único principal
              if (area.destinos.length > 0) {
                const destinoPrincipal = area.destinos[0];
                escaleraFormateada.carreraDestino = destinoPrincipal.carrera;
                escaleraFormateada.pisoDestino = destinoPrincipal.piso;
              }
            } else {
              // Para escaleras con destino único, mantener estructura original
              escaleraFormateada.carreraDestino = area.carreraDestino;
              escaleraFormateada.pisoDestino = area.pisoDestino;
              escaleraFormateada.direccion = area.direccion || "ambos";
            }
            
            return escaleraFormateada;
          }
          
          // Para otras áreas, mantener formato original
          return area;
        }),
        points: planoData.points || []
      };
    });
    
    console.log("=== 📋 DATOS COMPLETOS EN FORMATO JSON (CON DESTINOS MÚLTIPLES) ===");
    console.log(JSON.stringify(datosCompletos, null, 2));
    
    return datosCompletos;
  }, [datosPorPlano]);

  const guardarTodosLosDatosEnServidor = useCallback(async () => {
    try {
      debugger
      const datosCompletos = exportarDatosJSON();
      const datosStr = JSON.stringify(datosCompletos);
      
      const response = await fetch('https://e13217bbfd70.ngrok-free.app/api/map/updatePoint', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: datosStr
      });
      
      if (response.ok) {
        console.log("✅ Todos los datos guardados en servidor");
        return true;
      } else {
        console.warn("⚠️ No se pudo guardar en servidor");
        return false;
      }
    } catch (error) {
      console.warn("⚠️ Error de conexión con servidor:", error.message);
      return false;
    }
  }, [exportarDatosJSON]);

  const cargarDatosEnEditor = useCallback((datosImportados) => {
    if (!datosImportados || !datosImportados.planos) {
      console.error('❌ Datos inválidos para cargar en editor');
      return;
    }

    console.log("🔄 Cargando datos preguardados en el editor...");
    
    const estadisticas = {
      planos: 0,
      areas: 0,
      puntos: 0,
      escaleras: 0,
      pasillos: 0,
      elementosEspeciales: 0,
      escalerasMultiDestino: 0
    };

    // Crear nueva estructura de datos
    const nuevosDatos = {};
    
    Object.entries(datosImportados.planos).forEach(([planoId, planoData]) => {
      estadisticas.planos++;
      
      nuevosDatos[planoId] = {
        areas: [],
        points: []
      };

      // Procesar áreas
      if (planoData.areas && Array.isArray(planoData.areas)) {
        nuevosDatos[planoId].areas = planoData.areas.map(area => {
          estadisticas.areas++;
          
          if (area.tipo === AREA_TYPES.ESCALERA) {
            estadisticas.escaleras++;
            
            // Detectar si es una escalera con destinos múltiples
            if (area.destinos && Array.isArray(area.destinos) && area.destinos.length > 1) {
              estadisticas.escalerasMultiDestino++;
              console.log(`   🪜 Cargando escalera multi-destino: ${area.nombre} (${area.destinos.length} destinos)`);
            } else {
              console.log(`   🪜 Cargando escalera: ${area.nombre}`);
            }
          } else if (area.tipo === AREA_TYPES.PASILLO) {
            estadisticas.pasillos++;
          }
          
          console.log(`   🏢 Cargando área: ${area.nombre} (${area.tipo})`);
          return area;
        });
      }
      
      // Procesar puntos
      if (planoData.points && Array.isArray(planoData.points)) {
        nuevosDatos[planoId].points = planoData.points.map(punto => {
          estadisticas.puntos++;
          
          if (punto.tipo !== AREA_TYPES.PUNTO) {
            estadisticas.elementosEspeciales++;
          }
          
          console.log(`   📍 Cargando punto: ${punto.nombre} (${punto.tipo})`);
          return punto;
        });
      }
    });

    // Actualizar el estado con los nuevos datos
    setDatosPorPlano(nuevosDatos);

    console.log("📈 DATOS CARGADOS AUTOMÁTICAMENTE:");
    console.log(`   📊 Planos: ${estadisticas.planos}`);
    console.log(`   🏢 Áreas: ${estadisticas.areas}`);
    console.log(`   📍 Puntos: ${estadisticas.puntos}`);
    console.log(`   🪜 Escaleras: ${estadisticas.escaleras}`);
    console.log(`   🔄 Escaleras multi-destino: ${estadisticas.escalerasMultiDestino}`);
    console.log(`   🛣️ Pasillos: ${estadisticas.pasillos}`);
    console.log(`   🧯 Elementos especiales: ${estadisticas.elementosEspeciales}`);
    
    // Mostrar notificación sutil
    setTimeout(() => {
      console.log("🎯 Todos los datos preguardados han sido cargados automáticamente");
    }, 1000);

  }, []);

  // 1️⃣ FUNCIONES BASE PRIMERO
  const generarIdUnico = useCallback((prefijo) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefijo}_${timestamp}_${random}`;
  }, []);

  const getDatosPlanoActual = useCallback(() => {
    if (!planoActual) return { areas: [], points: [] };
    return datosPorPlano[planoActual.id] || { areas: [], points: [] };
  }, [planoActual, datosPorPlano]);

  const { areas, points } = getDatosPlanoActual();

  const resetEditorState = useCallback(() => {
    setPuntosTemporales([]);
    setModoEdicion(false);
    setCursorPos(null);
    setNombreArea("");
    setSelectedNode(null);
  }, []);

  const actualizarDatosPlano = useCallback((planoId, nuevasAreas, nuevosPoints) => {
    setDatosPorPlano(prev => {
      const nuevosDatos = {
        ...prev,
        [planoId]: {
          areas: nuevasAreas || [],
          points: nuevosPoints || []
        }
      };
      
      console.log("🔄 Actualizando datos del plano:", planoId);
      console.log("   Áreas:", nuevasAreas?.length || 0);
      console.log("   Puntos:", nuevosPoints?.length || 0);
      
      return nuevosDatos;
    });
  }, []);

  const getDisplayName = (tipo) => {
    const nombres = {
      [AREA_TYPES.PUNTO]: 'Punto',
      [AREA_TYPES.EXTINTOR]: 'Matafuegos',
      [AREA_TYPES.SALIDA_EMERGENCIA]: 'Salida Emergencia',
      [AREA_TYPES.DESFIBRILADOR]: 'Desfibrilador',
      [AREA_TYPES.BOTIQUIN]: 'Botiquín',
      [AREA_TYPES.ALARMA]: 'Alarma',
      [AREA_TYPES.TOTEM]: 'Tótem'
    };
    return nombres[tipo] || tipo;
  };

  const descargarJSON = useCallback(() => {
    const datosCompletos = exportarDatosJSON();
    const datosStr = JSON.stringify(datosCompletos, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos-plano-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("📥 Archivo JSON listo para descargar");
  }, [exportarDatosJSON]);

  const copiarJSONAlPortapapeles = useCallback(async () => {
    const datosCompletos = exportarDatosJSON();
    const datosStr = JSON.stringify(datosCompletos, null, 2);
    
    try {
      await navigator.clipboard.writeText(datosStr);
      console.log("✅ JSON copiado al portapapeles");
      alert("✅ JSON copiado al portapapeles");
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      const textArea = document.createElement('textarea');
      textArea.value = datosStr;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log("✅ JSON copiado al portapapeles (fallback)");
      alert("✅ JSON copiado al portapapeles");
    }
  }, [exportarDatosJSON]);

  const simularGuardadoEnHooks = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('⚠️ Esta función solo está disponible en modo desarrollo');
      return;
    }
    
    const datosCompletos = exportarDatosJSON();
    const datosStr = JSON.stringify(datosCompletos, null, 2);
    
    console.log("=== 🗂️ SIMULANDO GUARDADO EN CARPETA HOOKS ===");
    console.log("📍 Ruta: /hooks/datos-plano.json");
    console.log("📝 Contenido del archivo:");
    console.log(datosStr);
    console.log("💡 En un entorno real, esto requeriría una API del servidor");
    
    if (window.confirm('No se puede guardar directamente en el servidor desde el navegador. ¿Quieres descargar el archivo JSON en su lugar?')) {
      descargarJSON();
    }
  }, [exportarDatosJSON, descargarJSON]);

  const exportarTodosLosDatos = useCallback(() => {
    console.log("=== 📊 EXPORTANDO TODOS LOS DATOS ===");
    
    const todosLosDatosArray = [];
    
    Object.entries(datosPorPlano).forEach(([planoId, planoData]) => {
      console.log(`\n📁 Plano: ${planoId}`);
      
      if (planoData.areas && planoData.areas.length > 0) {
        console.log("🏢 ÁREAS:");
        planoData.areas.forEach(area => {
          const areaData = {
            tipo: 'area',
            id: area.id,
            nombre: area.nombre,
            tipoArea: area.tipo,
            planoId: area.planoId,
            carrera: area.carrera,
            piso: area.piso,
            puntos: area.points || [],
            ...(area.tipo === 'escalera' && {
              carreraActual: area.carreraActual,
              pisoActual: area.pisoActual,
              carreraDestino: area.carreraDestino,
              pisoDestino: area.pisoDestino,
              direccion: area.direccion,
              // Nuevo campo para destinos múltiples
              destinos: area.destinos || null,
              destinosCount: area.destinos ? area.destinos.length : 1
            }),
            ...(area.tipo === 'pasillo' && {
              desde: area.from?.id,
              hacia: area.to?.id
            })
          };
          console.log("  📍", areaData);
          todosLosDatosArray.push(areaData);
        });
      }
      
      if (planoData.points && planoData.points.length > 0) {
        console.log("📍 PUNTOS:");
        planoData.points.forEach(punto => {
          const puntoData = {
            tipo: 'punto',
            id: punto.id,
            nombre: punto.nombre,
            tipoPunto: punto.tipo,
            x: punto.x,
            y: punto.y,
            planoId: punto.planoId,
            carrera: punto.carrera,
            piso: punto.piso
          };
          console.log("  📍", puntoData);
          todosLosDatosArray.push(puntoData);
        });
      }
    });
    
    console.log(`\n📈 RESUMEN TOTAL:`);
    console.log(`   📊 Total elementos: ${todosLosDatosArray.length}`);
    console.log(`   🏢 Áreas: ${todosLosDatosArray.filter(d => d.tipo === 'area').length}`);
    console.log(`   📍 Puntos: ${todosLosDatosArray.filter(d => d.tipo === 'punto').length}`);
    console.log(`   🪜 Escaleras: ${todosLosDatosArray.filter(d => d.tipoArea === 'escalera').length}`);
    console.log(`   🔄 Escaleras multi-destino: ${todosLosDatosArray.filter(d => d.destinosCount > 1).length}`);
    console.log(`   🛣️ Pasillos: ${todosLosDatosArray.filter(d => d.tipoArea === 'pasillo').length}`);
    console.log(`   🧯 Elementos especiales: ${todosLosDatosArray.filter(d => 
      d.tipoPunto && d.tipoPunto !== 'punto').length}`);
    
    return todosLosDatosArray;
  }, [datosPorPlano]);

  const getIconoTipo = (tipo) => {
    const iconos = {
      aulas: '🏫',
      halls: '🏢',
      banos: '🚻',
      escaleras: '🪜',
      pasillos: '🛣️',
      puntos: '📍',
      extintores: '🧯',
      salidasEmergencia: '🚪',
      desfibriladores: '💓',
      botiquines: '🩹',
      alarmas: '🚨',
      totems: '📟'
    };
    return iconos[tipo] || '📁';
  };

  const exportarDatosPorTipo = useCallback(() => {
    const datosPorTipo = {
      aulas: [],
      halls: [],
      banos: [],
      escaleras: [],
      pasillos: [],
      puntos: [],
      extintores: [],
      salidasEmergencia: [],
      desfibriladores: [],
      botiquines: [],
      alarmas: [],
      totems: []
    };
    
    Object.values(datosPorPlano).forEach(planoData => {
      planoData.areas?.forEach(area => {
        const areaData = {
          id: area.id,
          nombre: area.nombre,
          planoId: area.planoId,
          carrera: area.carrera,
          piso: area.piso,
          puntos: area.points
        };
        
        switch(area.tipo) {
          case 'aula':
            datosPorTipo.aulas.push(areaData);
            break;
          case 'hall':
            datosPorTipo.halls.push(areaData);
            break;
          case 'bano':
            datosPorTipo.banos.push(areaData);
            break;
          case 'escalera':
            const escaleraData = {
              ...areaData,
              carreraActual: area.carreraActual,
              pisoActual: area.pisoActual,
              carreraDestino: area.carreraDestino,
              pisoDestino: area.pisoDestino,
              direccion: area.direccion
            };
            
            // Incluir información de destinos múltiples si existe
            if (area.destinos && area.destinos.length > 0) {
              escaleraData.destinos = area.destinos;
              escaleraData.destinosCount = area.destinos.length;
            }
            
            datosPorTipo.escaleras.push(escaleraData);
            break;
          case 'pasillo':
            datosPorTipo.pasillos.push({
              ...areaData,
              desde: area.from?.id,
              hacia: area.to?.id,
              desdeNombre: area.from?.nombre,
              haciaNombre: area.to?.nombre
            });
            break;
        }
      });
      
      planoData.points?.forEach(punto => {
        const puntoData = {
          id: punto.id,
          nombre: punto.nombre,
          x: punto.x,
          y: punto.y,
          planoId: punto.planoId,
          carrera: punto.carrera,
          piso: punto.piso
        };
        
        switch(punto.tipo) {
          case 'punto':
            datosPorTipo.puntos.push(puntoData);
            break;
          case 'extintor':
            datosPorTipo.extintores.push(puntoData);
            break;
          case 'salida_emergencia':
            datosPorTipo.salidasEmergencia.push(puntoData);
            break;
          case 'desfibrilador':
            datosPorTipo.desfibriladores.push(puntoData);
            break;
          case 'botiquin':
            datosPorTipo.botiquines.push(puntoData);
            break;
          case 'alarma':
            datosPorTipo.alarmas.push(puntoData);
            break;
          case 'totem':
            datosPorTipo.totems.push(puntoData);
            break;
        }
      });
    });
    
    console.log("=== 🗂️ DATOS ORGANIZADOS POR TIPO ===");
    Object.entries(datosPorTipo).forEach(([tipo, datos]) => {
      if (datos.length > 0) {
        const infoExtra = tipo === 'escaleras' ? 
          ` (${datos.filter(d => d.destinosCount > 1).length} multi-destino)` : '';
        console.log(`\n${getIconoTipo(tipo)} ${tipo.toUpperCase()} (${datos.length}${infoExtra}):`);
        datos.forEach(item => {
          const destinosInfo = item.destinosCount > 1 ? ` [${item.destinosCount} destinos]` : '';
          console.log(`   📍 ${item.nombre} - ID: ${item.id}${destinosInfo}`);
        });
      }
    });
    
    return datosPorTipo;
  }, [datosPorPlano]);

  // 3️⃣ FUNCIONES PRINCIPALES DEL EDITOR
  const limpiarIDsDuplicados = useCallback(() => {
    setDatosPorPlano(prev => {
      const nuevosDatos = {};
      
      Object.keys(prev).forEach(planoId => {
        const planoData = prev[planoId];
        const areasUnicas = [];
        const pointsUnicos = [];
        const idsUsados = new Set();
        
        planoData.areas.forEach(area => {
          let nuevoId = area.id;
          if (idsUsados.has(area.id)) {
            nuevoId = generarIdUnico('area_corregida');
            console.warn(`🔄 Corrigiendo ID duplicado: ${area.id} -> ${nuevoId}`);
          }
          idsUsados.add(nuevoId);
          areasUnicas.push({ ...area, id: nuevoId });
        });
        
        planoData.points.forEach(point => {
          let nuevoId = point.id;
          if (idsUsados.has(point.id)) {
            nuevoId = generarIdUnico('punto_corregido');
            console.warn(`🔄 Corrigiendo ID duplicado: ${point.id} -> ${nuevoId}`);
          }
          idsUsados.add(nuevoId);
          pointsUnicos.push({ ...point, id: nuevoId });
        });
        
        nuevosDatos[planoId] = {
          areas: areasUnicas,
          points: pointsUnicos
        };
      });
      
      return nuevosDatos;
    });
  }, [generarIdUnico]);

  const handleClickSVG = useCallback((e, getRelativeCoords) => {
    if (!modoEdicion) return;

    const { x, y } = getRelativeCoords(e);

    const esTipoPunto = [
      AREA_TYPES.PUNTO,
      AREA_TYPES.EXTINTOR,
      AREA_TYPES.SALIDA_EMERGENCIA,
      AREA_TYPES.DESFIBRILADOR,
      AREA_TYPES.BOTIQUIN,
      AREA_TYPES.ALARMA,
      AREA_TYPES.TOTEM 
    ].includes(tipoActual);

    if (esTipoPunto) {
      setPuntosTemporales((prev) => [...prev, [x, y]]);
      return;
    }

    if (tipoActual === AREA_TYPES.PASILLO) return;

    setPuntosTemporales((prev) => [...prev, [x, y]]);
  }, [modoEdicion, tipoActual]);

  const handleMouseMove = useCallback((e, getRelativeCoords) => {
    if (!modoEdicion || tipoActual === AREA_TYPES.PASILLO) return;
    const { x, y } = getRelativeCoords(e);
    setCursorPos([x, y]);
  }, [modoEdicion, tipoActual]);

  const handleGuardarArea = useCallback(async (nuevaArea, planoInfo) => {
    const esTipoPunto = [
      AREA_TYPES.PUNTO,
      AREA_TYPES.EXTINTOR,
      AREA_TYPES.SALIDA_EMERGENCIA,
      AREA_TYPES.DESFIBRILADOR,
      AREA_TYPES.BOTIQUIN,
      AREA_TYPES.ALARMA,
      AREA_TYPES.TOTEM 
    ].includes(nuevaArea.tipo);

    if (esTipoPunto && puntosTemporales.length > 0 && planoInfo) {
      // Guardar como punto
      const datosActuales = getDatosPlanoActual();
      const nuevoPunto = {
        id: generarIdUnico('punto'),
        tipo: nuevaArea.tipo,
        nombre: nuevaArea.nombre || `Nuevo ${nuevaArea.tipo}`,
        x: puntosTemporales[0][0],
        y: puntosTemporales[0][1],
        carrera: planoInfo.carrera || 'general',
        piso: planoInfo.piso || 'planta_principal',
        planoId: planoInfo.id
      };
      
      const nuevosPoints = [...datosActuales.points, nuevoPunto];
      actualizarDatosPlano(planoInfo.id, datosActuales.areas, nuevosPoints);
      resetEditorState();
      
      console.log("✅ Punto especial creado:", nuevoPunto.nombre);
      
      setTimeout(async () => {
        await guardarTodosLosDatosEnServidor();
      }, 100);
      
    } else if (puntosTemporales.length > 2 && planoInfo) {
      // Guardar como área
      const areaConInfo = {
        ...nuevaArea,
        id: generarIdUnico('area'),
        carrera: planoInfo.carrera || 'general',
        piso: planoInfo.piso || 'planta_principal',
        planoId: planoInfo.id,
        points: nuevaArea.points || puntosTemporales
      };
      
      // Para escaleras con destinos múltiples, mostrar información
      if (nuevaArea.tipo === AREA_TYPES.ESCALERA && nuevaArea.destinos) {
        console.log("🔗 Escalera con múltiples destinos configurada:", nuevaArea.destinos);
      }
      
      const datosActuales = getDatosPlanoActual();
      const nuevasAreas = [...datosActuales.areas, areaConInfo];
      actualizarDatosPlano(planoInfo.id, nuevasAreas, datosActuales.points);
      resetEditorState();
      
      console.log("✅ Área creada:", areaConInfo.nombre);
      
      setTimeout(async () => {
        await guardarTodosLosDatosEnServidor();
      }, 100);
    }
  }, [puntosTemporales, getDatosPlanoActual, actualizarDatosPlano, resetEditorState, generarIdUnico, guardarTodosLosDatosEnServidor]);

  const handleGuardarPuntos = useCallback(async (planoInfo) => {
    if (puntosTemporales.length > 0 && planoInfo) {
      const datosActuales = getDatosPlanoActual();
      const nuevosPuntos = puntosTemporales.map((pt, i) => ({
        id: generarIdUnico('punto'),
        tipo: tipoActual,
        nombre: tipoActual === AREA_TYPES.PUNTO 
          ? `Punto ${datosActuales.points.length + i + 1}`
          : `${getDisplayName(tipoActual)} ${datosActuales.points.filter(p => p.tipo === tipoActual).length + 1}`,
        x: pt[0],
        y: pt[1],
        carrera: planoInfo.carrera || 'general',
        piso: planoInfo.piso || 'planta_principal',
        planoId: planoInfo.id
      }));
      
      const nuevosPoints = [...datosActuales.points, ...nuevosPuntos];
      
      // 1️⃣ ACTUALIZAR ESTADO
      actualizarDatosPlano(planoInfo.id, datosActuales.areas, nuevosPoints);
      resetEditorState();
      
      console.log("✅ Puntos creados:", nuevosPuntos.length);
      
      // 2️⃣ PEQUEÑO DELAY para asegurar que React actualizó el estado
      setTimeout(async () => {
        // 3️⃣ GUARDAR EN SERVIDOR con datos actualizados
        await guardarTodosLosDatosEnServidor();
      }, 100);
    }
  }, [puntosTemporales, tipoActual, getDatosPlanoActual, actualizarDatosPlano, resetEditorState, generarIdUnico, guardarTodosLosDatosEnServidor]);

  const handleDeshacer = useCallback(() => {
    setPuntosTemporales((prev) => prev.slice(0, -1));
  }, []);

  const handleCancelar = useCallback(() => {
    resetEditorState();
  }, [resetEditorState]);

  const handleNodeClick = useCallback(async (node) => {
    if (!modoEdicion || tipoActual !== AREA_TYPES.PASILLO || !planoActual) return;
    
    if (!selectedNode) {
      setSelectedNode(node);
    } else if (selectedNode.id !== node.id) {
      const datosActuales = getDatosPlanoActual();
      
      const pasillo1 = {
        id: generarIdUnico('pasillo'),
        tipo: AREA_TYPES.PASILLO,
        from: selectedNode,
        to: node,
        nombre: `Pasillo ${selectedNode.nombre}-${node.nombre}`,
        carrera: planoActual.carrera || 'general',
        piso: planoActual.piso || 'planta_principal',
        planoId: planoActual.id
      };
      const pasillo2 = {
        id: generarIdUnico('pasillo'),
        tipo: AREA_TYPES.PASILLO,
        from: node,
        to: selectedNode,
        nombre: `Pasillo ${node.nombre}-${selectedNode.nombre}`,
        carrera: planoActual.carrera || 'general',
        piso: planoActual.piso || 'planta_principal',
        planoId: planoActual.id
      };
      
      const nuevasAreas = [...datosActuales.areas, pasillo1, pasillo2];
      actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
      setSelectedNode(null);
      
      console.log("✅ Pasillos creados conectando:", selectedNode.nombre, "con", node.nombre);
      
      setTimeout(async () => {
        await guardarTodosLosDatosEnServidor();
      }, 100);
    }
  }, [modoEdicion, tipoActual, selectedNode, planoActual, getDatosPlanoActual, actualizarDatosPlano, generarIdUnico, guardarTodosLosDatosEnServidor]);

  const actualizarPlanoActual = useCallback((planoInfo) => {
    setPlanoActual(planoInfo);
    
    if (planoInfo && !datosPorPlano[planoInfo.id]) {
      actualizarDatosPlano(planoInfo.id, [], []);
    }
  }, [datosPorPlano, actualizarDatosPlano]);

  const handleEliminarNodo = useCallback(async (nodeId) => {
    if (!planoActual) return;
    
    console.log("🗑️ Eliminando nodo:", nodeId);
    
    const datosActuales = getDatosPlanoActual();
    
    const nuevasAreas = datosActuales.areas.filter(area => area.id !== nodeId);
    const nuevosPoints = datosActuales.points.filter(point => point.id !== nodeId);
    
    const areasFiltradas = nuevasAreas.filter(area => {
      if (area.tipo === AREA_TYPES.PASILLO) {
        return area.from?.id !== nodeId && area.to?.id !== nodeId;
      }
      return true;
    });
    
    actualizarDatosPlano(planoActual.id, areasFiltradas, nuevosPoints);
    console.log("✅ Nodo eliminado:", nodeId);
    
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
    
    setTimeout(async () => {
      await guardarTodosLosDatosEnServidor();
    }, 100);
  }, [planoActual, getDatosPlanoActual, actualizarDatosPlano, selectedNode, guardarTodosLosDatosEnServidor]);

  const handleEliminarConexion = useCallback(async (conexionId) => {
    if (!planoActual) return;
    
    console.log("🗑️ Eliminando conexión:", conexionId);
    
    const datosActuales = getDatosPlanoActual();
    
    const nuevasAreas = datosActuales.areas.filter(area => 
      area.id !== conexionId
    );
    
    actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
    console.log("✅ Conexión eliminada:", conexionId);
    
    setTimeout(async () => {
      await guardarTodosLosDatosEnServidor();
    }, 100);
  }, [planoActual, getDatosPlanoActual, actualizarDatosPlano, guardarTodosLosDatosEnServidor]);

  const handleEliminarConexionesNodo = useCallback((nodeId) => {
    if (!planoActual) return;
    
    console.log("🗑️ Eliminando todas las conexiones del nodo:", nodeId);
    
    const datosActuales = getDatosPlanoActual();
    
    const nuevasAreas = datosActuales.areas.filter(area => {
      if (area.tipo === AREA_TYPES.PASILLO) {
        return area.from?.id !== nodeId && area.to?.id !== nodeId;
      }
      return true;
    });
    
    actualizarDatosPlano(planoActual.id, nuevasAreas, datosActuales.points);
    console.log("✅ Conexiones eliminadas para nodo:", nodeId);
  }, [planoActual, getDatosPlanoActual, actualizarDatosPlano]);

  return {
    // Estado del plano actual
    areas,
    points,
    modoEdicion,
    tipoActual,
    puntosTemporales,
    cursorPos,
    nombreArea,
    selectedNode,
    planoActual,
    
    // Setters
    setModoEdicion,
    setTipoActual,
    setNombreArea,
    setSelectedNode,
    setCursorPos,
    actualizarPlanoActual,
    
    // Handlers principales
    handleClickSVG,
    handleMouseMove,
    handleGuardarArea: (nuevaArea) => handleGuardarArea(nuevaArea, planoActual),
    handleGuardarPuntos: () => handleGuardarPuntos(planoActual),
    handleDeshacer,
    handleCancelar,
    handleNodeClick,
    limpiarIDsDuplicados,
    
    // Handlers para eliminar
    handleEliminarNodo,
    handleEliminarConexion,
    handleEliminarConexionesNodo,

    // Funciones de exportación
    exportarTodosLosDatos,
    exportarDatosJSON,
    exportarDatosPorTipo,
    descargarJSON,
    copiarJSONAlPortapapeles,
    simularGuardadoEnHooks,
    cargarDatosEnEditor,
    
    // Para debug
    todosLosDatos: datosPorPlano
  };
};