import os from 'node:os'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { argv, fs } from 'zx'

async function waitForFile(file: string) {
  while (!(await fs.pathExists(file))) {
    await setTimeout(100)
  }
}

const pathToExtension = path.resolve(fileURLToPath(import.meta.url), '../../dist')
const tmpdir = path.join(os.tmpdir(), 'devdocs-web-ext')
const extensionManifest = path.join(pathToExtension, 'manifest.json')

if (argv.clean) {
  await Promise.all([fs.remove(pathToExtension), fs.remove(tmpdir)])
} else {
  await waitForFile(extensionManifest)
  await chromium.launchPersistentContext(tmpdir, {
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--start-maximized',
    ],
    devtools: true,
    // eslint-disable-next-line unicorn/no-null
    viewport: null,
  })
}
