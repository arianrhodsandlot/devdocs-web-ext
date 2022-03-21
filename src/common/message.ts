import browser from 'webextension-polyfill'
import { WrapedResponse } from '../../types/message'
import { log } from '../common/log'
import { messageHandlers } from '../background/message'

interface Message {
  action: string;
  payload?: unknown;
}
export async function sendMessage<TResult = unknown> (message: Message) {
  const messageHandler = messageHandlers[message.action]
  if (messageHandler) {
    const result = await messageHandler(message.payload)
    return result
  }

  log('[common/message] sending message:', message)
  const result: WrapedResponse<TResult> = await browser.runtime.sendMessage(message)
  log('[common/message] result recived:', result)
  return result
}
