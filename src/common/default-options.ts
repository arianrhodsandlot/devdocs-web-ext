import isDarkMode from 'is-dark'

export const defaultOptions = {
  theme: isDarkMode() ? 'dark' : 'light',
  width: 600,
  height: 600,
  showContextMenu: true
}
