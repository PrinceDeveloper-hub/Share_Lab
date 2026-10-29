import { defineConfig, devices } from '@playwright/test'

const WEB_PORT = 4180
const WEB_URL = `http://localhost:${WEB_PORT}`

/**
 * End-to-end tests run against the real stack: the Laravel API served over
 * HTTPS at https://sharelab-api.local (Laragon + seeded MariaDB) plus the Vite
 * dev server, which proxies `/api` and `/storage` to it. Start the API before
 * running the suite; only the web server is booted here.
 *
 * `ignoreHTTPSErrors` accepts the local self-signed certificate when a test
 * navigates straight to the API origin.
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
    ignoreHTTPSErrors: true,
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
      command: `pnpm exec vite dev --port ${WEB_PORT} --strictPort`,
      cwd: import.meta.dirname,
      url: WEB_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
