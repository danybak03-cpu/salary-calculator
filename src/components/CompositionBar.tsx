import { SERIES, type SeriesKey } from '../lib/evaluate'

/** Thin 100% bar: net / income tax / social / pension as shares of gross. */
export function CompositionBar({ values, fmt }: { values: Record<SeriesKey, number>; fmt: (x: number) => string }) {
  const total = SERIES.reduce((s, x) => s + Math.max(0, values[x.key]), 0) || 1
  const parts = SERIES.filter((s) => values[s.key] > 0.5)
  return (
    <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
      {parts.map((s, i) => (
        <div
          key={s.key}
          title={`${s.label}: ${fmt(values[s.key])}`}
          className={`h-full ${i === 0 ? 'rounded-l-full' : ''} ${i === parts.length - 1 ? 'rounded-r-full' : ''}`}
          style={{ width: `${(values[s.key] / total) * 100}%`, background: s.color }}
        />
      ))}
    </div>
  )
}
