import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The local API is served over HTTPS by Laragon at sharelab-api.local. Vite
// runs on http://localhost:3000 and forwards /api and /storage there, so the
// browser only ever talks to one origin and the auth cookies stay first-party.
// `secure: false` accepts the local self-signed certificate (Node does not use
// the Windows trust store); override with VITE_API_PROXY_TARGET when the API
// lives somewhere else, e.g. VITE_API_PROXY_TARGET=http://127.0.0.1:8000.
const apiTarget = process.env.VITE_API_PROXY_TARGET || 'https://sharelab-api.local'

const proxy = {
  target: apiTarget,
  changeOrigin: true,
  secure: false,
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    proxy: {
      '/api': proxy,
      '/storage': proxy,
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: false }),
    viteReact(),
  ],
})

export default config
