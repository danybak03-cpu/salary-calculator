import { UK } from '../data/uk'
import { finalize, pos, progressive } from './progressive'
import type { TaxInput, TaxResult } from './types'

export function ukPersonalAllowance(adjustedNet: number): number {
  return pos(UK.personalAllowance - pos(adjustedNet - UK.taperStart) / 2)
}

export function computeUK(scotland: boolean, { gross, pension }: TaxInput): TaxResult {
  // Salary sacrifice: the contribution comes off gross before tax and NI.
  const applied = Math.min(pension, UK.pensionCap, gross)
  const pay = gross - applied
  const taxable = pos(pay - ukPersonalAllowance(pay))
  const tax = progressive(taxable, scotland ? UK.scotland : UK.rUK)
  const { pt, uel, main, upper } = UK.nic
  const nic = main * pos(Math.min(pay, uel) - pt) + upper * pos(pay - uel)

  const notes: string[] = []
  if (pay > UK.taperStart) notes.push('Personal Allowance tapered above £100,000')
  return finalize(
    gross,
    applied,
    [{ label: scotland ? 'Income tax (Scottish rates)' : 'Income tax (PAYE)', amount: tax }],
    [{ label: 'National Insurance (Class 1)', amount: nic }],
    notes,
  )
}
