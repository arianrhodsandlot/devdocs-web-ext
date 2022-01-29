import browser from 'webextension-polyfill'

export const storage = browser.storage.sync || browser.storage.local
