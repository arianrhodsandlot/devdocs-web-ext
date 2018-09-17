import '@babel/polyfill'
import browser from 'webextension-polyfill'
import debounce from 'lodash/debounce'
import Raven from 'raven-js'
import Searcher from '../vendor/devdocs/assets/javascripts/app/searcher.coffee'

const getCategories = async function () {
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  const cookie = await browser.cookies.get({url: 'http://devdocs.io', name: 'docs'})
  const categories = cookie && cookie.value ? cookie.value.split('/') : defaultCategories
  return categories
}

const getExtendedEntries = function (category) {
  const categoryUrl = `http://docs.devdocs.io/${category}/index.json`
  return fetch(categoryUrl)
    .then((res) => res.text())
    .then((text) => {
      const {entries} = JSON.parse(text)
      const extendedEntries = entries.map((entry) => ({...entry, category}))
      return extendedEntries
    })
}

const flatten = function (list) {
  return list.reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])
}

let search
const updateSearchFn = debounce(async function () {
  const categories = await getCategories()
  const groupedEntries = await Promise.all(categories.map(getExtendedEntries))
  const allEntries = flatten(groupedEntries)
  search = function search (q) {
    return new Promise((resolve) => {
      const searcher = new Searcher()
      const attr = 'name'
      searcher.on('results', (results) => {
        resolve(results)
      })
      searcher.find(allEntries, attr, q)
    })
  }
}, 100)

browser.cookies.onChanged.addListener(({cookie: {domain, name}}) => {
  if (!(['devdocs.io', '.devdocs.io'].includes(domain))) return
  if (name !== 'docs') return
  updateSearchFn()
})

browser.runtime.onMessage.addListener(async function ({action, payload}) {
  switch (action) {
    case 'search':
      return await searchEventListener(payload)
    case 'search-category':
      return await searchCategoryEventListener(payload)
    default:
      return null
  }
})

async function searchEventListener ({query}) {
  if (!search) {
    try {
      await updateSearchFn()
    } catch (e) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        return {
          status: 'fail',
          message: `Failed to get contents from docs.devdocs.io. Please try later.`
        }
      }
    }
  }

  const results = await search(query)

  return results.length ? {
    status: 'success',
    content: results
  } : {
    status: 'fail',
    message: 'No matched results.'
  }
}

async function searchCategoryEventListener ({query}) {
  const categories = await getCategories()
  return categories[0]
}

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

updateSearchFn()

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}
