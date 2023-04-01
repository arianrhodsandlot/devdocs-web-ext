import _ from 'lodash'
import { type WrapedResponse } from '~/types/message'
import { Docs } from './docs'
import { getDocs } from './docs-utils'

async function searchEntry({ query, scope }: { query: string; scope: string }) {
  if (!query && !scope) {
    return
  }
  const docs = await getDocs()
  if (!scope) {
    return await docs.searchEntries(query)
  }
  const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
  if (!doc) {
    return []
  }
  if (!query) {
    return doc.entries.slice(0, 50)
  }
  return await Docs.searchEntriesInDoc(query, doc)
}

function wrapResponse(rawResponse: unknown) {
  const response = _.has(rawResponse, 'status') ? rawResponse : { status: 'success', content: rawResponse }
  const wrapedResponse: WrapedResponse = {
    status: _.get(response, 'status', 'error'),
    content: _.get(response, 'content', {}),
    error: _.get(response, 'error'),
    errorMessage: _.get(response, 'errorMessage', ''),
  }
  return wrapedResponse
}

// eslint-disable-next-line etc/prefer-interface
type MessageHandler = (payload: unknown) => Promise<WrapedResponse>
type MessageHandlers = Record<string, MessageHandler>
export const messageHandlers: MessageHandlers = {
  async 'search-entry'(payload) {
    const query = _.get(payload, 'query', '')
    const scope = _.get(payload, 'scope', '')
    const entries = await searchEntry({ query, scope })
    return wrapResponse(entries)
  },

  async 'auto-compelete-enabled-doc'(payload) {
    const scope = _.get(payload, 'scope', '')
    const docs = await getDocs()
    const doc = await docs.attemptToMatchOneDocInEnabledDocs(scope)
    return wrapResponse(doc)
  },

  async 'get-content-doc'(payload) {
    const scope = _.get(payload, 'scope', '')
    const docs = await getDocs()
    const doc = await docs.attemptToMatchOneDocInAllDocs(scope)
    return wrapResponse(doc)
  },
}

export function errorHandler({
  error,
  errorMessage = _.get(error, 'message', ''),
}: {
  error?: unknown
  errorMessage?: string
} = {}) {
  return wrapResponse({ status: 'error', error, errorMessage })
}
