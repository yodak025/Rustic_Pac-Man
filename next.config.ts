import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'
import PyodidePlugin from '@pyodide/webpack-plugin'

const nextConfig: NextConfig = {
  // Rewrites para servir archivos Python desde src/maze-gen/
  async rewrites() {
    return [
      {
        source: '/maze-gen/:path*',
        destination: '/api/maze-gen/:path*',
      },
    ]
  },

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

  // Webpack configuration (replaces turbopack for Pyodide compatibility)
  webpack: (config: WebpackConfig, { isServer }) => {
    // Regla para archivos .py - servir como raw text
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /\.py$/,
      type: 'asset/source',
    })

    // Solo aplicar configuración del cliente
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.plugins.push(
        new PyodidePlugin({})
      )

      // Fallbacks para módulos de Node.js que Pyodide puede intentar usar
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "node:child_process": false,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  }
}

export default nextConfig
