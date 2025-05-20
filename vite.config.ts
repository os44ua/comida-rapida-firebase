import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // variables de entorno
  const env = loadEnv(mode, process.cwd(), "");
  
  return {
    plugins: [react()],
    // ruta basica para GitHub Pages
    base: env.VITE_APP_BASE_URL || '/',
    build: {
      outDir: 'docs',
    }
  };
});