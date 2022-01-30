interface WrapedResponseContentRecord {
  [key: string]: string | number | boolean | WrapedResponseContent | WrapedResponseContent[];
}
type WrapedResponseContent = WrapedResponseContentRecord | WrapedResponseContentRecord[]
export interface WrapedResponse<TContent = WrapedResponseContent> {
  status: 'success' | 'error';
  content: TContent;
  error: unknown | null;
  errorMessage: '';
}
