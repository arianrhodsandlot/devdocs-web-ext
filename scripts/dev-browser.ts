import os from 'node:os'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { fs } from 'zx'

async function waitForFile(file: string) {
  while (!(await fs.pathExists(file))) {
    await setTimeout(100)
  }
}

const pathToExtension = path.resolve(fileURLToPath(import.meta.url), '../../dist')
const tmpdir = path.resolve(fileURLToPath(import.meta.url), '../../temp')
const userDataDir = path.join(tmpdir, `${Date.now()}`)
const extensionManifest = path.join(pathToExtension, 'manifest.json')

await waitForFile(extensionManifest)
const context = await chromium.launchPersistentContext(userDataDir, {
  args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`, '--start-maximized'],
  devtools: true,
  // eslint-disable-next-line unicorn/no-null
  viewport: null,
})

async function getExtensionPageFilenames() {
  const manifestFileContent = await fs.readFile(extensionManifest, 'utf8')
  const manifest = JSON.parse(manifestFileContent)
  const popup: string = manifest.action.default_popup
  const options: string = manifest.options_ui.page
  return { popup, options }
}

let [background] = context.serviceWorkers()
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
