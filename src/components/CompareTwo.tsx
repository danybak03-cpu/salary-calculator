import type { Currency } from '../engine/types'
import type { Evaluation } from '../lib/evaluate'
import { money, pct } from '../lib/format'
import { CompositionBar } from './CompositionBar'
import { JurisdictionSelect } from './JurisdictionSelect'
import { Card } from './ui'

export function CompareTwo({ a, b, onA, onB, conv, display, periodLabel, divisor }: {
  a: Evaluation
  b: Evaluation
  onA: (id: string) => void
  onB: (id: string) => void
  /** local amount of an evaluation → display currency (annual). */
  conv: (ev: Evaluation, x: number) => number
  display: Currency
  periodLabel: string
  divisor: number
}) {
  const f = (x: number) => money(x / divisor, display)
  const hasBonus = a.bonus.gross > 0 || b.bonus.gross > 0

  const fy = (x: number) => money(x, display)
  const fm = (x: number) => money(x / 12, display)
  /** money = follows the Yearly/Monthly toggle; year / month = always that period. */
  type Kind = 'money' | 'year' | 'month' | 'pct'
  const show = (kind: Kind, v: number) => (kind === 'money' ? f(v) : kind === 'year' ? fy(v) : kind === 'month' ? fm(v) : pct(v))

  const rows: { label: string; get: (e: Evaluation) => number; kind: Kind; strong?: boolean }[] = [
    { label: 'Gross pay', get: (e) => conv(e, e.base.gross), kind: 'money' },
    { label: 'Income tax', get: (e) => conv(e, e.base.incomeTax), kind: 'money' },
    { label: 'Social security', get: (e) => conv(e, e.base.social), kind: 'money' },
    ...(a.base.pension + b.base.pension > 0 ? [{ label: 'Pension', get: (e: Evaluation) => conv(e, e.base.pension), kind: 'money' as const }] : []),
    { label: 'Net pay per year', get: (e) => conv(e, e.base.net), kind: 'year', strong: true },
    { label: 'Net pay per month', get: (e) => conv(e, e.base.net), kind: 'month', strong: true },
    { label: 'Effective rate', get: (e) => e.base.effectiveRate, kind: 'pct' },
    { label: 'Marginal rate', get: (e) => e.marginal, kind: 'pct' },
    ...(hasBonus
      ? [
          { label: 'Net bonus', get: (e: Evaluation) => conv(e, e.bonus.net), kind: 'money' as const },
          { label: 'Net incl. bonus per year', get: (e: Evaluation) => conv(e, e.bonus.total.net), kind: 'year' as const, strong: true },
          { label: 'Net incl. bonus per month', get: (e: Evaluation) => conv(e, e.bonus.total.net), kind: 'month' as const, strong: true },
        ]
      : []),
  ]

  const netA = conv(a, hasBonus ? a.bonus.total.net : a.base.net)
  const netB = conv(b, hasBonus ? b.bonus.total.net : b.base.net)
  const diff = netB - netA
  const better = diff >= 0 ? b : a
  const worse = diff >= 0 ? a : b

  const Side = ({ e, onChange }: { e: Evaluation; onChange: (id: string) => void }) => {
    const values = {
      net: conv(e, e.base.net),
      incomeTax: conv(e, e.base.incomeTax),
      social: conv(e, e.base.social),
      pension: conv(e, e.base.pension),
    }
    return (
      <div className="min-w-0 space-y-3">
        <JurisdictionSelect value={e.j.id} onChange={onChange} />
        <div>
          <div className="text-xs text-muted">Net {periodLabel}</div>
          <div className="tnum text-2xl font-semibold text-ink">{f(values.net)}</div>
          <div className="tnum text-xs text-ink-2">
            {divisor === 1 ? `${fm(values.net)} per month` : `${fy(values.net)} per year`}
          </div>
          {e.bonus.gross > 0 && (
            <div className="tnum text-xs text-ink-2">
              <span className="font-medium text-good">{fm(conv(e, e.bonus.total.net))}</span> per month incl. bonus
            </div>
          )}
        </div>
        <CompositionBar values={values} fmt={f} />
      </div>
    )
  }

  return (
    <Card title="Side-by-side" subtitle={`Same gross salary converted at current rates, shown in ${display} ${periodLabel}`}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Side e={a} onChange={onA} />
        <Side e={b} onChange={onB} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="tnum w-full text-sm">
          <thead>
            <tr className="text-xs text-muted">
              <th scope="col" className="sr-only">Item</th>
              <th scope="col" className="pb-1.5 text-right font-medium">{a.j.flag} {a.j.short}</th>
              <th scope="col" className="pb-1.5 text-right font-medium">{b.j.flag} {b.j.short}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const va = r.get(a)
              const vb = r.get(b)
              return (
                <tr key={r.label} className={`border-t border-line ${r.strong ? 'font-semibold' : ''}`}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-normal text-ink-2">{r.label}</th>
                  <td className="py-1.5 text-right">{show(r.kind, va)}</td>
                  <td className="py-1.5 text-right">{show(r.kind, vb)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm">
        {Math.abs(diff) < 1 ? (
          <span>Both leave you with the same take-home pay.</span>
        ) : (
          <span>
            <strong>{better.j.flag} {better.j.label}</strong> leaves you{' '}
            <strong className="tnum text-good">{fm(Math.abs(diff))}</strong> more per month{' '}
            <span className="text-ink-2">({fy(Math.abs(diff))} a year)</span> than{' '}
            {worse.j.label}
            {hasBonus ? ', bonus included' : ''}.
          </span>
        )}
      </div>
    </Card>
  )
}
