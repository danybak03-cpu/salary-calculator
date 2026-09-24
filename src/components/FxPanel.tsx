import type { Currency } from '../engine/types'
import type { Fx } from '../fx/useFx'
import { Card, inputClass } from './ui'

const OTHERS: Currency[] = ['USD', 'GBP', 'CAD']

export function FxPanel({ fx }: { fx: Fx }) {
  const edited = Object.keys(fx.overrides).length > 0
  const badge =
    fx.status === 'loading' ? { text: 'Loading…', cls: 'bg-surface-2 text-muted' }
    : fx.status === 'live' ? { text: `Live · ECB ${fx.date}`, cls: 'bg-accent-soft text-accent' }
    : { text: `Offline · ${fx.date} rates`, cls: 'bg-surface-2 text-ink-2' }

  return (
    <Card
      title="Exchange rates"
      subtitle="Used to compare equivalent salaries"
      action={<span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}>{badge.text}</span>}
    >
      <div className="space-y-2">
        {OTHERS.map((c) => (
          <label key={c} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-2">1 EUR =</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                step="0.0001"
                min="0"
                value={Number(fx.rates[c].toFixed(4))}
                onChange={(e) => fx.setOverride(c, e.target.value === '' ? undefined : Number(e.target.value))}
                className={`${inputClass.replace("w-full ", "")} tnum w-28 py-1.5 text-right text-sm ${fx.overrides[c] ? 'border-accent' : ''}`}
                aria-label={`EUR to ${c} rate`}
              />
              <span className="w-8 text-ink-2">{c}</span>
            </span>
          </label>
        ))}
      </div>
      {edited && (
        <button type="button" onClick={fx.resetOverrides} className="mt-3 text-[13px] font-medium text-accent hover:underline">
          Reset to market rates
        </button>
      )}
    </Card>
  )
}
