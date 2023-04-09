import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { type BrowserContext, type Page, test as base, chromium } from '@playwright/test'
import { fs } from 'zx'

const pathToExtension = path.resolve(fileURLToPath(import.meta.url), '../../dist')
const tmpdir = path.join(fileURLToPath(import.meta.url), '../../tmp')
const extensionManifest = path.join(pathToExtension, 'manifest.json')

async function getExtensionPageFilenames() {
  const manifestFileContent = await fs.readFile(extensionManifest, 'utf8')
  const manifest = JSON.parse(manifestFileContent)
  const popup: string = manifest.action.default_popup
  const options: string = manifest.options_ui.page
  return { popup, options }
}

export const test = base.extend<{
  userDataDir: string
  context: BrowserContext
  extensionId: string
  popupPage: Page
  optionsPage: Page
}>({
  userDataDir({}, use) {
    const userDataDir = path.join(tmpdir, `user-data-dir-test-${Date.now()}`)
    use(userDataDir)
  },

  async context({ userDataDir }, use) {
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        ...(process.env.PWDEBUG ? [] : ['--headless=new']),
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--start-maximized',
      ],
    })
    await use(context)
    await context.close()
    await fs.remove(userDataDir)
  },

  async extensionId({ context }, use) {
    let [background] = context.serviceWorkers()
    background ??= await context.waitForEvent('serviceworker')
    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  },

  async popupPage({ context, extensionId }, use) {
    const popupPage = await context.newPage()
    const { popup } = await getExtensionPageFilenames()
    await popupPage.goto(`chrome-extension://${extensionId}/${popup}`)
    use(popupPage)
  },

  async optionsPage({ context, extensionId }, use) {
    const optionsPage = await context.newPage()
    const { options } = await getExtensionPageFilenames()
    await optionsPage.goto(`chrome-extension://${extensionId}/${options}`)
    use(optionsPage)
  },
})

export const { expect } = test
