import browser from 'webextension-polyfill'
import { isDev, isTest } from '../common/env'
import { storage } from '../common/storage'
import { defaultOptions } from '../common/default-options'
import { log } from '../common/log'
import { messageHandlers, errorHandler } from './message'
import { updateDocs } from './docs-utils'

async function initializeOptions () {
  const options: Record<string, string | number> = {}
  for (const option in defaultOptions) {
    if (Object.prototype.hasOwnProperty.call(defaultOptions, option)) {
      // eslint-disable-next-line no-await-in-loop
      const { [option]: previousValue } = await storage.get(option)
      const value = previousValue
      const defaultValue = (defaultOptions as Record<string, string | number | boolean>)[option]
      options[option] = value || defaultValue
    }
  }
  storage.set(options)
}

function initializeListeners () {
  browser.cookies.onChanged.addListener(({ cookie }) => {
    if (!['devdocs.io', '.devdocs.io'].includes(cookie.domain)) return
    if (cookie.name !== 'docs') return
    updateDocs()
  })

  browser.runtime.onMessage.addListener(async (message) => {
    log('[background] message recived:', message)

    const messageHandler = messageHandlers[message.action]
    if (messageHandler) {
      const response = await messageHandler(message.payload)
      log('[background] sending response:', response)
      return response
    }

    const response = errorHandler({ error: { message: 'illegal action' } })
    log('[background] sending response:', response)
    return response
  })
}

function main () {
  initializeOptions()
  initializeListeners()

  if (isDev) {
    browser.action.setBadgeBackgroundColor({ color: 'white' })
    browser.action.setBadgeText({ text: '🚧' })
  }

  const shouldOpenTabsForTest = isTest
  if (shouldOpenTabsForTest) {
    browser.tabs.create({ url: 'options.html' })
    browser.tabs.create({ url: 'popup.html' })
  }
}

main()
