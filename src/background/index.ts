import browser from 'webextension-polyfill'
import Raven from 'raven-js'
import { isProd, isDev, isTest } from '../common/env'
import storage from '../common/storage'
import i18n from '../options/i18n'
import Docs from './docs'

async function getDocNames () {
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  const cookie = await browser.cookies.get({ url: 'http://devdocs.io', name: 'docs' })
  const categories = cookie && cookie.value ? cookie.value.split('/') : defaultCategories
  return categories
}

async function addMessageListener () {
  const docs = new Docs(await getDocNames())

  async function searchEntry ({ query, scope }: { query: string; scope: string }) {
    if (!query && !scope) return null
    if (!scope) {
      const entries = await docs.searchEntries(query)
      return entries
    }
    const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
    if (!doc) return []
    if (!query) {
      return doc.entries.slice(0, 50)
    }
    const entries = await Docs.searchEntriesInDoc(query, doc)
    return entries
  }

  async function autoCompeleteEnabledDoc ({ scope }: { scope: string }) {
    const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
    return doc
  }

  async function getContentDoc ({ scope }: { scope: string }) {
    const doc = await docs.attemptToMatchOneDocInAllDocs(scope)
    return doc
  }

  browser.cookies.onChanged.addListener(async ({ cookie: { domain, name } }) => {
    if (!(['devdocs.io', '.devdocs.io'].includes(domain))) return
    if (name !== 'docs') return
    const docNames = await getDocNames()
    docs.reload(docNames)
  })

  browser.runtime.onMessage.addListener(async ({ action, payload }) => {
    if (!docs.ready) {
      await docs.reload(await getDocNames())
    }

    let result: object | null = null

    switch (action) {
      case 'search-entry':
        result = { status: 'success', content: await searchEntry(payload) }
        break
      case 'auto-compelete-enabled-doc':
        result = await autoCompeleteEnabledDoc(payload)
        break
      case 'get-content-doc':
        result = await getContentDoc(payload)
        break
    }

    return result
  })
}

addMessageListener()

async function initializeOptions () {
  const defaultOptions: Record<string, string | number> = {
    theme: 'light',
    width: 600,
    height: 600
  }

  const options: Record<string, string | number> = {}
  for (const option in defaultOptions) {
    const { [option]: previousValue } = await storage.get(option)
    const legacyValue = localStorage.getItem(option)
    const value = previousValue || legacyValue
    const defaultValue = defaultOptions[option]
    options[option] = value || defaultValue
    localStorage.removeItem(option)
  }
  storage.set(options)
}

initializeOptions()

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

if (isProd) {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}

if (isDev) {
  browser.browserAction.setBadgeBackgroundColor({ color: 'white' })
  browser.browserAction.setBadgeText({ text: '🚧' })
}

if (isDev || isTest) {
  (async () => {
    browser.tabs.create({
      url: 'dist/options.html'
    })
    browser.tabs.create({
      url: 'dist/popup.html'
    })
  })()
}
