import browser from 'webextension-polyfill'
import { isProd } from '../common/env'
import { log } from '../common/log'

export default function i18n (messageName: string) {
  const message = browser.i18n.getMessage(messageName)
  if (!isProd && !message) {
    log(`Message for ${messageName} is empty!`)
  }
  return message || messageName
}
