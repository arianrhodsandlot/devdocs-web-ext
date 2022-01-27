/* global BUILD_MODE */
import browser from 'webextension-polyfill'
if (typeof window === 'object') window.browser = browser

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const isTest = BUILD_MODE === 'test'

const isContextMenuEnabled = false

export { isProd, isDev, isTest, isContextMenuEnabled }
