import { IE } from '../data/ireland'
import { finalize, pos, progressive } from './progressive'
import type { TaxInput, TaxResult } from './types'

/** Annual PRSI Class A, computed on weekly pay with the Oct-2026 rate change and the weekly PRSI credit. */
export function irelandPrsi(gross: number): number {
  const p = IE.prsi
  const weekly = gross / 52
  if (weekly <= p.weeklyThreshold) return 0
  const credit = weekly <= p.credit.to ? pos(p.credit.max - (weekly - p.credit.from) / p.credit.divisor) : 0
  return p.rateWeeks.reduce((s, { weeks, rate }) => s + weeks * pos(weekly * rate - credit), 0)
}

export function computeIreland({ gross, filing, pension }: TaxInput): TaxResult {
  const cap = IE.pensionReliefCap.pct * Math.min(gross, IE.pensionReliefCap.earningsCap)
  const applied = Math.min(pension, cap)
  const taxable = pos(gross - applied)
  const band = IE.band[filing]

  const grossTax = 0.2 * Math.min(taxable, band) + 0.4 * pos(taxable - band)
  const credits = IE.personalCredit[filing] + Math.min(IE.employeeCredit, 0.2 * gross)
  const incomeTax = pos(grossTax - credits)

  const usc = gross <= IE.usc.exemption ? 0 : progressive(gross, IE.usc.scale)

  return finalize(
    gross,
    applied,
    [
      { label: 'Income tax (PAYE)', amount: incomeTax },
      { label: 'Universal Social Charge', amount: usc },
    ],
    [{ label: 'PRSI Class A', amount: irelandPrsi(gross) }],
    filing === 'married' ? ['Married, one earner (€53,000 standard-rate band)'] : [],
  )
}
