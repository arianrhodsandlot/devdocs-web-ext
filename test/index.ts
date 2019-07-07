import path from 'path'
import test from 'ava'
import puppeteer from 'puppeteer'

interface TestContext {
  browser: puppeteer.Browser;
  backgroundPage: puppeteer.Page;
  optionPage: puppeteer.Page;
  popupPage: puppeteer.Page;
}

test.serial.before(async t => {
  const extensionPath = path.resolve(__dirname, '../extension')
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })
  const targets = await browser.targets()
  const backgroundPage = await targets.find(target => target.type() === 'background_page')!.page()
  await backgroundPage.waitFor(5000)
  const [, optionPage, popupPage] = await browser.pages()

  const context: TestContext = {
    browser,
    backgroundPage,
    optionPage,
    popupPage
  }
  t.context = context
})

test.serial.beforeEach(async t => {
  const { popupPage } = t.context as TestContext
  await popupPage.bringToFront()
  await popupPage.focus('input')
  await popupPage.click('input', { clickCount: 3 })
  await popupPage.keyboard.press('Backspace')
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForSelector('._splash-title', { timeout: 100 })
})

test.serial('search and navigate in results', async t => {
  async function getClassNames (element: puppeteer.ElementHandle<Element>) {
    const jsHandle = await element.getProperty('className')
    const classNames: string = await jsHandle.jsonValue()
    return classNames.split(/\s+/)
  }

  const { popupPage } = t.context as TestContext
  await popupPage.keyboard.type('a')
  await popupPage.waitForSelector('._list-item')

  const listItems = await popupPage.$$('._list-item')
  t.is(listItems.length, 50)

  const focusedListItem = await popupPage.$$('._list-item.focus')
  t.is(focusedListItem.length, 1)

  const [firstListItem, secondListItem] = listItems
  const lastListItem = listItems[listItems.length - 1]

  t.true((await getClassNames(firstListItem)).includes('focus'))
  t.false((await getClassNames(secondListItem)).includes('focus'))
  t.false((await getClassNames(lastListItem)).includes('focus'))

  await popupPage.keyboard.press('ArrowDown')
  t.false((await getClassNames(firstListItem)).includes('focus'))
  t.true((await getClassNames(secondListItem)).includes('focus'))
  t.false((await getClassNames(lastListItem)).includes('focus'))

  await popupPage.keyboard.press('ArrowUp')
  await popupPage.keyboard.press('ArrowUp')
  t.false((await getClassNames(firstListItem)).includes('focus'))
  t.false((await getClassNames(secondListItem)).includes('focus'))
  t.true((await getClassNames(lastListItem)).includes('focus'))
})

test.serial('search in a certain doc', async t => {
  const { popupPage } = t.context as TestContext
  await popupPage.keyboard.type('c')
  await popupPage.keyboard.press('Tab')
  await popupPage.waitForSelector('._search-tag')
  t.is(await popupPage.$eval('._search-tag', e => e.innerHTML), 'CSS')

  await popupPage.keyboard.type('bxs')
  await popupPage.waitForSelector('._list-item')
  const firstLiteItemText = await popupPage.$eval('._list-item', e => (e as HTMLDivElement).innerText)
  t.is(firstLiteItemText, 'box-shadow')
})

test.serial('update size', async t => {
  const { optionPage, popupPage } = t.context as TestContext
  await optionPage.bringToFront()
  const thumbs = await optionPage.$$('.mdc-slider__thumb-container')

  for (const thumb of thumbs) {
    const boundingBox = await thumb!.boundingBox()
    const thumbX = boundingBox!.x + boundingBox!.width / 2
    const thumbY = boundingBox!.y + boundingBox!.height / 2
    await optionPage.mouse.move(thumbX, thumbY)
    await optionPage.mouse.down()
    await optionPage.mouse.move(thumbX - 100, thumbY)
    await optionPage.mouse.up()
    await optionPage.waitFor(100)
  }

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle2' })
  const size = {
    width: await popupPage.$eval('body', e => (e as HTMLBodyElement).offsetWidth),
    height: await popupPage.$eval('body', e => (e as HTMLBodyElement).offsetHeight)
  }
  t.deepEqual(size, { width: 450, height: 450 })
})

