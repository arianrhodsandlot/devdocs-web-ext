import browser from 'webextension-polyfill'
import Raven from 'raven-js'
import { isProd } from '../common/env'
import storage from '../common/storage'
import Docs from './docs'

async function getDocNames () {
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  const cookie = await browser.cookies.get({url: 'http://devdocs.io', name: 'docs'})
  const categories = cookie && cookie.value ? cookie.value.split('/') : defaultCategories
  return categories
}

async function addMessageListener () {
  const docs = new Docs(await getDocNames())

  async function searchEntry ({query, scope}) {
    if (!query && !scope) return null
    if (!scope) return await docs.searchEntries(query)
    const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
    if (!doc) return []
    if (!query) {
      return doc.entries.slice(0, 50)
    }
    return await docs.searchEntriesInDoc(query, doc)
  }

  async function autoCompeleteEnabledDoc ({scope}) {
    const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
    return doc
  }

  async function getContentDoc ({scope}) {
    const doc = await docs.attemptToMatchOneDocInAllDocs(scope)
    return doc
  }

  browser.cookies.onChanged.addListener(async ({cookie: {domain, name}}) => {
    if (!(['devdocs.io', '.devdocs.io'].includes(domain))) return
    if (name !== 'docs') return
    docs.debouncedReload(await getDocNames())
  })

  browser.runtime.onMessage.addListener(async ({action, payload}) => {
    if (!docs.ready) {
      await docs.reload(await getDocNames())
    }

    switch (action) {
      case 'search-entry':
        const entries = await searchEntry(payload)
        return { status: 'success', content: entries }
      case 'auto-compelete-enabled-doc':
        return await autoCompeleteEnabledDoc(payload)
      case 'get-content-doc':
        return await getContentDoc(payload)
      default:
        return null
    }
  })
}

addMessageListener()

async function initializeOptions () {
  const defaultOptions = {
    theme: 'light',
    width: 600,
    height: 600
  }

  const options = {}
  for (const option in defaultOptions) {
    const {[option]: previousValue} = await storage.get(option)
    const legacyValue = localStorage.getItem(option)
    const value = previousValue || legacyValue
    const defaultValue = defaultOptions[option]
    options[option] = value || defaultValue
    localStorage.removeItem(option)
  }
  storage.set(options)
}

initializeOptions()

if (isProd) {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
} else {
  browser.browserAction.setBadgeBackgroundColor({ color: 'white' })
  browser.browserAction.setBadgeText({ text: '🚧' })
}
