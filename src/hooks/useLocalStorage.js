import { useState, useLayoutEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = `arete_${key}`

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useLayoutEffect(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey)
      if (item !== null) setStoredValue(JSON.parse(item))
    } catch {
      // ignore
    }
  }, [prefixedKey])

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(prefixedKey, JSON.stringify(valueToStore))
    } catch {
      // ignore
    }
  }

  return [storedValue, setValue]
}
