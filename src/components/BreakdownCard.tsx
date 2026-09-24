import type { Evaluation } from '../lib/evaluate'
import { SERIES } from '../lib/evaluate'
import { pct } from '../lib/format'
import { Donut } from './Donut'
import { Card, Segmented, Stat, Swatch } from './ui'

export function BreakdownCard({ ev, fmt, fmtMonth, periodLabel, showLocal, onShowLocal, displayCode }: {
  ev: Evaluation
  fmt: (x: number) => string
  /** Always per month, whatever the Yearly/Monthly toggle says. */
  fmtMonth: (x: number) => string
  periodLabel: string
  showLocal: boolean
  onShowLocal: (v: boolean) => void
  displayCode: string
}) {
  const r = ev.base
  const values = { net: r.net, incomeTax: r.incomeTax, social: r.social, pension: r.pension }
  const slices = SERIES.map((s) => ({ ...s, value: values[s.key], text: fmt(values[s.key]) }))

  const Row = ({ label, amount, strong, indent }: { label: string; amount: number; strong?: boolean; indent?: boolean }) => (
    <div className={`flex items-baseline justify-between gap-3 py-1 ${indent ? 'pl-4 text-[13px] text-ink-2' : 'text-sm'} ${strong ? 'font-semibold text-ink' : ''}`}>
      <span className="min-w-0">{label}</span>
      <span className="tnum shrink-0">{amount < 0 ? '−' : ''}{fmt(Math.abs(amount))}</span>
    </div>
  )

  return (
    <Card
      title={
        <span>
          {ev.j.flag} {ev.j.label}
        </span>
      }
      subtitle={`Salary breakdown, ${periodLabel}`}
      action={
        ev.j.currency !== displayCode ? (
          <Segmented
            size="sm"
            label="Currency"
            value={showLocal ? 'local' : 'display'}
            onChange={(v) => onShowLocal(v === 'local')}
            options={[
              { value: 'local', label: ev.j.currency },
              { value: 'display', label: displayCode },
            ]}
          />
        ) : undefined
      }
    >
      <div className="grid items-center gap-5 sm:grid-cols-[200px_1fr]">
        <div>
          <Donut slices={slices} total={r.gross} center={fmt(r.net)} centerSub={`Net ${periodLabel}`} />
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-2">
            {slices
              .filter((s) => s.value > 0.5)
              .map((s) => (
                <li key={s.key} className="flex items-center gap-1.5">
                  <Swatch color={s.color} />
                  {s.label}
                </li>
              ))}
          </ul>
        </div>

        <div>
          <Row label="Gross pay" amount={r.gross} strong />
          <div className="my-1 border-t border-line" />
          <Row label="Income tax" amount={r.incomeTax} />
          {r.incomeTaxLines.map((l) => (
            <Row key={l.label} label={l.label} amount={l.amount} indent />
          ))}
          <Row label="Social security / payroll" amount={r.social} />
          {r.socialLines.map((l) => (
            <Row key={l.label} label={l.label} amount={l.amount} indent />
          ))}
          {r.pension > 0 && <Row label="Pension contribution (pre-tax)" amount={r.pension} />}
          <div className="my-1 border-t border-line" />
          <div className="flex items-baseline justify-between py-1">
            <span className="text-sm font-semibold text-ink">Net pay</span>
            <span className="tnum text-xl font-semibold text-accent">{fmt(r.net)}</span>
          </div>
          <div className="mt-2 space-y-1 rounded-xl bg-surface-2 px-3 py-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-ink-2">Net per month</span>
              <span className="tnum font-medium text-ink">{fmtMonth(r.net)}</span>
            </div>
            {ev.bonus.gross > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-ink-2">
                  Net per month <span className="font-medium text-ink">incl. bonus</span>
                </span>
                <span className="tnum font-semibold text-good">{fmtMonth(ev.bonus.total.net)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        <Stat label="Effective tax rate" value={pct(r.effectiveRate)} />
        <Stat label="Marginal rate" value={pct(ev.marginal)} />
        <Stat label="Income tax" value={pct(r.gross ? r.incomeTax / r.gross : 0)} />
        <Stat label="Social security" value={pct(r.gross ? r.social / r.gross : 0)} />
      </div>

      {(ev.j.caveat || r.notes.length > 0 || ev.filingIgnored) && (
        <ul className="mt-3 space-y-0.5 text-xs text-muted">
          {ev.filingIgnored && <li>• Individual taxation: calculated as single.</li>}
          {r.notes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
          {ev.j.caveat && <li>• {ev.j.caveat}</li>}
        </ul>
      )}
    </Card>
  )
}
