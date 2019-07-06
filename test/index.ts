import path from 'path'
import test from 'ava'
import puppeteer from 'puppeteer'

interface TestContext {
  browser: puppeteer.Browser;
  backgroundPage: puppeteer.Page;
  optionPage: puppeteer.Page;
  popupPage: puppeteer.Page;
}

test.before(async t => {
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
  sleep(1000)
  const [, optionPage, popupPage] = await browser.pages()

  const context: TestContext = {
    browser,
    backgroundPage,
    optionPage,
    popupPage
  }
  t.context = context
})

test('search', async t => {
  const { popupPage } = t.context as TestContext
  popupPage.bringToFront()
  t.assert(true)
})

test('search in a certain doc', async t => {
  const { popupPage } = t.context as TestContext
  popupPage.bringToFront()
  t.assert(true)
})

test('update size', async t => {
  const { popupPage } = t.context as TestContext
  popupPage.bringToFront()
  t.assert(true)
})

test('update theme', async t => {
  const { popupPage } = t.context as TestContext
  popupPage.bringToFront()
  t.assert(true)
})

test('update docs', async t => {
  const { popupPage } = t.context as TestContext
  popupPage.bringToFront()
  t.assert(true)
})

test.after(async t => {
  const { browser } = t.context as TestContext
  browser.close()
})

function sleep (n: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, n)
  }) as Promise<void>
}
