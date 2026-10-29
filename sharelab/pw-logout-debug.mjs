import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:3000'
const stateFile = process.argv[3]
const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext(
  stateFile ? { storageState: stateFile } : {},
)
const page = await context.newPage()

page.on('response', (response) => {
  const url = response.url()
  if (url.includes('/api/')) console.log('RESP', response.status(), url.replace(base, ''))
})

console.log('COOKIES at start', (await context.cookies()).map((c) => `${c.name}@${c.path}`))

await page.goto(`${base}/my-bookings`)
await page.waitForTimeout(1500)
console.log('URL after load', page.url())

await page.locator('button[aria-haspopup="menu"]').first().click()
console.log('menu items', await page.getByRole('menuitem').allTextContents())
await page.getByRole('menuitem', { name: 'Sign out' }).click()
await page.waitForTimeout(2500)
console.log('COOKIES after logout', (await context.cookies()).map((c) => `${c.name}@${c.path}`))
console.log('URL after logout', page.url())

await page.goto(`${base}/my-bookings`)
await page.waitForTimeout(2500)
console.log('URL after reload my-bookings', page.url())

await browser.close()
