import { useEffect, useState } from 'react'
import { isDarkColorScheme, offColorSchemeChange, onColorSchemeChange } from '../utils/media-query'

export function useTheme(initialTheme: string) {
  const [theme, setTheme] = useState(initialTheme)
  const [isDark, setIsDark] = useState(theme === 'dark')

  function calcIsDark() {
    if (theme === 'system') {
      setIsDark(isDarkColorScheme())
    } else {
      setIsDark(theme === 'dark')
    }
  }

  useEffect(() => {
    onColorSchemeChange(calcIsDark)

    return () => {
      offColorSchemeChange(calcIsDark)
    }
  }, [])

  useEffect(() => {
    calcIsDark()
  }, [theme])

  return [{ theme, isDark }, setTheme] as const
}
