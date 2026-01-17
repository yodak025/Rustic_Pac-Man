import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Headers necesarios para Pyodide (WebAssembly + SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  
  // Transpile packages para compatibilidad
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // Turbopack configuration
  turbopack: {
    rules: {
      // Servir archivos .py como raw text
      '*.py': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
