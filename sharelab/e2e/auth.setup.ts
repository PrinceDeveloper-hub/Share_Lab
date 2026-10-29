import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const authDir = path.resolve(import.meta.dirname, '.auth')
fs.mkdirSync(authDir, { recursive: true })

/**
 * Signing in through the API once per role keeps the suite under the API's
 * login throttle (10 requests/minute) while still exercising real JWT cookies.
 */
for (const [file, email] of [
  ['user1', 'user1@sharelab.test'],
  ['manager', 'manager@sharelab.test'],
] as const) {
  setup(`authenticate ${file}`, async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { email, password: 'password' },
    })
    expect(response.ok(), `login ${email} -> ${response.status()}`).toBeTruthy()

    await request.storageState({ path: path.join(authDir, `${file}.json`) })
  })
}
