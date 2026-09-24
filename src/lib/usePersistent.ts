import { useEffect, useState } from 'react'

const PREFIX = 'take-home-2026:'

export function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode) — keep in memory only
    }
  }, [key, value])
  return [value, setValue] as const
}
