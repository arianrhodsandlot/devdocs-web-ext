import { expect, test } from './fixtures.js'

test('update docs', async ({ context, optionsPage, popupPage }) => {
  await optionsPage.bringToFront()
  await optionsPage.click('.mdc-button')

  await context.waitForEvent('page', { predicate: (page) => page.url().includes('devdocs.io') })
  const devdocsPage = context.pages().find((page) => page.url().includes('devdocs.io'))!
  await devdocsPage.locator('._list-item._icon-angular').first().click({ force: true })
  await devdocsPage.locator('[name=angular]').click({ force: true })
  await devdocsPage.locator('[name="angular~5"]').click({ force: true })
  await devdocsPage.locator('[name=bash]').click({ force: true })
  await devdocsPage.locator('._settings-btn-save').click({ force: true })

  await popupPage.bringToFront()
  await popupPage.locator('input').focus()
  await popupPage.keyboard.type('ngif')
  await popupPage.waitForSelector('._list-item')
  const listItems = await popupPage.locator('._list-item').all()
  const [firstListItem, secondListItem] = listItems
  expect(await firstListItem.locator('._list-text').innerHTML()).toBe('NgIf')
  expect(await secondListItem.locator('._list-text').innerHTML()).toBe('NgIf')
  expect(await secondListItem.locator('._list-count').innerHTML()).toBe('5')

  await popupPage.click('input', { clickCount: 3 })
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForSelector('._splash-title')
  await popupPage.keyboard.type('b')
  await popupPage.waitForTimeout(100)
  await popupPage.keyboard.press('Tab')
  await popupPage.waitForSelector('._search-tag')
  expect(await popupPage.locator('._search-tag').innerHTML()).toBe('Bash')
})
