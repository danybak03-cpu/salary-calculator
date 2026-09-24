import { CA } from '../data/canada'
import { finalize, pos, progressive } from './progressive'
import type { Line, TaxInput, TaxResult } from './types'

export type Province = 'ON' | 'BC' | 'AB' | 'QC'

interface ProvCtx {
  gross: number
  netIncome: number
  rrsp: number
  cppEnhanced: number
  /** Base CPP contributions + EI premiums, which provinces outside Quebec credit at their lowest rate. */
  contribCredits: number
}

export function federalBpa(netIncome: number): number {
  const b = CA.federal.bpa
  if (netIncome <= b.phaseStart) return b.max
  if (netIncome >= b.phaseEnd) return b.min
  return b.max - ((netIncome - b.phaseStart) * (b.max - b.min)) / (b.phaseEnd - b.phaseStart)
}

export function ontarioHealthPremium(taxable: number): number {
  const row = CA.on.healthPremium.find(([from, to]) => taxable > from && taxable <= to)
  if (!row) return 0
  const [from, , base, rate, cap] = row
  return Math.min(cap, base + rate * (taxable - from))
}

const PROVINCES: Record<Province, { name: string; tax: (c: ProvCtx) => Line[] }> = {
  ON: {
    name: 'Ontario',
    tax: ({ netIncome, contribCredits }) => {
      const o = CA.on
      const basic = pos(progressive(netIncome, o.scale) - o.scale[0].rate * (o.bpa + contribCredits))
      const surtax = o.surtax.reduce((s, t) => s + t.rate * pos(basic - t.threshold), 0)
      const beforeReduction = basic + surtax
      const reduction = Math.min(beforeReduction, pos(2 * o.reductionBase - beforeReduction))
      return [
        { label: 'Ontario income tax (incl. surtax)', amount: beforeReduction - reduction },
        { label: 'Ontario Health Premium', amount: ontarioHealthPremium(netIncome) },
      ]
    },
  },
  BC: {
    name: 'British Columbia',
    tax: ({ netIncome, contribCredits }) => {
      const b = CA.bc
      const basic = pos(progressive(netIncome, b.scale) - b.scale[0].rate * (b.bpa + contribCredits))
      const reduction = pos(b.reduction.max - b.reduction.rate * pos(netIncome - b.reduction.threshold))
      return [{ label: 'British Columbia income tax', amount: pos(basic - reduction) }]
    },
  },
  AB: {
    name: 'Alberta',
    tax: ({ netIncome, contribCredits }) => {
      const a = CA.ab
      const credits = a.scale[0].rate * (a.bpa + contribCredits)
      const supplemental = pos((credits - a.supplemental.floor) * a.supplemental.rate)
      return [{ label: 'Alberta income tax', amount: pos(progressive(netIncome, a.scale) - credits - supplemental) }]
    },
  },
  QC: {
    name: 'Quebec',
    tax: ({ gross, rrsp, cppEnhanced }) => {
      const q = CA.qc
      const employmentDeduction = Math.min(q.employmentDeduction.rate * gross, q.employmentDeduction.max)
      const taxable = pos(gross - rrsp - employmentDeduction - cppEnhanced)
      return [{ label: 'Quebec income tax', amount: pos(progressive(taxable, q.scale) - q.creditRate * q.bpa) }]
    },
  },
}

export function computeCanada(province: Province, { gross, pension }: TaxInput): TaxResult {
  const qc = province === 'QC'
  const plan = qc ? CA.qpp : CA.cpp
  const cpp1 = plan.rate * pos(Math.min(gross, plan.ympe) - plan.exemption)
  const cpp2 = plan.cpp2Rate * pos(Math.min(gross, plan.yampe) - plan.ympe)
  const cppBase = (cpp1 * plan.baseRate) / plan.rate
  const cppEnhanced = cpp1 - cppBase + cpp2
  const eiRate = qc ? CA.ei.quebecRate : CA.ei.rate
  const ei = eiRate * Math.min(gross, CA.ei.maxInsurable)
  const qpip = qc ? CA.qpip.rate * Math.min(gross, CA.qpip.maxInsurable) : 0

  // RRSP reduces income tax only; CPP/EI are still charged on full pay.
  const rrsp = Math.min(pension, CA.rrsp.pct * gross, CA.rrsp.limit)
  const netIncome = pos(gross - rrsp - cppEnhanced)

  const F = CA.federal
  const fedCredits = F.creditRate * (federalBpa(netIncome) + Math.min(gross, F.employmentAmount) + cppBase + ei + qpip)
  const federal = pos(progressive(netIncome, F.scale) - fedCredits)
  const abatement = qc ? F.quebecAbatement * federal : 0

  const prov = PROVINCES[province]
  const planName = qc ? 'QPP' : 'CPP'
  return finalize(
    gross,
    rrsp,
    [
      { label: 'Federal income tax', amount: federal },
      { label: 'Quebec abatement (16.5%)', amount: -abatement },
      ...prov.tax({ gross, netIncome, rrsp, cppEnhanced, contribCredits: cppBase + ei }),
    ],
    [
      { label: `${planName} (${(plan.rate * 100).toFixed(2)}%)`, amount: cpp1 },
      { label: `${planName}2 (4%)`, amount: cpp2 },
      { label: `EI (${(eiRate * 100).toFixed(2)}%)`, amount: ei },
      { label: 'QPIP (0.43%)', amount: qpip },
    ],
  )
}
