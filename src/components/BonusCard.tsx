import type { Evaluation } from '../lib/evaluate'
import { pct } from '../lib/format'
import { Card, Stat } from './ui'

export function BonusCard({ ev, fmt, fmtYear, fmtMonth }: {
  ev: Evaluation
  fmt: (x: number) => string
  fmtYear: (x: number) => string
  fmtMonth: (x: number) => string
}) {
  const b = ev.bonus
  const has = b.gross > 0
  const keep = has ? b.net / b.gross : 0

  return (
    <Card title="How much of a bonus do you keep?" subtitle="Bonus taxed on top of base salary: tax(base + bonus) − tax(base)">
      {!has ? (
        <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-ink-2">Enter a gross bonus to see what you actually take home.</p>
      ) : (
        <>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-ink-2">Gross bonus</span>
              <span className="tnum font-medium">{fmt(b.gross)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-2">Income tax on bonus</span>
              <span className="tnum">−{fmt(b.incomeTax)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-2">Social security on bonus</span>
              <span className="tnum">−{fmt(b.social)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <span className="font-semibold">Net bonus</span>
              <span className="tnum text-xl font-semibold text-accent">{fmt(b.net)}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>You keep {pct(keep, 0)}</span>
              <span>Tax + contributions {pct(b.rate, 0)}</span>
            </div>
            <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`You keep ${pct(keep, 0)} of the bonus`}>
              <div className="h-full rounded-l-full bg-s1" style={{ width: `${keep * 100}%` }} />
              <div className="h-full rounded-r-full bg-s2" style={{ width: `${(1 - keep) * 100}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Rate on bonus" value={pct(b.rate)} />
            <Stat label="Average rate on base" value={pct(ev.base.effectiveRate)} />
            <Stat label="Total net per year" value={fmtYear(b.total.net)} tone="good" />
            <Stat label="Total net per month" value={fmtMonth(b.total.net)} tone="good" />
          </div>
          <p className="mt-3 text-xs text-muted">
            Payroll may withhold a different amount in the month the bonus is paid (e.g. US 22% supplemental rate, UK PAYE
            spike). This shows the final annual cost.
          </p>
        </>
      )}
    </Card>
  )
}
