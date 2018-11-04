import browser from 'webextension-polyfill'

export default function i18n (messageName) {
  return browser.i18n.getMessage(messageName)
}
