import { useMemo, useState } from 'react'
import type { Currency, Region } from '../engine/types'
import type { Evaluation } from '../lib/evaluate'
import { money, pct } from '../lib/format'
import { Card, Segmented, Swatch } from './ui'

type Filter = 'all' | Region
type SortKey = 'label' | 'gross' | 'incomeTax' | 'social' | 'net' | 'perMonth' | 'kept'

interface Row {
  id: string
  name: string
  flag: string
  gross: number
  incomeTax: number
  social: number
  net: number
  perMonth: number
  kept: number
  caveat?: string
}

/** How much of the same gross bonus you keep in each jurisdiction (annual amounts). */
export function BonusComparison({ evals, selected, onSelect, conv, display }: {
  evals: Evaluation[]
  selected: string
  onSelect: (id: string) => void
  conv: (ev: Evaluation, x: number) => number
  display: Currency
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'kept', dir: -1 })
  const hasBonus = evals.some((e) => e.bonus.gross > 0)

  const rows = useMemo<Row[]>(
    () =>
      evals
        .filter((e) => filter === 'all' || e.j.region === filter)
        .map((e) => {
          const b = e.bonus
          const net = conv(e, b.net)
          return {
            id: e.j.id,
            name: e.j.short,
            flag: e.j.flag,
            gross: conv(e, b.gross),
            incomeTax: conv(e, b.incomeTax),
            social: conv(e, b.social),
            net,
            perMonth: net / 12,
            kept: b.gross > 0 ? b.net / b.gross : 0,
            caveat: e.j.caveat,
          }
        }),
    [evals, filter, conv],
  )

  const sorted = [...rows].sort((a, b) => {
    const k = sort.key
    const va = k === 'label' ? a.name : a[k]
    const vb = k === 'label' ? b.name : b[k]
    return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir
  })
  const byKept = [...rows].sort((a, b) => b.kept - a.kept)
  const best = byKept[0]
  const worst = byKept[byKept.length - 1]
  const f = (x: number) => money(x, display)
  const neg = (x: number) => (x < 0.5 ? f(0) : `−${f(x)}`)

  const header = (key: SortKey, label: string, align: 'left' | 'right' = 'right') => (
    <th scope="col" className={`whitespace-nowrap px-2 py-2 font-medium text-${align}`}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === 'label' ? 1 : -1 }))}
        className={`inline-flex items-center gap-1 hover:text-ink ${sort.key === key ? 'text-ink' : ''}`}
      >
        {label}
        <span aria-hidden className="text-[10px]">{sort.key === key ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  )

  return (
    <Card
      title="How much of your bonus do you keep?"
      subtitle={`Same gross bonus on top of the same salary, taxed at each jurisdiction's marginal rates, shown in ${display}`}
      action={
        hasBonus ? (
          <Segmented<Filter>
            size="sm"
            label="Region"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Europe', label: 'Europe' },
              { value: 'US', label: 'US' },
              { value: 'Canada', label: 'Canada' },
            ]}
          />
        ) : undefined
      }
    >
      {!hasBonus ? (
        <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-ink-2">
          Enter a gross bonus to compare how much of it you keep in each jurisdiction.
        </p>
      ) : (
        <>
          {best && worst && (
            <p className="mb-3 text-sm text-ink-2">
              You keep the most in <strong className="text-ink">{best.flag} {best.name}</strong>:{' '}
              <strong className="tnum text-ink">{pct(best.kept, 0)}</strong> ({f(best.net)}). The least is in{' '}
              <strong className="text-ink">{worst.flag} {worst.name}</strong>:{' '}
              <strong className="tnum text-ink">{pct(worst.kept, 0)}</strong> ({f(worst.net)}), a gap of{' '}
              <strong className="tnum text-ink">{f(best.net - worst.net)}</strong>.
            </p>
          )}

          <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
            <li className="flex items-center gap-1.5">
              <Swatch color="var(--series-1)" />
              Kept
            </li>
            <li className="flex items-center gap-1.5">
              <Swatch color="var(--series-2)" />
              Income tax
            </li>
            <li className="flex items-center gap-1.5">
              <Swatch color="var(--series-3)" />
              Social security
            </li>
          </ul>

          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="tnum w-full min-w-[820px] text-[13px] [&_td]:whitespace-nowrap">
              <thead className="border-b border-line text-ink-2">
                <tr>
                  {header('label', 'Jurisdiction', 'left')}
                  {header('gross', 'Gross bonus')}
                  {header('incomeTax', 'Income tax')}
                  {header('social', 'Social')}
                  {header('net', 'Net bonus')}
                  {header('perMonth', 'Adds per month')}
                  {header('kept', 'You keep')}
                  <th scope="col" className="w-[28%] px-2 py-2 text-left font-medium">
                    <span className="sr-only">Split</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const taxShare = r.gross > 0 ? r.incomeTax / r.gross : 0
                  const socialShare = r.gross > 0 ? r.social / r.gross : 0
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelect(r.id)}
                      className={`cursor-pointer border-b border-line/70 hover:bg-surface-2 ${r.id === selected ? 'bg-accent-soft/60 font-medium' : ''}`}
                    >
                      <td className="whitespace-nowrap px-2 py-1.5 text-left">
                        {r.flag} {r.name}
                        {r.caveat && (
                          <span className="ml-1 text-muted" title={r.caveat}>
                            *
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right text-ink-2">{f(r.gross)}</td>
                      <td className="px-2 py-1.5 text-right">{neg(r.incomeTax)}</td>
                      <td className="px-2 py-1.5 text-right">{neg(r.social)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{f(r.net)}</td>
                      <td className="px-2 py-1.5 text-right">+{f(r.perMonth)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{pct(r.kept)}</td>
                      <td className="px-2 py-1.5">
                        <div
                          className="flex h-2.5 gap-[2px] overflow-hidden rounded-full"
                          role="img"
                          aria-label={`Keep ${pct(r.kept, 0)}, income tax ${pct(taxShare, 0)}, social ${pct(socialShare, 0)}`}
                          title={`Keep ${pct(r.kept)} · Income tax ${pct(taxShare)} · Social ${pct(socialShare)}`}
                        >
                          <div className="h-full rounded-l-full bg-s1" style={{ width: `${r.kept * 100}%` }} />
                          {taxShare > 0.001 && <div className="h-full bg-s2" style={{ width: `${taxShare * 100}%` }} />}
                          {socialShare > 0.001 && <div className="h-full rounded-r-full bg-s3" style={{ width: `${socialShare * 100}%` }} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            "Adds per month" spreads the net bonus over 12 months. Actual payslip withholding in the bonus month can differ.
          </p>
        </>
      )}
    </Card>
  )
}
