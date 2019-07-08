import browser from 'webextension-polyfill'
import i18n from '../options/i18n'
import storage from './storage'

let enabled = false

async function enableContextMenu () {
  if (enabled) return
  browser.contextMenus.create({
    id: 'devdocs-web-ext-context-menu',
    title: i18n('contextMenuTemplate'),
    contexts: ['selection'],
    async onclick (e) {
      if (!e.selectionText) return
      const text = e.selectionText.slice(0, 20)
      localStorage.setItem('scope', '')
      localStorage.setItem('query', text)
      localStorage.setItem('docName', '')
      localStorage.setItem('lastPopupPath', `/search?query=${encodeURIComponent(text)}&scope=`)
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
    await enableContextMenu()
  } else {
    await disableContextMenu()
  }
}
