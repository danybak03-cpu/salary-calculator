import { byId } from '../engine/registry'
import type { Currency, Filing } from '../engine/types'
import type { Period, Settings } from '../lib/evaluate'
import { CURRENCIES, SYMBOL } from '../lib/format'
import { JurisdictionSelect } from './JurisdictionSelect'
import { Card, Field, inputClass, Segmented } from './ui'

const PENSION_HINT: Record<string, string> = {
  Spain: 'Employer pension plan: reduces the IRPF base, capped at €10,000.',
  Ireland: 'Reduces income tax only, not USC or PRSI.',
  'United Kingdom': 'Salary sacrifice: reduces income tax and NI.',
  'United States': 'Traditional 401(k): reduces income tax, not FICA. Capped at $24,500.',
  Canada: 'RRSP: reduces income tax, not CPP/EI. 18% of pay, max C$33,810.',
}

function MoneyInput({ id, value, currency, onValue, onCurrency }: {
  id: string
  value: number
  currency: Currency
  onValue: (v: number) => void
  onCurrency: (c: Currency) => void
}) {
  return (
    <div className="flex rounded-lg border border-line bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
      <select
        aria-label="Input currency"
        value={currency}
        onChange={(e) => onCurrency(e.target.value as Currency)}
        className="rounded-l-lg border-r border-line bg-surface-2 px-2 text-[13px] font-medium text-ink-2 outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {SYMBOL[c]} {c}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={1000}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onValue(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
        className="tnum w-full min-w-0 rounded-r-lg bg-transparent px-3 py-2 text-[15px] text-ink outline-none"
      />
    </div>
  )
}

export function InputPanel({ s, set, onJurisdiction, onInputCurrency }: {
  s: Settings
  set: <K extends keyof Settings>(k: K, v: Settings[K]) => void
  onJurisdiction: (id: string) => void
  onInputCurrency: (c: Currency) => void
}) {
  const j = byId(s.jid)
  return (
    <Card title="Your pay" subtitle="Annual gross amounts">
      <div className="space-y-4">
        <Field label="Where you work" htmlFor="jurisdiction">
          <JurisdictionSelect id="jurisdiction" value={s.jid} onChange={onJurisdiction} />
        </Field>

        <Field label="Gross base salary (per year)" htmlFor="gross">
          <MoneyInput id="gross" value={s.gross} currency={s.inputCurrency} onValue={(v) => set('gross', v)} onCurrency={onInputCurrency} />
        </Field>

        <Field label="Gross bonus (per year)" htmlFor="bonus" hint="Taxed at your marginal rate on top of base salary.">
          <MoneyInput id="bonus" value={s.bonus} currency={s.inputCurrency} onValue={(v) => set('bonus', v)} onCurrency={onInputCurrency} />
        </Field>

        <Field
          label="Filing status"
          hint={j.supportsMarried ? (j.region === 'US' ? 'Married filing jointly, one earner.' : 'Married, one earner.') : `${j.country} taxes individuals separately, so filing status has no effect here.`}
        >
          <Segmented<Filing>
            label="Filing status"
            value={j.supportsMarried ? s.filing : 'single'}
            onChange={(v) => set('filing', v)}
            options={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married', disabled: !j.supportsMarried, title: j.supportsMarried ? undefined : 'Not applicable: individual taxation' },
            ]}
          />
        </Field>

        <Field label="Pre-tax pension contribution" htmlFor="pension" hint={PENSION_HINT[j.country]}>
          <div className="flex items-center gap-2">
            <input
              id="pension"
              type="number"
              min={0}
              max={50}
              step={1}
              value={s.pensionPct}
              onChange={(e) => set('pensionPct', Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
              className={`${inputClass.replace("w-full ", "")} tnum w-24`}
            />
            <span className="whitespace-nowrap text-sm text-ink-2">% of base salary</span>
          </div>
        </Field>

        <Field label="Show amounts">
          <Segmented<Period>
            label="Pay period"
            value={s.period}
            onChange={(v) => set('period', v)}
            options={[
              { value: 'year', label: 'Yearly' },
              { value: 'month', label: 'Monthly' },
            ]}
          />
        </Field>
      </div>
    </Card>
  )
}
