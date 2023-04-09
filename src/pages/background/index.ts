import browser from 'webextension-polyfill'
import { defaultOptions } from '~/src/lib/utils/default-options'
import { log } from '~/src/lib/utils/log'
import { errorHandler, messageHandlers } from '~/src/lib/utils/message-handlers'
import { storage } from '~/src/lib/utils/storage'
import { updateDocs } from '../../lib/utils/docs-utils'

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
  })
}

function main() {
  initializeOptions()
  initializeListeners()
}

main()
