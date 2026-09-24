import type { Currency } from '../engine/types'

const cache = new Map<string, Intl.NumberFormat>()

/** "$", "€", "£" — but "CA$" so the two dollars stay distinguishable. */
const display = (c: Currency) => (c === 'CAD' ? 'symbol' : 'narrowSymbol')

export function money(amount: number, currency: Currency, digits = 0): string {
  const key = `${currency}:${digits}`
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat('en-GB', { style: 'currency', currency, currencyDisplay: display(currency), maximumFractionDigits: digits, minimumFractionDigits: digits })
    cache.set(key, f)
  }
  // Avoid "-£0" for rounding noise.
  return f.format(Math.abs(amount) < 0.5 ? 0 : amount)
}

export function compactMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, currencyDisplay: display(currency), notation: 'compact', maximumFractionDigits: 1 }).format(amount)
}

export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`

export const SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£', CAD: 'CA$' }
export const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CAD']
