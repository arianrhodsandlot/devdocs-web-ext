import key from 'keymaster'
import React from 'react'
import { HashRouter } from 'react-router-dom'
import { defaultOptions } from '../../lib/default-options'
import { render } from '../../lib/render'
import { storage } from '../../lib/storage'
import App from './components/app'
import './styles'

key.filter = () => true

async function initializeOptions() {
  const options: Record<string, string | number> = {}
  for (const option in defaultOptions) {
    if (Object.prototype.hasOwnProperty.call(defaultOptions, option)) {
      const { [option]: previousValue } = await storage.get(option)
      const value = previousValue
      const defaultValue = (defaultOptions as Record<string, string | number | boolean>)[option]
      options[option] = value || defaultValue
    }
  }
  storage.set(options)
}

async function main() {
  await initializeOptions()

  const { width, height, theme } = await storage.get()

  if (theme === 'dark') {
    document.documentElement.classList.remove('_theme-default')
    document.documentElement.classList.add('_theme-dark')
  }

  document.documentElement.style.width = `${width}px`
  document.documentElement.style.height = `${height}px`
  document.body.style.width = `${width}px`
  document.body.style.height = `${height}px`

  render(
    <HashRouter>
      <App />
    </HashRouter>
  )
}

main()
