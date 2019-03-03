import browser from 'webextension-polyfill'

const isDev = process.env.NODE_ENV === 'development'

export default function i18n (messageName) {
  const message = browser.i18n.getMessage(messageName)
  if (isDev && !message) {
    console.warn(`Message for ${messageName} is empty!`)
  }
  return message
}
