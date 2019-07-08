import browser from 'webextension-polyfill'
import { isProd } from '../common/env'

export default function i18n (messageName: string) {
  const message = browser.i18n.getMessage(messageName)
  if (!isProd && !message) {
    console.warn(`Message for ${messageName} is empty!`)
  }
  return message || messageName
}
