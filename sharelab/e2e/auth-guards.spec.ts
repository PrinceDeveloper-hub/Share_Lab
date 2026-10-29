import { expect, test } from '@playwright/test'
import { managerUser, memberUser, mockApi } from './support/mock-api'

test.describe('route guards', () => {
  test('anonymous visitors are sent to sign in with a redirect', async ({
    page,
  }) => {
    await mockApi(page, { user: null })
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sign in to ShareLab' }),
    ).toBeVisible()
  })

  test('the manager route keeps its own redirect target', async ({ page }) => {
    await mockApi(page, { user: null })
    await page.goto('/manager')

    await expect(page).toHaveURL(/\/login\?redirect=%2Fmanager$/)
  })

  test('signing in lands on the requested workspace', async ({ page }) => {
    await mockApi(page, { user: null })
    await page.goto('/login')

    await page.getByLabel('Email address').fill(memberUser.email)
    await page.getByRole('textbox', { name: 'Password' }).fill('supersecret123')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Good (morning|afternoon|evening), Maya\./,
      }),
    ).toBeVisible()
  })

  test('a member sees the access panel on manager routes', async ({ page }) => {
    await mockApi(page, { user: memberUser })
    await page.goto('/manager')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Access not available' }),
    ).toBeVisible()
    await expect(page.getByText('Manager tools')).toHaveCount(0)
  })

  test('a manager opens the manager workspace', async ({ page }) => {
    await mockApi(page, { user: managerUser })
    await page.goto('/manager')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Manager tools' }),
    ).toBeVisible()
    await expect(
      page.getByRole('tab', { name: /Booking requests/ }),
    ).toBeVisible()
    await expect(page.getByText('Access not available')).toHaveCount(0)
  })
})
