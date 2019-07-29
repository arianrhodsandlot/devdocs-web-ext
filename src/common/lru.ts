import { StorageLRU, asyncify } from 'storage-lru'

const lru = new StorageLRU(asyncify(localStorage))

export function lruGetItem (key: string) {
  return new Promise((resolve) => {
    lru.getItem(key, { json: false }, (error: object, value: string) => {
      resolve(error ? '' : value)
    })
  }) as Promise<string>
}

export function lruSetItem (key: string, value: string) {
  return new Promise((resolve, reject) => {
    lru.setItem(key, value, {
      json: false,
      cacheControl: `max-age=${30/* day */ * 24/* hour */ * 60/* min */ * 60/* sec */}`
    }, (error: object) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
