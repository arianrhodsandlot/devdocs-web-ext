import '@babel/polyfill'
import browser from 'webextension-polyfill'
import Raven from 'raven-js'
import Docs from './docs'

async function getDocNames () {
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  const cookie = await browser.cookies.get({url: 'http://devdocs.io', name: 'docs'})
  const categories = cookie && cookie.value ? cookie.value.split('/') : defaultCategories
  return categories
}

async function addMessageListener () {
  const docs = new Docs(await getDocNames())

  async function searchEntry ({query}) {
    const results = await docs.searchEntries(query)

    return results.length ? {
      status: 'success',
      content: results
    } : {
      status: 'fail',
      message: 'No matched results.'
    }
  }

  async function searchDocName ({query}) {
    const doc = await docs.attemptToMatchOneDoc(query)
    return doc ? doc.name : ''
  }

  browser.cookies.onChanged.addListener(({cookie: {domain, name}}) => {
    if (!(['devdocs.io', '.devdocs.io'].includes(domain))) return
    if (name !== 'docs') return
    docs.debouncedReload()
  })

  browser.runtime.onMessage.addListener(async function ({action, payload}) {
    switch (action) {
      case 'search-entry':
        return await searchEntry(payload)
      case 'match-best-doc-name':
        return await searchDocName(payload)
      default:
        return null
    }
  })
}

addMessageListener()

if (!localStorage.install_time || !localStorage.version) {
  browser.tabs.create({
    url: 'dist/options.html#welcome'
  })
}

Object.assign(localStorage, {
  version: '0.1.8',
  install_time: Date.now(),
  theme: 'light',
  width: 600,
  height: 600
})

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}
