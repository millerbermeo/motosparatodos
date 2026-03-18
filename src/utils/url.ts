export const BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn('⚠️ VITE_API_URL no está definida, usando fallback');
  }
  return url ?? 'https://tuclick.vozipcolombia.net.co/motos/back';
})();