type WrapedResponseContent = WrapedResponseContentRecord | WrapedResponseContentRecord[]

type WrapedResponseContentRecord = Record<
  string,
  string | number | boolean | WrapedResponseContent | WrapedResponseContent[]
>

export interface WrapedResponse<TContent = WrapedResponseContent> {
  status: 'success' | 'error'
  content: TContent
  error: unknown | null
  errorMessage: ''
}
