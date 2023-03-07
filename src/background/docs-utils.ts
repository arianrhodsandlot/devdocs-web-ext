import _ from 'lodash'
import browser from 'webextension-polyfill'
import { log } from '../common/log'
import { Docs } from './docs'

const defaultDocNames = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
async function getDocNames() {
  const cookie =
    (await browser.cookies.get({ url: 'https://devdocs.io', name: 'docs' })) ||
    (await browser.cookies.get({ url: 'http://devdocs.io', name: 'docs' }))
  return cookie && cookie.value ? cookie.value.split('/') : defaultDocNames
}

function isValidCache(cache: unknown) {
  for (const key of ['allDocs', 'docNames', 'docs']) {
    if (_.size(_.get(cache, key)) === 0) {
      return false
    }
  }
  return true
}

const docs = new Docs()
type Cache = ReturnType<typeof docs.dump>
const memoryCache: Record<string, Cache> = {}
export async function updateDocs() {
  const docNames = await getDocNames()
  docs.docNames = docNames

  if (docs.status === 'pending') {
    await docs.sync()
    return
  }
  if (docs.status === 'ready') {
    const cacheKey = JSON.stringify(docNames)
    let cache = memoryCache[cacheKey]

    if (!isValidCache(cache)) {
      const storage = await browser.storage.local.get(cacheKey)
      cache = storage[cacheKey]
    }
    if (isValidCache(cache)) {
      log('[background/docs-utils] cache exists, cacheKey:', cacheKey, 'cache', cache)
      docs.load(cache)
    } else {
      log('[background/docs-utils] cache not exists, cacheKey:', cacheKey)
      await docs.sync()
    }

    const newCache = docs.dump()
    memoryCache[cacheKey] = newCache
  }
}

export async function getDocs() {
  await updateDocs()
  return docs
}
