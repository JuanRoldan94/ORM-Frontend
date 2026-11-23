import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, /api/* se reenvía al backend de NestJS (así no hace falta CORS).
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (ruta) => ruta.replace(/^\/api/, ''),
      },
    },
  },
})
