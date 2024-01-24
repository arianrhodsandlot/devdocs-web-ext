import { useEffect, useState } from 'react'
import { isDarkColorScheme, offColorSchemeChange, onColorSchemeChange } from '../utils/media-query'
import { useOptions } from './use-options'

export function useTheme() {
  const {
    options: { theme },
  } = useOptions()
  const [isSystemDark, setIsSystemDark] = useState(isDarkColorScheme())
  const isDark = theme === 'system' ? isSystemDark : theme === 'dark'

  useEffect(() => {
    function updateIsSystemDark() {
      setIsSystemDark(isDarkColorScheme())
    }
    onColorSchemeChange(updateIsSystemDark)
    return () => {
      offColorSchemeChange(updateIsSystemDark)
    }
  }, [])

  return { isDark }
}
