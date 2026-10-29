import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const here = import.meta.dirname

const WEB_PORT = 4180
const WEB_URL = `http://localhost:${WEB_PORT}`
const API_URL = 'http://127.0.0.1:8000'

/**
 * End-to-end tests run against the real stack: the Laravel API (seeded
 * MariaDB) plus the Vite dev server, which proxies `/api` to it. Both servers
 * are started automatically unless one is already listening.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: WEB_URL,
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'php artisan serve --host=127.0.0.1 --port=8000',
      cwd: path.resolve(here, '../sharelab-api/backend'),
      url: `${API_URL}/api/resources`,
      reuseExistingServer: true,
      timeout: 90_000,
    },
    {
      command: `pnpm exec vite dev --port ${WEB_PORT} --strictPort`,
      cwd: here,
      url: WEB_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
