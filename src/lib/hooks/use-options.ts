import { useEffect, useState } from 'react'
import { defaultOptions } from '../utils/default-options'
import { storage } from '../utils/storage'

export function useOptions() {
  const [loaded, setLoaded] = useState(false)
  const [options, setOptions] = useState(defaultOptions)

  useEffect(() => {
    async function syncOptions() {
      const storedOptions = await storage.get()
      setOptions({ ...defaultOptions, ...storedOptions })
      setLoaded(true)
    }

    syncOptions()
    storage.onChanged.addListener(syncOptions)
    return () => {
      storage.onChanged.removeListener(syncOptions)
    }
  }, [])

  async function updateOptions(value: any) {
    const storedOptions = await storage.get()
    const newOptions = { ...storedOptions, ...value }
    setOptions(newOptions)
    await storage.set(newOptions)
  }

  return { options, updateOptions, loaded }
}
