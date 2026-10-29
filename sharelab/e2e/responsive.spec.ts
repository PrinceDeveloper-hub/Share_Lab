import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { managerUser, memberUser, mockApi } from './support/mock-api'

/**
 * Breakpoint checks. Each test reads the active project name, so the desktop,
 * tablet and mobile projects assert the layout they are actually rendered at.
 */

const isDesktop = (projectName: string) => projectName === 'desktop'

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
}

test.describe('workspace responsive shell', () => {
  test('sidebar gives way to a navigation drawer below desktop', async ({
    page,
  }, testInfo) => {
    await mockApi(page, { user: memberUser })
    await page.goto('/dashboard')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Good (morning|afternoon|evening)/,
      }),
    ).toBeVisible()

    const sidebar = page.getByRole('navigation', { name: 'Workspace' })
    const drawerButton = page.getByRole('button', {
      name: 'Open workspace navigation',
    })

    if (isDesktop(testInfo.project.name)) {
      await expect(sidebar).toBeVisible()
      await expect(drawerButton).toBeHidden()
      await expect(
        sidebar.getByRole('link', { name: 'My bookings' }),
      ).toBeVisible()
      return
    }

    await expect(sidebar).toBeHidden()
    await expect(drawerButton).toBeVisible()

    await drawerButton.click()
    const drawer = page.getByRole('dialog', { name: 'Workspace navigation' })
    await expect(drawer).toBeVisible()
    await expect(
      drawer.getByRole('link', { name: 'My bookings' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Close navigation' }).click()
    await expect(drawer).toBeHidden()
  })

  test('the manager queue uses a table on desktop and cards below it', async ({
    page,
  }, testInfo) => {
    await mockApi(page, { user: managerUser })
    await page.goto('/manager')

    const requesterHeader = page.getByRole('columnheader', {
      name: 'Requester',
    })
    const approveButton = page
      .getByRole('button', { name: 'Approve' })
      .filter({ visible: true })

    if (isDesktop(testInfo.project.name)) {
      await expect(page.locator('table')).toBeVisible()
      await expect(requesterHeader).toBeVisible()
      await expect(approveButton.first()).toBeVisible()
      return
    }

    await expect(page.locator('table')).toBeHidden()
    await expect(requesterHeader).toBeHidden()
    await expect(approveButton.first()).toBeVisible()
    await expect(page.getByText('Priority 64').first()).toBeVisible()
  })

  test('public pages fit the viewport without horizontal scrolling', async ({
    page,
  }) => {
    await mockApi(page, { user: null })

    for (const path of ['/', '/resources', '/how-it-works', '/about']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectNoHorizontalOverflow(page)
    }
  })

  test('workspace pages fit the viewport without horizontal scrolling', async ({
    page,
  }) => {
    await mockApi(page, { user: managerUser })

    for (const path of ['/dashboard', '/my-bookings', '/manager']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectNoHorizontalOverflow(page)
    }
  })
})
