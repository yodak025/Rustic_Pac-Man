import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import {resolve} from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve:{
    alias: {
      '@': resolve(__dirname, 'src/app'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@state': resolve(__dirname, 'src/state'),
      '@styles': resolve(__dirname, 'src/assets/styles'),
      '@core': resolve(__dirname, 'src/core'),
      '@custom-types': resolve(__dirname, 'src/types'),
      '@inputs': resolve(__dirname, 'src/inputs'),
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
