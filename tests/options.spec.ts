import { expect, test } from './fixtures.js'

test('update size', async ({ popupPage, optionsPage }) => {
  await optionsPage.bringToFront()
  const [widthSlider, heightSlider] = await optionsPage.locator('.slider').all()

  await widthSlider.focus()
  await widthSlider.press('ArrowRight')
  await heightSlider.focus()
  await heightSlider.press('ArrowLeft')
  await optionsPage.waitForTimeout(100)

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle' })
  const body = popupPage.locator('body')
  const size = await body.evaluate(({ offsetWidth, offsetHeight }: HTMLBodyElement) => ({
    width: offsetWidth,
    height: offsetHeight,
  }))
  expect(size).toEqual({ width: 650, height: 550 })
})

test('update theme', async ({ optionsPage, popupPage }) => {
  await optionsPage.click('input[value=dark]')
  await optionsPage.waitForTimeout(100)
  await optionsPage.reload({ waitUntil: 'networkidle' })
  expect(await optionsPage.locator('input[value=light]').isChecked()).toBe(false)
  expect(await optionsPage.locator('input[value=dark]').isChecked()).toBe(true)

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle' })
  expect(await popupPage.locator('html').getAttribute('class')).toContain(' _theme-dark')

  await optionsPage.click('input[value=light]')
  await optionsPage.waitForTimeout(100)
  await optionsPage.reload({ waitUntil: 'networkidle' })
  expect(await optionsPage.locator('input[value=light]').isChecked()).toBe(true)
  expect(await optionsPage.locator('input[value=dark]').isChecked()).toBe(false)

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle' })
  expect(await popupPage.locator('html').getAttribute('class')).not.toContain(' _theme-dark')
})
