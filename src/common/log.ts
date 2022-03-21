import { isDev } from './env'

export function log (...args: unknown[]) {
  if (isDev) {
    console.warn(...args) // eslint-disable-line no-console
  }
}
