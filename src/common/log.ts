import { isDev } from './env'

export function log (...args: unknown[]) {
  if (isDev) {
    console.log(...args)
  }
}
