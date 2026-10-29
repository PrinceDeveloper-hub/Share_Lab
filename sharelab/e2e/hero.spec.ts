import { expect, test } from '@playwright/test'

test('hero carousel advances to each of its local images', async ({ page }) => {
  await page.goto('/')

  const slides = page.getByRole('tablist', { name: 'Choose a hero slide' })
  await expect(slides.getByRole('tab')).toHaveCount(4)

  await slides.getByRole('tab', { name: /Room to experiment/ }).click()

  await expect(
    page.getByRole('heading', { name: 'Room to experiment' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', {
      name: 'Glass beakers and pipettes prepared for a research experiment',
    }),
  ).toBeVisible()
})
