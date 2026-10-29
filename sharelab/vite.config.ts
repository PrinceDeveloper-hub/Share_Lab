import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    proxy: {
      '/api': {
        target: 'https://sharelab-api.local',
        changeOrigin: true,
      },
      '/storage': {
        target: 'https://sharelab-api.local',
        changeOrigin: true,
      },
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
