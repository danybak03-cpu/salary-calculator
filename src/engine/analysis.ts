import type { Jurisdiction, TaxInput, TaxResult } from './types'

const STEP = 100

/** Share of the next 100 of gross pay lost to income tax + social contributions. */
export function marginalRate(j: Jurisdiction, input: TaxInput, base?: TaxResult): number {
  const a = base ?? j.compute(input)
  const b = j.compute({ ...input, gross: input.gross + STEP })
  return (b.incomeTax + b.social - a.incomeTax - a.social) / STEP
}

export interface BonusImpact {
  gross: number
  incomeTax: number
  social: number
  net: number
  /** Share of the bonus lost to tax + contributions. */
  rate: number
  total: TaxResult
}

/** True marginal cost of a bonus: tax(base + bonus) − tax(base). The pension stays tied to base salary. */
export function bonusImpact(j: Jurisdiction, input: TaxInput, bonus: number, base?: TaxResult): BonusImpact {
  const a = base ?? j.compute(input)
  const total = j.compute({ ...input, gross: input.gross + bonus })
  const incomeTax = total.incomeTax - a.incomeTax
  const social = total.social - a.social
  return {
    gross: bonus,
    incomeTax,
    social,
    net: total.net - a.net,
    rate: bonus > 0 ? (incomeTax + social) / bonus : 0,
    total,
  }
}
