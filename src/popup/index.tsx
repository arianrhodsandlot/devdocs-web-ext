import Raven from 'raven-js'
import browser from 'webextension-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import key from 'keymaster'
import _ from 'lodash'
import { isProd, isContextMenuEnabled } from '../common/env'
import storage from '../common/storage'
import { defaultOptions } from '../common/default-options'
import App from './app'
import history from './history'

key.filter = () => true

async function restoreHistory () {
  const { showContextMenu } = await storage.get()

  let selection
  if (!isContextMenuEnabled || !showContextMenu) {
    try {
      selection = await browser.tabs.executeScript({ code: 'getSelection().toString()' })
    } catch {}
    const query: string = (_.get(selection, '0', '') || '').trim().slice(0, 20)
    if (query) {
      localStorage.setItem('scope', '')
      localStorage.setItem('query', query)
      localStorage.setItem('docName', '')
      localStorage.setItem('lastPopupPath', `/search?query=${encodeURIComponent(query)}`)
    }
  }

  const lastPopupPath = localStorage.getItem('lastPopupPath')
  if (lastPopupPath) {
    history.replace(lastPopupPath)
  }
}

async function main () {
  await restoreHistory()

  async function initializeOptions () {
    const options: Record<string, string | number> = {}
    for (const option in defaultOptions) {
      if (Object.prototype.hasOwnProperty.call(defaultOptions, option)) {
      // eslint-disable-next-line no-await-in-loop
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
    <App />,
    document.querySelector('._app')
  )
}

main()

if (isProd) {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}
