import path from 'path'
import puppeteer from 'puppeteer'

async function getTestContext () {
  const extensionPath = path.resolve(__dirname, '../../extension')
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })
  const targets = await browser.targets()
  const backgroundPage = await targets.find((target) => target.type() === 'background_page')!.page()
  await backgroundPage.waitFor(5000)
  const pages = await browser.pages()
  const optionPage = pages.find((p) => p.url().includes('/options.html'))!
  const popupPage = pages.find((p) => p.url().includes('/popup.html'))!

  const context = {
    browser,
    backgroundPage,
    optionPage,
    popupPage
  }
  return context
}

type Unpromisify<T> = T extends Promise<infer U> ? U : T

export type TestContext = Unpromisify<ReturnType<typeof getTestContext>>
export { getTestContext }
