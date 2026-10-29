import { expect, test } from '@playwright/test'
import { managerUser, memberUser, mockApi } from './support/mock-api'

test.describe('booking handover flows', () => {
  test('a manager records a decision from the queue', async ({ page }) => {
    const { calls } = await mockApi(page, { user: managerUser })
    await page.goto('/manager')

    await expect(
      page.getByRole('tab', { name: /Booking requests/ }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      page.getByText('Mia Torres').filter({ visible: true }).first(),
    ).toBeVisible()

    await page
      .getByRole('button', { name: 'Approve' })
      .filter({ visible: true })
      .first()
      .click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Approve this request' }),
    ).toBeVisible()

    await dialog
      .getByLabel(/Decision reason/)
      .fill('Training verified and the slot is free.')
    await dialog.getByRole('button', { name: 'Approve request' }).click()

    await expect(
      page.getByText('Request approved. The requester has been notified.'),
    ).toBeVisible()

    const decision = calls.find(
      (call) => call.method === 'PATCH' && call.path === '/bookings/4/decision',
    )
    expect(decision?.body).toEqual({
      decision: 'approve',
      reason: 'Training verified and the slot is free.',
    })
  })

  test('an approved booking can be checked in with a condition report', async ({
    page,
  }) => {
    const { calls } = await mockApi(page, { user: memberUser })
    await page.goto('/my-bookings/1')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Confocal Microscope' }),
    ).toBeVisible()
    await expect(
      page.getByText(/no condition report has been recorded/i),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Check in' }).click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Check in' }),
    ).toBeVisible()

    await dialog.getByText('Fair', { exact: true }).click()
    await dialog.getByRole('textbox').fill('One objective cap is missing.')
    await dialog.getByRole('button', { name: 'Record check-in' }).click()

    await expect(
      page.getByText('Checked in with a fair condition report.'),
    ).toBeVisible()

    const checkIn = calls.find(
      (call) => call.method === 'POST' && call.path === '/bookings/1/checkin',
    )
    expect(checkIn?.body).toEqual({
      condition: 'fair',
      notes: 'One objective cap is missing.',
    })
  })

  test('a checked-in booking can be returned and flags a late return', async ({
    page,
  }) => {
    const { calls } = await mockApi(page, { user: memberUser })
    await page.goto('/my-bookings/2')

    await expect(page.getByText('Check-in report')).toBeVisible()
    await expect(page.getByText('Excellent').first()).toBeVisible()
    await expect(
      page.getByText('All lenses present, stage clean.'),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Return items' }).click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Return this resource' }),
    ).toBeVisible()

    await dialog.getByText('Damaged', { exact: true }).click()
    await dialog.getByRole('button', { name: 'Record return' }).click()

    await expect(page.getByText(/flagged as late/i)).toBeVisible()

    const returned = calls.find(
      (call) => call.method === 'POST' && call.path === '/bookings/2/return',
    )
    expect(returned?.body).toEqual({ condition: 'damaged' })
  })

  test('check-in is not offered once a booking is checked in', async ({
    page,
  }) => {
    await mockApi(page, { user: memberUser })
    await page.goto('/my-bookings/2')

    await expect(page.getByRole('button', { name: 'Check in' })).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Return items' }),
    ).toBeVisible()
  })
})
