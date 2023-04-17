import { expect, test } from './fixtures.js'

test.beforeEach(async ({ popupPage }) => {
  await popupPage.bringToFront()
  await popupPage.focus('input')
  await popupPage.click('input', { clickCount: 3 })
  await popupPage.waitForTimeout(100)
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForTimeout(100)
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForSelector('._splash-title')
})

test('search and navigate in results', async ({ popupPage }) => {
  await popupPage.keyboard.type('a')
  await popupPage.waitForSelector('._list-item')

  const listItems = popupPage.locator('._list-item')
  expect(await listItems.count()).toBe(50)

  const focusedListItem = popupPage.locator('._list-item.focus')
  expect(await focusedListItem.count()).toBe(1)

  const firstListItem = listItems.first()
  const secondListItem = listItems.nth(1)
  const lastListItem = listItems.last()

  expect(await firstListItem.getAttribute('class')).toContain('focus')
  expect(await secondListItem.getAttribute('class')).not.toContain('focus')
  expect(await lastListItem.getAttribute('class')).not.toContain('focus')

  await popupPage.keyboard.press('ArrowDown')
  expect(await firstListItem.getAttribute('class')).not.toContain('focus')
  expect(await secondListItem.getAttribute('class')).toContain('focus')
  expect(await lastListItem.getAttribute('class')).not.toContain('focus')

  await popupPage.keyboard.press('ArrowUp')
  await popupPage.keyboard.press('ArrowUp')
  expect(await firstListItem.getAttribute('class')).not.toContain('focus')
  expect(await secondListItem.getAttribute('class')).not.toContain('focus')
  expect(await lastListItem.getAttribute('class')).toContain('focus')
})

test('search in a certain doc', async ({ popupPage }) => {
  await popupPage.keyboard.type('c')
  await popupPage.waitForTimeout(100)
  await popupPage.keyboard.press('Tab')
  expect(await popupPage.locator('._search-tag').innerHTML()).toBe('CSS')

  await popupPage.keyboard.type('bxs')
  await popupPage.waitForTimeout(100)
  expect(await popupPage.locator('._list-item').first().textContent()).toBe('box-shadow')
})

test('content display and scroll', async ({ popupPage }) => {
  await popupPage.keyboard.type('a')
  await popupPage.locator('._list-item.focus').waitFor()
  await popupPage.keyboard.press('Enter')
  expect(await popupPage.locator('._page._mdn').evaluate(({ scrollTop }) => scrollTop)).toBe(0)

  await popupPage.keyboard.press('Space')
  await popupPage.waitForTimeout(500)
  expect(await popupPage.locator('._page._mdn').evaluate(({ scrollTop }) => scrollTop)).toBeGreaterThan(0)

  await popupPage.keyboard.down('Shift')
  await popupPage.keyboard.press('Space')
  await popupPage.keyboard.up('Shift')
  await popupPage.waitForTimeout(500)
  expect(await popupPage.locator('._page._mdn').evaluate(({ scrollTop }) => scrollTop)).toBe(0)
})

test('docs content syntax highlighting', async ({ context, optionsPage, popupPage }) => {
  await optionsPage.bringToFront()
  await optionsPage.click('.mdc-button')

  await context.waitForEvent('page', { predicate: (page) => page.url().includes('devdocs.io') })
  const devdocsPage = context.pages().find((page) => page.url().includes('devdocs.io'))!
  await devdocsPage.locator('[name=rust]').click({ force: true })
  await devdocsPage.locator('._settings-btn-save').click({ force: true })

  await popupPage.bringToFront()
  await popupPage.locator('input').focus()
  await popupPage.keyboard.type('rust')
  await popupPage.keyboard.press('Tab')
  await popupPage.waitForSelector('._search-tag')
  await popupPage.keyboard.type('helloworld')
  await popupPage.getByText('Hello, World!').waitFor()
  await popupPage.keyboard.press('Enter')

  const codeElement = popupPage.locator('[data-language="rust"]').first()
  const [textContent, innerHTML] = await Promise.all([codeElement.textContent(), codeElement.innerHTML()])
  expect(textContent).not.toBe(innerHTML)
})
