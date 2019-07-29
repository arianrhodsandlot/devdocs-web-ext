import browser from 'webextension-polyfill'
import i18n from '../options/i18n'
import storage from './storage'
import { isContextMenuEnabled } from './env'

let enabled = false

function enableContextMenu () {
  if (!isContextMenuEnabled) {
    return
  }
  if (enabled) {
    return
  }
  browser.contextMenus.create({
    id: 'devdocs-web-ext-context-menu',
    title: i18n('contextMenuTemplate'),
    contexts: ['selection'],
    async onclick (e) {
      const query = (e.selectionText || '').trim().slice(0, 20)
      if (query) {
        localStorage.setItem('scope', '')
        localStorage.setItem('query', query)
        localStorage.setItem('docName', '')
        localStorage.setItem('lastPopupPath', `/search?query=${encodeURIComponent(query)}`)
      }
      await browser.browserAction.openPopup()
    }
  })
  enabled = true
}

async function disableContextMenu () {
  await browser.contextMenus.removeAll()
  enabled = false
}

export async function setupContextMenu () {
  const { showContextMenu } = await storage.get()
  if (showContextMenu) {
    enableContextMenu()
  } else {
    await disableContextMenu()
  }
}
