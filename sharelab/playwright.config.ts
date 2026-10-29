import { defineConfig, devices } from '@playwright/test'
<<<<<<< HEAD

/**
 * Playwright runs against the Vite dev server with the API mocked per test, so
 * the suite exercises real routes and breakpoints without a Laravel instance.
 *
 * Projects map to the three responsive targets the redesign is tuned for:
 * desktop (sidebar layout), tablet and mobile (drawer layout).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 834, height: 1112 },
        hasTouch: true,
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'pnpm exec vite dev --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
})
