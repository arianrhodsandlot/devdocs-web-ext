import browser from 'webextension-polyfill'
import { type WrapedResponse } from '../../types/message'
import { messageHandlers } from '../background/message'
import { log } from '../common/log'

interface Message {
  action: string
  payload?: unknown
}
export async function sendMessage<TResult = unknown>(message: Message) {
  const messageHandler = messageHandlers[message.action]
  if (messageHandler) {
    return await messageHandler(message.payload)
  }

  log('[common/message] sending message:', message)
  const result: WrapedResponse<TResult> = await browser.runtime.sendMessage(message)
  log('[common/message] result recived:', result)
  return result
}
