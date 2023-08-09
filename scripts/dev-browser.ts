import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { fs } from 'zx'

async function waitForFile(file: string) {
  while (!(await fs.pathExists(file))) {
    await setTimeout(100)
  }
}

const pathToExtension = path.resolve(fileURLToPath(import.meta.url), '../../dist')
const tmpdir = path.resolve(fileURLToPath(import.meta.url), '../../tmp')
const userDataDir = path.join(tmpdir, 'user-data-dir-dev')
const extensionManifest = path.join(pathToExtension, 'manifest.json')

await waitForFile(extensionManifest)
const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  devtools: true,

  viewport: null,
  args: [
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
    '--start-maximized',
    '--lang=en-US',
  ],
})

async function getExtensionPageFilenames() {
  const manifestFileContent = await fs.readFile(extensionManifest, 'utf8')
  const manifest = JSON.parse(manifestFileContent)
  const popup: string = manifest.action.default_popup
  const options: string = manifest.options_ui.page
  return { popup, options }
}

let [background] = context.serviceWorkers()
try {
  background ??= await context.waitForEvent('serviceworker')
  const extensionId = background.url().split('/')[2]
  const popupPage = await context.newPage()
  const { popup } = await getExtensionPageFilenames()
  await popupPage.goto(`chrome-extension://${extensionId}/${popup}`)
  const optionsPage = await context.newPage()
  const { options } = await getExtensionPageFilenames()
  await optionsPage.goto(`chrome-extension://${extensionId}/${options}`)
  await context
    .pages()
    .find((page) => page.url() === 'about:blank')
    ?.close()
} catch (error) {
  console.error(error)
}
