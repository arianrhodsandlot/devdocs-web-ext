/* global BUILD_MODE */
import browser from 'webextension-polyfill'

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const isTest = BUILD_MODE === 'test'

const isContextMenuEnabled = typeof browser.browserAction.openPopup === 'function'

export { isProd, isDev, isTest, isContextMenuEnabled }
