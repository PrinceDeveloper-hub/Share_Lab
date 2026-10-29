import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { AuthProvider } from './features/auth/AuthProvider'
import { ThemeProvider } from './features/theme/ThemeProvider'
import { getRouter } from './router'
import { queryClient } from './lib/query-client'

import './styles.css'

const router = getRouter()

const rootElement = document.getElementById('root')

if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
