import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { pct } from '../lib/format'

export interface Slice {
  key: string
  label: string
  color: string
  value: number
  text: string
}

export function Donut({ slices, total, center, centerSub }: { slices: Slice[]; total: number; center: string; centerSub: string }) {
  const data = slices.filter((s) => s.value > 0.5)
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="66%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((s) => (
              <Cell key={s.key} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const s = payload[0].payload as Slice
              return (
                <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
                  <div className="font-medium text-ink">{s.label}</div>
                  <div className="tnum text-ink-2">
                    {s.text} · {pct(s.value / total)}
                  </div>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <div className="text-[11px] text-muted">{centerSub}</div>
        <div className="tnum text-lg font-semibold text-ink">{center}</div>
      </div>
    </div>
  )
}
