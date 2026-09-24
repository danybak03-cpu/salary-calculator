import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Currency } from '../engine/types'
import { usePersistent } from '../lib/usePersistent'

/** Units of each currency per 1 EUR. */
export type Rates = Record<Currency, number>

/** ECB reference rates, 24 Sep 2026 — used when the live fetch fails. */
export const FALLBACK: { date: string; rates: Rates } = {
  date: '2026-09-24',
  rates: { EUR: 1, USD: 1.1367, GBP: 0.85986, CAD: 1.6047 },
}

const URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CAD'

export type FxStatus = 'loading' | 'live' | 'fallback'

export function useFx() {
  const [market, setMarket] = useState(FALLBACK)
  const [status, setStatus] = useState<FxStatus>('loading')
  const [overrides, setOverrides] = usePersistent<Partial<Rates>>('fx-overrides', {})

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    fetch(URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { date: string; rates: Partial<Rates> }) => {
        const { USD, GBP, CAD } = d.rates
        if (!USD || !GBP || !CAD) throw new Error('incomplete rates')
        setMarket({ date: d.date, rates: { EUR: 1, USD, GBP, CAD } })
        setStatus('live')
      })
      .catch(() => setStatus('fallback'))
      .finally(() => clearTimeout(timer))
    return () => ctrl.abort()
  }, [])

  const rates = useMemo<Rates>(() => ({ ...market.rates, ...overrides, EUR: 1 }), [market, overrides])

  const convert = useCallback(
    (amount: number, from: Currency, to: Currency) => (from === to ? amount : (amount / rates[from]) * rates[to]),
    [rates],
  )

  const setOverride = (c: Currency, v: number | undefined) =>
    setOverrides((o) => {
      const next = { ...o }
      if (v === undefined || !(v > 0)) delete next[c]
      else next[c] = v
      return next
    })

  return {
    rates,
    marketRates: market.rates,
    date: market.date,
    status,
    overrides,
    setOverride,
    resetOverrides: () => setOverrides({}),
    convert,
  }
}

export type Fx = ReturnType<typeof useFx>
