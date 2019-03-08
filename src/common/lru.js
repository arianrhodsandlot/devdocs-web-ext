import { StorageLRU, asyncify } from 'storage-lru'

const lru = new StorageLRU(asyncify(localStorage))

export function lruGetItem (key) {
  return new Promise(function (resolve) {
    lru.getItem(key, { json: false }, function (error, value) {
      resolve(error ? '' : value)
    })
  })
}

export function lruSetItem (key, value) {
  return new Promise(function (resolve, reject) {
    lru.setItem(key, value, {
      json: false,
      cacheControl: `max-age=${30/* day */ * 24/* hour */ * 60/* min */ * 60/* sec */}`
    }, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
