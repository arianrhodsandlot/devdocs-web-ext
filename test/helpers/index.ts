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
  const optionTarget = await browser.waitForTarget((target) => target.url().includes('/options.html'))!
  const popupTarget = await browser.waitForTarget((target) => target.url().includes('/popup.html'))!
  const optionPage = (await optionTarget.page())!
  const popupPage = (await popupTarget.page())!
  await Promise.all([optionPage.waitForNetworkIdle(), popupPage.waitForNetworkIdle()])

  const context = {
    browser, optionPage, popupPage
  }
  return context
}

type Unpromisify<T> = T extends Promise<infer U> ? U : T

export type TestContext = Unpromisify<ReturnType<typeof getTestContext>>
export { getTestContext }
