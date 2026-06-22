import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Base del backend (mismo valor que VITE_API_URL). Se usa para el proxy de imágenes en dev.
  const backend = (env.VITE_API_URL || '').replace(/\/+$/, '')

  return {
    plugins: [
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',  // Para ser accesible desde cualquier dispositivo de la red
      port: 3000, // El puerto en desarrollo
      strictPort: true,  // Evita que cambie el puerto si 5173 ya está ocupado
      open: true,
      // Proxy de imágenes del backend para evitar CORS en desarrollo.
      // El backend no envía 'Access-Control-Allow-Origin', así que el fetch que usan
      // react-pdf/docx para incrustar los logos falla cross-origin. Las servimos same-origin.
      proxy: backend
        ? {
            '/__img': {
              target: backend,
              changeOrigin: true,
              secure: true,
              rewrite: (p) => p.replace(/^\/__img/, ''),
            },
          }
        : undefined,
    },
  }
})
