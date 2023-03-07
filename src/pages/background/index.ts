import browser from 'webextension-polyfill'
import { defaultOptions } from '../../lib/default-options'
import { isDev, isTest } from '../../lib/env'
import { log } from '../../lib/log'
import { errorHandler, messageHandlers } from '../../lib/message-handlers'
import { storage } from '../../lib/storage'
import { updateDocs } from './lib/docs-utils'

async function initializeOptions() {
  const options: Record<string, string | number> = {}
  for (const option in defaultOptions) {
    if (Object.prototype.hasOwnProperty.call(defaultOptions, option)) {
      const { [option]: previousValue } = await storage.get(option)
      const value = previousValue
      const defaultValue = (defaultOptions as Record<string, string | number | boolean>)[option]
      options[option] = value || defaultValue
    }
  }
  storage.set(options)
}

function initializeListeners() {
  browser.cookies.onChanged.addListener(({ cookie }) => {
    if (!['devdocs.io', '.devdocs.io'].includes(cookie.domain)) {
      return
    }
    if (cookie.name !== 'docs') {
      return
    }
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

  browser.runtime.onInstalled.addListener(async () => {
    await updateDocs()

    const shouldOpenTabsForTest = isTest || isDev || browser
    if (shouldOpenTabsForTest) {
      const manifest = browser.runtime.getManifest()

      browser.tabs.create({ url: manifest.options_ui?.page })
      browser.tabs.create({ url: manifest.action?.default_popup })
    }
  })
}

function main() {
  initializeOptions()
  initializeListeners()

  if (isDev) {
    browser.action.setBadgeBackgroundColor({ color: 'white' })
    browser.action.setBadgeText({ text: '🚧' })
  }
}

main()
