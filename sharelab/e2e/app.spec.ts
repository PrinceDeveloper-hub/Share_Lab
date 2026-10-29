import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const signIn = async (page: Page, email: string, password = 'password') => {
  await page.goto('/login')
  await page.locator('input#login-email').fill(email)
  await page.locator('input#login-password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

const uniqueListings = (page: Page) =>
  page
    .locator('a[href^="/resources/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')))])

test.describe('public catalogue', () => {
  test('home page leads to a real catalogue with resource cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()

    await page.getByRole('link', { name: 'Resources', exact: true }).first().click()

    await expect(page).toHaveURL(/\/resources$/)
    await expect(
      page.getByRole('heading', { name: 'Find shared campus resources.' }),
    ).toBeVisible()

    await expect(page.locator('a[href^="/resources/"]').first()).toBeVisible()
    const listings = await uniqueListings(page)
    expect(listings.length).toBeGreaterThanOrEqual(6)
  })

  test('guest opens a resource by the API id and sees requirements', async ({
    page,
    request,
  }) => {
    const response = await request.get('/api/resources')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.data.length).toBeGreaterThanOrEqual(6)
    const first = body.data[0]

    await page.goto(`/resources/${first.id}`)

    await expect(
      page.getByRole('heading', { level: 1, name: first.name }),
    ).toBeVisible()
    await expect(page.getByText('Requirements and rules')).toBeVisible()
    await expect(page.getByText('This resource could not be loaded')).toHaveCount(0)

    const signInLink = page.getByRole('link', {
      name: /Sign in to check eligibility/,
    })
    await expect(signInLink).toBeVisible()
    const href = await signInLink.getAttribute('href')
    expect(href).toContain(`redirect=${encodeURIComponent(`/resources/${first.id}`)}`)
  })

  test('unknown resource shows a 404 explanation and returns to the catalogue', async ({
    page,
  }) => {
    await page.goto('/resources/999999')

    await expect(
      page.getByRole('heading', { name: 'This listing no longer exists' }),
    ).toBeVisible()

    await page.getByRole('link', { name: /Back to resources/ }).click()
    await expect(page).toHaveURL(/\/resources$/)
  })

  test('malformed id is rejected client-side', async ({ page }) => {
    await page.goto('/resources/not-a-number')
    await expect(
      page.getByRole('heading', { name: 'That resource link is not valid' }),
    ).toBeVisible()
  })

  test('network failure is explained and Try again refetches', async ({ page }) => {
    await page.route('**/api/resources/1', (route) => route.abort('failed'))

    await page.goto('/resources/1')
    await expect(
      page.getByRole('heading', { name: /The server could not be reached/ }),
    ).toBeVisible()

    await page.unroute('**/api/resources/1')
    await page.getByRole('button', { name: 'Try again' }).click()

    await expect(page.getByText('Requirements and rules')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('catalogue search narrows results through the URL', async ({ page }) => {
    await page.goto('/resources')
    await page.getByRole('searchbox').first().fill('printer')

    await expect(page).toHaveURL(/q=printer/, { timeout: 10_000 })

    await expect
      .poll(async () => (await uniqueListings(page)).length, { timeout: 15_000 })
      .toBeLessThan(6)
    await expect(page.getByText(/printer/i).first()).toBeVisible()
  })

  test('How it works and About are real pages', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('authentication', () => {
  test('wrong password shows the API message', async ({ page }) => {
    await signIn(page, 'user1@sharelab.test', 'wrong-password')

    await expect(page.getByRole('alert')).toContainText(/incorrect/i)
    await expect(page).toHaveURL(/\/login/)
  })

  for (const [role, email] of [
    ['user', 'user1@sharelab.test'],
    ['manager', 'manager@sharelab.test'],
    ['owner', 'owner@sharelab.test'],
    ['admin', 'admin@sharelab.test'],
  ] as const) {
    test(`login as ${role} lands on the dashboard and survives a reload`, async ({
      page,
    }) => {
      await signIn(page, email)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
      await expect(page.getByText(/your requests/i).first()).toBeVisible()

      await page.reload()
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(page.getByText(/your requests/i).first()).toBeVisible({
        timeout: 15_000,
      })
    })
  }

  test('guest is redirected to login and returned to the requested page', async ({
    page,
  }) => {
    await page.goto('/my-bookings')
    await expect(page).toHaveURL(/\/login\?redirect=%2Fmy-bookings/)

    await page.locator('input#login-email').fill('user1@sharelab.test')
    await page.locator('input#login-password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/my-bookings$/, { timeout: 15_000 })
  })
})

test.describe('signed-in user', () => {
  test.use({ storageState: 'e2e/.auth/user1.json' })

  test('sees server-side eligibility on the detail page', async ({ page }) => {
    await page.goto('/resources/1')

    await expect(
      page.getByText(
        /Your account meets the listed requirements|Some requirements may still be missing/,
      ),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByRole('button', {
        name: /Submit booking request|Complete requirements to request/,
      }),
    ).toBeVisible()
  })

  test('my bookings lists real requests', async ({ page }) => {
    await page.goto('/my-bookings')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('a[href^="/resources/"]').first()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('logout clears the session', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.locator('button[aria-haspopup="menu"]').first().click()
    const logoutResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/logout'),
    )
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    expect((await logoutResponse).status()).toBe(200)

    await page.goto('/my-bookings')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })
})

test.describe('role boundaries', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' })

  test('a manager cannot open the owner workspace', async ({ page }) => {
    await page.goto('/owner')
    await expect(
      page.getByRole('heading', { name: 'Access not available' }),
    ).toBeVisible()
  })

  test('manager queue renders real requests', async ({ page }) => {
    await page.goto('/manager')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/queue|request/i).first()).toBeVisible()
  })
})
