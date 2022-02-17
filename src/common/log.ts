import { isDev } from './env'

export function log (...args: unknown[]) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}
