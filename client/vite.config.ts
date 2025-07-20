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
      '@core': resolve(__dirname, 'src/game/core'),
      '@game': resolve(__dirname, 'src/game'),
      '@services': resolve(__dirname, 'src/services'),
      '@state': resolve(__dirname, 'src/state'),
      '@custom-types': resolve(__dirname, 'src/types'),
      '@ui': resolve(__dirname, 'src/ui'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './src/app/index.tsx',
      },
    }
  },
  server: {
    proxy: {
      '/generation-endpoint': {
        target: 'http://localhost:5000'
      }
    }
  }
})
