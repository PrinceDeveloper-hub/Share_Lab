import { expect, test } from '@playwright/test'
import { demoResource, mockApi } from './support/mock-api'

/**
 * Public routes of the redesigned site. These run against every project, so
 * each assertion holds at the desktop, tablet and mobile breakpoints.
 */

test.describe('public routes', () => {
  test('home renders the hero and switches navigation by breakpoint', async ({
    page,
  }, testInfo) => {
    await mockApi(page, { user: null })
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Better access.',
    )
    await expect(
      page.getByRole('link', { name: 'Explore resources' }).first(),
    ).toBeVisible()

    const primaryNav = page.getByRole('navigation', { name: 'Primary' })
    const menuButton = page.getByRole('button', {
      name: 'Open navigation menu',
    })

    if (testInfo.project.name === 'desktop') {
      await expect(primaryNav).toBeVisible()
      await expect(menuButton).toBeHidden()
      return
    }

    await expect(primaryNav).toBeHidden()
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    const mobileNav = page.getByRole('navigation', { name: 'Mobile' })
    await expect(mobileNav).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Close navigation menu' }),
    ).toHaveAttribute('aria-expanded', 'true')

    await mobileNav.getByRole('link', { name: 'How It Works' }).click()
    await expect(page).toHaveURL(/\/how-it-works$/)
    await expect(mobileNav).toBeHidden()
  })

  test('resource catalogue lists mapped resources', async ({ page }) => {
    await mockApi(page, { user: null })
    await page.goto('/resources')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Find shared campus resources/i,
      }),
    ).toBeVisible()
    await expect(page.getByText(demoResource.name).first()).toBeVisible()
    await expect(page.getByText(demoResource.location).first()).toBeVisible()
  })

  test('resource detail page renders the resource contract', async ({
    page,
  }) => {
    await mockApi(page, { user: null })
    await page.goto(`/resources/${demoResource.id}`)

    await expect(
      page.getByRole('heading', { level: 1, name: demoResource.name }),
    ).toBeVisible()
    await expect(page.getByText(demoResource.location).first()).toBeVisible()
    await expect(page.getByText(/4 hours max/i).first()).toBeVisible()
  })

  test('how it works and about routes keep their headings', async ({
    page,
  }) => {
    await mockApi(page, { user: null })

    await page.goto('/how-it-works')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'From first search to a clean return.',
      }),
    ).toBeVisible()

    await page.goto('/about')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Shared resources should be easy to find — and hard to lose track of.',
      }),
    ).toBeVisible()
  })

  test('unknown routes fall back to the catalogue 404 page', async ({
    page,
  }) => {
    await mockApi(page, { user: null })
    await page.goto('/not-a-real-route')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page isn’t in the catalogue.',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Browse resources' }),
    ).toBeVisible()
  })
})