test.serial('update theme', async t => {
  function isChecked (e: Element) {
    return (e as HTMLInputElement).checked
  }

  const { optionPage, popupPage } = t.context as TestContext

  t.false(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))

  await optionPage.bringToFront()
  t.true(await optionPage.$eval('input[value=light]', isChecked))
  t.false(await optionPage.$eval('input[value=dark]', isChecked))

  await optionPage.click('input[value=dark]')
  await optionPage.waitFor(100)
  await optionPage.reload({ waitUntil: 'networkidle2' })
  t.false(await optionPage.$eval('input[value=light]', isChecked))
  t.true(await optionPage.$eval('input[value=dark]', isChecked))

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle2' })
  t.true(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))
})

test.serial('content', async t => {
  const { popupPage } = t.context as TestContext
  await popupPage.keyboard.type('a')
  await popupPage.waitForSelector('._list-item.focus')
  await popupPage.keyboard.press('Enter')
  t.truthy(await popupPage.waitForSelector('._page._mdn', { timeout: 1000 }))
  t.falsy(await popupPage.$eval('._page', e => e.scrollTop))

  await popupPage.keyboard.press('Space')
  await popupPage.waitFor(500)
  t.truthy(await popupPage.$eval('._page', e => e.scrollTop))

  await popupPage.keyboard.down('Shift')
  await popupPage.keyboard.press('Space')
  await popupPage.keyboard.up('Shift')
  await popupPage.waitFor(500)
  t.falsy(await popupPage.$eval('._page', e => e.scrollTop))
})

test.serial('update docs', async t => {
  const { browser, backgroundPage, optionPage, popupPage } = t.context as TestContext
  await optionPage.bringToFront()
  await optionPage.click('.mdc-button')
  await optionPage.waitFor(2000)

  const pages = await browser.pages()
  const devdocsPage = pages.find(p => p.url().includes('devdocs.io'))!
  await devdocsPage.waitForNavigation({ waitUntil: 'networkidle2' })
  await devdocsPage.waitForSelector('._list-item._icon-angular')
  await devdocsPage.click('._list-item._icon-angular')
  await devdocsPage.waitForSelector('[name=angular]')
  await devdocsPage.click('[name=angular]')
  await devdocsPage.click('[name="angular~5"]')
  await devdocsPage.click('[name=babel]')
  await devdocsPage.waitForSelector('._settings-btn-save')
  await devdocsPage.click('._settings-btn-save')

  await backgroundPage.waitFor(1000)

  await popupPage.bringToFront()
  await popupPage.focus('input')
  await popupPage.keyboard.type('ngif')
  await popupPage.waitForSelector('._list-item')
  const listItems = await popupPage.$$('._list-item')
  const [firstListItem, secondListItem] = listItems
  t.is(await firstListItem.$eval('._list-text', e => e.innerHTML), 'NgIf')
  t.is(await secondListItem.$eval('._list-text', e => e.innerHTML), 'NgIf')
  t.is(await secondListItem.$eval('._list-count', e => e.innerHTML), '5')

  await popupPage.click('input', { clickCount: 3 })
  await popupPage.keyboard.press('Backspace')
  await popupPage.waitForSelector('._splash-title', { timeout: 100 })
  await popupPage.keyboard.type('b')
  await popupPage.keyboard.press('Tab')
  await popupPage.waitForSelector('._search-tag')
  t.is(await popupPage.$eval('._search-tag', e => e.innerHTML), 'Babel')
})

test.serial.after(async t => {
  const { browser } = t.context as TestContext
  await browser.close()
})
