import key from 'keymaster'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import '../../vendor/devdocs/assets/javascripts/vendor/prism'
import { defaultOptions } from '../common/default-options'
import { storage } from '../common/storage'
import App from './app'

key.filter = () => true

async function main() {
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

  ReactDOM.render(
    <HashRouter>
      <App />
    </HashRouter>,
    document.querySelector('._app')
  )
}

main()
