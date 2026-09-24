import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Currency, Region } from '../engine/types'
import type { Evaluation } from '../lib/evaluate'
import { SERIES } from '../lib/evaluate'
import { compactMoney, money, pct } from '../lib/format'
import { Card, Segmented, Swatch } from './ui'

type Filter = 'all' | Region
type Basis = 'salary' | 'bonus'
type SortKey = 'label' | 'gross' | 'incomeTax' | 'social' | 'netYear' | 'netMonth' | 'effective' | 'marginal' | 'netBonus'

interface Row {
  id: string
  name: string
  flag: string
  region: Region
  gross: number
  incomeTax: number
  social: number
  pension: number
  net: number
  netYear: number
  netMonth: number
  effective: number
  marginal: number
  netBonus: number
  caveat?: string
}

export function AllJurisdictions({ evals, selected, onSelect, conv, display, divisor, periodLabel }: {
  evals: Evaluation[]
  selected: string
  onSelect: (id: string) => void
  conv: (ev: Evaluation, x: number) => number
  display: Currency
  divisor: number
  periodLabel: string
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [basisPref, setBasis] = useState<Basis>('bonus')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'netYear', dir: -1 })
  const hasBonus = evals.some((e) => e.bonus.gross > 0)
  const basis: Basis = hasBonus ? basisPref : 'salary'

  const rows = useMemo<Row[]>(
    () =>
      evals
        .filter((e) => filter === 'all' || e.j.region === filter)
        .map((e) => {
          const r = basis === 'bonus' ? e.bonus.total : e.base
          const net = conv(e, r.net)
          return {
            id: e.j.id,
            name: e.j.short,
            flag: e.j.flag,
            region: e.j.region,
            gross: conv(e, r.gross) / divisor,
            incomeTax: conv(e, r.incomeTax) / divisor,
            social: conv(e, r.social) / divisor,
            pension: conv(e, r.pension) / divisor,
            net: net / divisor,
            netYear: net,
            netMonth: net / 12,
            effective: r.effectiveRate,
            marginal: e.marginal,
            netBonus: conv(e, e.bonus.net),
            caveat: e.j.caveat,
          }
        }),
    [evals, filter, basis, conv, divisor],
  )

  const byNet = [...rows].sort((a, b) => b.net - a.net)
  const tableRows = [...rows].sort((a, b) => {
    const k = sort.key
    const va = k === 'label' ? a.name : a[k]
    const vb = k === 'label' ? b.name : b[k]
    return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir
  })
  const best = byNet[0]
  const f = (x: number) => money(x, display)
  const hasPension = rows.some((r) => r.pension > 0.5)
  const series = SERIES.filter((s) => s.key !== 'pension' || hasPension)

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
      title="Every jurisdiction, one currency"
      subtitle={`Same gross converted to each local currency, taxed locally, shown in ${display} ${periodLabel}`}
      action={
        <div className="flex flex-wrap gap-2">
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
          {hasBonus && (
            <Segmented<Basis>
              size="sm"
              label="Basis"
              value={basis}
              onChange={setBasis}
              options={[
                { value: 'salary', label: 'Salary' },
                { value: 'bonus', label: '+ Bonus' },
              ]}
            />
          )}
        </div>
      }
    >
      {best && (
        <p className="mb-3 text-sm text-ink-2">
          Highest take-home: <strong className="text-ink">{best.flag} {best.name}</strong> at{' '}
          <strong className="tnum text-ink">{f(best.netMonth)}</strong> per month ({f(best.netYear)} a year)
          {byNet.length > 1 && (
            <>
              , {f(best.netMonth - byNet[byNet.length - 1].netMonth)} a month more than {byNet[byNet.length - 1].flag}{' '}
              {byNet[byNet.length - 1].name}
            </>
          )}
          .
        </p>
      )}

      <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <Swatch color={s.color} />
            {s.label}
          </li>
        ))}
      </ul>

      <div style={{ height: byNet.length * 30 + 36 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byNet} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 0 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} stroke="var(--grid)" />
            <XAxis
              type="number"
              tickFormatter={(v: number) => compactMoney(v, display)}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="id"
              width={104}
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props as unknown as { x: number; y: number; payload: { value: string } }
                const row = byNet.find((r) => r.id === payload.value)
                const sel = payload.value === selected
                return (
                  <text
                    x={x - 6}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight={sel ? 700 : 400}
                    fill={sel ? 'var(--ink)' : 'var(--ink-2)'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelect(payload.value)}
                  >
                    {row ? `${row.flag} ${row.name}` : payload.value}
                  </text>
                )
              }}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as Row
                return (
                  <div className="min-w-48 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
                    <div className="mb-1 font-semibold text-ink">
                      {r.flag} {r.name}
                    </div>
                    {series.map((s) => (
                      <div key={s.key} className="tnum flex items-center justify-between gap-4 text-ink-2">
                        <span className="flex items-center gap-1.5">
                          <Swatch color={s.color} />
                          {s.label}
                        </span>
                        <span className="text-ink">{f(r[s.key])}</span>
                      </div>
                    ))}
                    <div className="tnum mt-1 flex justify-between border-t border-line pt-1 text-ink-2">
                      <span>Net per month</span>
                      <span className="font-semibold text-ink">{f(r.netMonth)}</span>
                    </div>
                    <div className="tnum flex justify-between text-ink-2">
                      <span>Net per year</span>
                      <span className="text-ink">{f(r.netYear)}</span>
                    </div>
                    <div className="tnum flex justify-between text-ink-2">
                      <span>Effective rate</span>
                      <span className="text-ink">{pct(r.effective)}</span>
                    </div>
                  </div>
                )
              }}
            />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="a"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={2}
                isAnimationActive={false}
                onClick={(d: { payload?: Row }) => d.payload && onSelect(d.payload.id)}
                style={{ cursor: 'pointer' }}
              >
                {i === series.length - 1 && (
                  <LabelList
                    dataKey="net"
                    position="right"
                    formatter={(v) => compactMoney(Number(v), display)}
                    style={{ fill: 'var(--ink-2)', fontSize: 11 }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-right text-[11px] text-muted">Labels show net pay. Click a row to select it.</p>

      <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0">
        <table className="tnum w-full min-w-[800px] text-[13px]">
          <thead className="border-b border-line text-ink-2">
            <tr>
              {header('label', 'Jurisdiction', 'left')}
              {header('gross', 'Gross')}
              {header('incomeTax', 'Income tax')}
              {header('social', 'Social')}
              {header('netYear', 'Net / year')}
              {header('netMonth', 'Net / month')}
              {header('effective', 'Effective')}
              {header('marginal', 'Marginal')}
              {hasBonus && header('netBonus', 'Net bonus / yr')}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
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
                <td className="px-2 py-1.5 text-right">{f(r.incomeTax)}</td>
                <td className="px-2 py-1.5 text-right">{f(r.social)}</td>
                <td className="px-2 py-1.5 text-right font-semibold">{f(r.netYear)}</td>
                <td className="px-2 py-1.5 text-right font-semibold">{f(r.netMonth)}</td>
                <td className="px-2 py-1.5 text-right">{pct(r.effective)}</td>
                <td className="px-2 py-1.5 text-right">{pct(r.marginal)}</td>
                {hasBonus && <td className="px-2 py-1.5 text-right">{f(r.netBonus)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.some((r) => r.caveat) && <p className="mt-2 text-[11px] text-muted">* Some 2026 parameters projected. See notes below.</p>}
    </Card>
  )
}
