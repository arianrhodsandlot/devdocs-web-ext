import path from 'path'
import test from 'ava'
import puppeteer from 'puppeteer'

test('hello', async (t) => {
  const CRX_PATH = path.resolve(__dirname, '../extension')
  console.log(CRX_PATH)
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent'
    ]
  })
  await sleep(10000000)
  // await browser.close()
  t.assert(browser)
})

function sleep (n: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, n)
  })
}
