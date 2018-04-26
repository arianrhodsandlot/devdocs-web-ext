import '@babel/polyfill'
import browser from 'webextension-polyfill'
import sortBy from 'lodash/sortBy'
import debounce from 'lodash/debounce'
import Raven from 'raven-js'

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}

let allEntries = []

const updateAllEntries = debounce(async function () {
  allEntries = []
  const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  const cookie = await browser.cookies.get({url: 'http://devdocs.io', name: 'docs'})
  const categories = (cookie && cookie.value) ? cookie.value.split('/') : defaultCategories
  categories.forEach(async (category) => {
    const categoryUrl = `http://docs.devdocs.io/${category}/index.json`
    const res = await fetch(categoryUrl)
    const text = await res.text()
    const {entries} = JSON.parse(text)
    const extendedEntries = entries.map((entry) => ({...entry, category}))
    allEntries.push(...extendedEntries)
  })
}, 100)

const stripSpaces = function (str) {
  let words = str.trim().toLowerCase().match(/\w+/g)
  return words ? words.join('') : ''
}

const calcEntryScoreByQuery = function (entry, query) {
  const name = stripSpaces(entry.name)
  const fullName = entry.category + name
  const fuzzyRegStr = Array.from(query).reduce((prev, current)=> {
    current = /\.|\(|\)/.test(current) ? '' : (current + '.*')
    return `${prev}${current}`
  }, '.*')
  const fuzzyReg = new RegExp(fuzzyRegStr, 'i')

  if (name === query) {
    return 0
  } else if (fullName === query) {
    return 1
  } else if (name.startsWith(query)) {
    return 2
  } else if (fullName.startsWith(query)) {
    return 3
  } else if (name.includes(query)) {
    return 4
  } else if (fullName.includes(query)) {
    return 5
  } else if (fuzzyReg.test(name)) {
    return 6
  } else if (fuzzyReg.test(fullName)) {
    return 7
  }
  return NaN
}

const search = function (query) {
  query = stripSpaces(query)
  if (!query) return []

  const matchedEntries = []
  const matchedGroupedEntries = []

  for (const entry of allEntries) {
    const score = calcEntryScoreByQuery(entry, query)
    if (isNaN(score)) continue

    matchedGroupedEntries[score] = matchedGroupedEntries[score] || []
    matchedGroupedEntries[score].push({...entry, score, index: allEntries.indexOf(entry)})
  }

  for (const group of matchedGroupedEntries) {
    if (!group) continue
    matchedEntries.push(...group)
  }

  const results = sortBy(matchedEntries, ['score', 'name']).slice(0, 20)

  return results
}

browser.cookies.onChanged.addListener(({cookie: {domain, name}}) => {
  if (!(['devdocs.io', '.devdocs.io'].includes(domain))) return
  if (name !== 'docs') return
  updateAllEntries()
})

browser.runtime.onMessage.addListener((query) => {
  return search(query)
})

updateAllEntries()

if (!localStorage.install_time || !localStorage.version) {
  browser.tabs.create({
    url: 'dist/options.html#welcome'
  })
}

Object.assign(localStorage, {
  version: '0.1.7',
  install_time: Date.now(),
  theme: 'light',
  width: 600,
  height: 600
})
