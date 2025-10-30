// utils/helpers.js
export const platformUtils = {
  // Detectar si es Mac para mostrar Cmd en lugar de Ctrl
  isMac: () => {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  },
  
  // Obtener la tecla modificadora correcta para la plataforma
  getModifierKey: () => {
    return platformUtils.isMac() ? 'Cmd' : 'Ctrl';
  },
  
  // Obtener el símbolo de la tecla
  getModifierSymbol: () => {
    return platformUtils.isMac() ? '⌘' : 'Ctrl';
  }
};