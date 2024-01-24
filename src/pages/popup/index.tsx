import key from 'keymaster'
import { HashRouter } from 'react-router-dom'
import 'prismjs-components-importer'
import { defaultOptions } from '~/src/lib/utils/default-options'
import { isDarkColorScheme, onColorSchemeChange } from '~/src/lib/utils/media-query'
import { render } from '~/src/lib/utils/render'
import { storage } from '~/src/lib/utils/storage'
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

function updateTheme(theme: string) {
  const isDark = theme === 'system' ? isDarkColorScheme() : theme === 'dark'
  if (isDark) {
    document.documentElement.classList.remove('_theme-default')
    document.documentElement.classList.add('_theme-dark')
  } else {
    document.documentElement.classList.add('_theme-default')
    document.documentElement.classList.remove('_theme-dark')
  }
}

async function main() {
  await initializeOptions()

  const { width, height, theme } = await storage.get()

  onColorSchemeChange(() => {
    updateTheme(theme)
  })
  updateTheme(theme)

  document.documentElement.style.width = `${width}px`
  document.documentElement.style.height = `${height}px`
  document.body.style.width = `${width}px`
  document.body.style.height = `${height}px`

  render(
    <HashRouter>
      <App />
    </HashRouter>,
  )
}

main()
