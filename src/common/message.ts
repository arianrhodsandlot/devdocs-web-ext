import browser from 'webextension-polyfill'

interface Message {
  action: string;
  payload?: unknown;
}
export async function sendMessage (message: Message) {
  console.log('[common/message] sending message:', message)
  const result = await browser.runtime.sendMessage(message)
  console.log('[common/message] result recived:', result)
  return result
}
