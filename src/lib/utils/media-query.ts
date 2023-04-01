const darkMediaQuery = matchMedia('(prefers-color-scheme: dark)')

export function isDarkColorScheme() {
  return darkMediaQuery.matches
}

export function onColorSchemeChange(listener: any) {
  darkMediaQuery.addEventListener('change', listener)
}

export function offColorSchemeChange(listener: any) {
  darkMediaQuery.removeEventListener('change', listener)
}
