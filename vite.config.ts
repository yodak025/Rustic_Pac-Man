import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import {resolve} from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve:{
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/app'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@core': resolve(__dirname, 'src/core'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@services': resolve(__dirname, 'src/services'),
      '@state': resolve(__dirname, 'src/state'),
      '@custom-types': resolve(__dirname, 'src/types'),
      '@config': resolve(__dirname, 'src/config'),
      '@ui': resolve(__dirname, 'src/ui'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './src/app/index.tsx',
        index: './index.html',
      },
    }
  },
  server: {
    // Configurar headers para servir archivos Python
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  // Asegurar que los archivos .py se sirvan como texto
  assetsInclude: ['**/*.py'],
  optimizeDeps: {
    exclude: ['pyodide']
  }
})
