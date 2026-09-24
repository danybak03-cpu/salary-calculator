import type { Currency } from '../engine/types'
import { CURRENCIES, SYMBOL } from '../lib/format'
import { Segmented } from './ui'

export function Header({ display, onDisplay, dark, onDark }: {
  display: Currency
  onDisplay: (c: Currency) => void
  dark: boolean
  onDark: (d: boolean) => void
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">2026 tax year</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">Take-home pay calculator</h1>
        <p className="mt-1 text-sm text-ink-2">Gross-to-net salary and bonus across Spain, Ireland, the UK, the US and Canada.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted sm:inline">Compare in</span>
        <Segmented
          label="Comparison currency"
          value={display}
          onChange={onDisplay}
          options={CURRENCIES.map((c) => ({ value: c, label: `${SYMBOL[c]} ${c}` }))}
          size="sm"
        />
        <button
          type="button"
          onClick={() => onDark(!dark)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
          className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-2 hover:text-ink"
        >
          {dark ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
