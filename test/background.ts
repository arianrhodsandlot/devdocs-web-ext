/* eslint-disable no-await-in-loop, ava/no-import-test-files */
import test from 'ava'
import { getTestContext, TestContext } from './helpers'

test.before(async (t) => {
  t.context = await getTestContext()
})

test('update docs', async (t) => {
  const { browser, optionPage, popupPage } = t.context as TestContext
  await optionPage.bringToFront()
  await optionPage.click('.mdc-button')

  let devdocsPage
  while (!devdocsPage) {
    await optionPage.waitFor(100)
    const pages = await browser.pages()
    devdocsPage = pages.find((p) => p.url().includes('devdocs.io'))!
  }
  await devdocsPage.waitForNavigation({ waitUntil: 'networkidle2' })
  await devdocsPage.waitForSelector('._list-item._icon-angular')
  await devdocsPage.click('._list-item._icon-angular')
  await devdocsPage.waitForSelector('[name=angular]')
  await devdocsPage.click('[name=angular]')
  await devdocsPage.click('[name="angular~5"]')
  await devdocsPage.click('[name=bash]')
  await devdocsPage.waitForSelector('._settings-btn-save')
  await devdocsPage.click('._settings-btn-save')

  await popupPage.bringToFront()
  await popupPage.focus('input')
  await popupPage.keyboard.type('ngif')
  await popupPage.waitForSelector('._list-item')
  const listItems = await popupPage.$$('._list-item')
  const [firstListItem, secondListItem] = listItems
  t.is(await firstListItem.$eval('._list-text', (e) => e.innerHTML), 'NgIf')
  t.is(await secondListItem.$eval('._list-text', (e) => e.innerHTML), 'NgIf')
  t.is(await secondListItem.$eval('._list-count', (e) => e.innerHTML), '5')

  await popupPage.click('input', { clickCount: 3 })
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForSelector('._splash-title')
  await popupPage.keyboard.type('b')
  await popupPage.waitFor(100)
  await popupPage.keyboard.press('Tab')
  await popupPage.waitForSelector('._search-tag')
  t.is(await popupPage.$eval('._search-tag', (e) => e.innerHTML), 'Bash')
})

test.after(async (t) => {
  const { browser } = t.context as TestContext
  await browser.close()
})
