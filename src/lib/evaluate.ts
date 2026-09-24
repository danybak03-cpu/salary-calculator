import { bonusImpact, marginalRate, type BonusImpact } from '../engine/analysis'
import type { Currency, Filing, Jurisdiction, TaxInput, TaxResult } from '../engine/types'
import type { Fx } from '../fx/useFx'

export type Period = 'year' | 'month'

export interface Settings {
  jid: string
  gross: number
  inputCurrency: Currency
  bonus: number
  filing: Filing
  pensionPct: number
  period: Period
  display: Currency
}

export interface Evaluation {
  j: Jurisdiction
  input: TaxInput
  base: TaxResult
  bonus: BonusImpact
  marginal: number
  /** Whether "married" was requested but this jurisdiction taxes individually. */
  filingIgnored: boolean
}

export function evaluate(j: Jurisdiction, s: Settings, fx: Fx): Evaluation {
  const filing: Filing = j.supportsMarried ? s.filing : 'single'
  const gross = Math.max(0, fx.convert(s.gross || 0, s.inputCurrency, j.currency))
  const bonus = Math.max(0, fx.convert(s.bonus || 0, s.inputCurrency, j.currency))
  const input: TaxInput = { gross, filing, pension: (gross * (s.pensionPct || 0)) / 100 }
  const base = j.compute(input)
  return {
    j,
    input,
    base,
    bonus: bonusImpact(j, input, bonus, base),
    marginal: marginalRate(j, input, base),
    filingIgnored: s.filing === 'married' && !j.supportsMarried,
  }
}

/** Series used by every chart, in fixed categorical order. */
export const SERIES = [
  { key: 'net', label: 'Net pay', color: 'var(--series-1)' },
  { key: 'incomeTax', label: 'Income tax', color: 'var(--series-2)' },
  { key: 'social', label: 'Social security', color: 'var(--series-3)' },
  { key: 'pension', label: 'Pension', color: 'var(--series-4)' },
] as const
export type SeriesKey = (typeof SERIES)[number]['key']
