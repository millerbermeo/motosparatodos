// URL base del backend. Única fuente: variable de entorno VITE_API_URL.
// No hardcodear URLs del backend en el código.
export const BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn('⚠️ VITE_API_URL no está definida. Configúrala en el archivo .env');
  }
  return url ?? '';
})();
