import { ES, type SpainRegion } from '../data/spain'
import { finalize, pos, progressive } from './progressive'
import type { TaxInput, TaxResult } from './types'

/** Employee Social Security: 6.50% on pay up to the max base, plus the solidarity contribution above it. */
export function spainSocialSecurity(gross: number) {
  const { rate, maxBaseMonthly, solidarity } = ES.ss
  const general = rate * Math.min(gross, maxBaseMonthly * 12)
  const monthly = gross / 12
  let lower: number = maxBaseMonthly
  let sol = 0
  for (const t of solidarity) {
    if (monthly <= lower) break
    sol += (Math.min(monthly, t.upTo) - lower) * t.rate
    lower = t.upTo
  }
  return { general, solidarity: sol * 12 }
}

/** Art. 20 LIRPF reduction on net work income. */
export function workReduction(rn: number): number {
  const r = ES.workReduction
  if (rn <= r.lowRN) return r.max
  if (rn <= r.midRN) return r.max - r.slope1 * (rn - r.lowRN)
  if (rn <= r.highRN) return r.midMax - r.slope2 * (rn - r.midRN)
  return 0
}

function smiCredit(gross: number): number {
  const c = ES.smiCredit
  if (gross >= c.limit) return 0
  return pos(gross <= c.smi ? c.full : c.full - c.slope * (gross - c.smi))
}

/** Common-regime IRPF: state half + regional half, each net of the personal minimum. */
export function computeSpain(region: SpainRegion, { gross, pension }: TaxInput): TaxResult {
  const reg = ES.regions[region]
  const ss = spainSocialSecurity(gross)
  const ssTotal = ss.general + ss.solidarity
  const rn = pos(gross - ssTotal)
  const netWork = pos(rn - ES.otherExpenses - workReduction(rn))
  const applied = Math.min(pension, ES.pensionCap, netWork)
  const base = pos(netWork - applied)

  const state = pos(progressive(base, ES.stateScale) - progressive(Math.min(ES.stateMinimum, base), ES.stateScale))
  const regional = pos(progressive(base, reg.scale) - progressive(Math.min(reg.minimum, base), reg.scale))
  const credit = Math.min(smiCredit(gross), state + regional)

  return finalize(
    gross,
    applied,
    [
      { label: 'IRPF — state', amount: state },
      { label: `IRPF — regional (${reg.name})`, amount: regional },
      { label: 'Low-income credit (DA 61)', amount: -credit },
    ],
    [
      { label: 'Social Security (6.50%)', amount: ss.general },
      { label: 'Solidarity contribution', amount: ss.solidarity },
    ],
    [`Taxable base €${Math.round(base).toLocaleString('en')}`],
  )
}

function bizkaiaAllowance(d: number): number {
  const a = ES.bizkaia.workAllowance
  if (d <= a.low) return a.max
  if (d <= a.high) return a.max - a.slope * (d - a.low)
  return a.min
}

/** País Vasco (Bizkaia) foral IRPF: one integrated scale and a fixed tax credit. */
export function computeBizkaia({ gross, pension }: TaxInput): TaxResult {
  const b = ES.bizkaia
  const ss = spainSocialSecurity(gross)
  const d = pos(gross - ss.general - ss.solidarity)
  const netWork = pos(d - bizkaiaAllowance(d))
  const applied = Math.min(pension, b.pensionCap, netWork)
  const base = pos(netWork - applied)
  const tax = pos(progressive(base, b.scale) - b.credit)

  return finalize(
    gross,
    applied,
    [{ label: 'IRPF — Bizkaia (foral)', amount: tax }],
    [
      { label: 'Social Security (6.50%)', amount: ss.general },
      { label: 'Solidarity contribution', amount: ss.solidarity },
    ],
  )
}
