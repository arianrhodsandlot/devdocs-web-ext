import browser from 'webextension-polyfill'
import _ from 'lodash'
import { Docs } from './docs'

const defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
async function getDocNames () {
  const cookie = await browser.cookies.get({ url: 'https://devdocs.io', name: 'docs' }) || await browser.cookies.get({ url: 'http://devdocs.io', name: 'docs' })
  const categories = cookie && cookie.value ? cookie.value.split('/') : defaultCategories
  return categories
}

function isValidCache (cache: unknown) {
  for (const key of ['allDocs', 'docNames', 'docs']) {
    if (_.size(_.get(cache, key)) === 0) {
      return false
    }
  }
  return true
}

const docs = new Docs()
export async function updateDocs () {
  const docNames = await getDocNames()
  docs.docNames = docNames

  if (docs.status === 'pending') {
    await docs.sync()
    return
  }

  if (docs.status === 'ready') {
    const cacheKey = JSON.stringify(docNames)
    const { [cacheKey]: cache } = await browser.storage.local.get(cacheKey)
    if (isValidCache(cache)) {
      console.log('[background/docs-utils] cache exists, cacheKey:', cacheKey, 'cache', cache)
      docs.load(cache)
    } else {
      console.log('[background/docs-utils] cache not exists, cacheKey:', cacheKey)
      await docs.sync()
    }

    await browser.storage.local.set({ [cacheKey]: docs.dump() })
  }
}

export async function getDocs () {
  await updateDocs()
  return docs
}
