import { US } from '../data/us'
import { finalize, pos, progressive, type Bracket } from './progressive'
import type { Filing, Line, TaxInput, TaxResult } from './types'

export interface StateCtx {
  gross: number
  /** Wages after pre-tax 401(k) deferrals (= federal AGI here). */
  wages: number
  filing: Filing
  ss: number
  medicare: number
}
export interface StatePart {
  tax: Line[]
  social?: Line[]
  notes?: string[]
}
export type StateFn = (ctx: StateCtx) => StatePart

export function federalIncomeTax(wages: number, filing: Filing): number {
  return progressive(pos(wages - US.federal.standardDeduction[filing]), US.federal[filing])
}

export function computeUS(state: StateFn, { gross, filing, pension }: TaxInput): TaxResult {
  const applied = Math.min(pension, US.k401Limit, gross)
  const wages = gross - applied
  const f = US.fica
  const ss = f.ssRate * Math.min(gross, f.ssWageBase)
  const medicare = f.medicare * gross
  const addl = f.addlMedicare * pos(gross - f.addlThreshold[filing])
  const st = state({ gross, wages, filing, ss, medicare: medicare + addl })

  return finalize(
    gross,
    applied,
    [{ label: 'Federal income tax', amount: federalIncomeTax(wages, filing) }, ...st.tax],
    [
      { label: 'Social Security (6.2%)', amount: ss },
      { label: 'Medicare (1.45%)', amount: medicare },
      { label: 'Additional Medicare (0.9%)', amount: addl },
      ...(st.social ?? []),
    ],
    st.notes,
  )
}

// ---------------------------------------------------------------- New York

/**
 * NYS tax including the supplemental tax (benefit recapture) from the IT-2105-I worksheets:
 * above NY AGI of $107,650 the benefit of the lower brackets is clawed back, phased in over $50,000.
 */
export function nyStateTax(taxable: number, agi: number, filing: Filing): number {
  const sched: readonly Bracket[] = US.ny[filing]
  const r = US.ny.recapture
  const scheduleTax = progressive(taxable, sched)
  if (agi <= r.agiStart) return scheduleTax
  if (agi > r.allIncomeTopRateAgi) return taxable * sched[sched.length - 1].rate

  const phase = (start: number) => Math.min(1, pos(agi - start) / r.phaseIn)
  const first = r.firstBracket[filing]
  if (taxable <= sched[first].upTo) {
    return scheduleTax + (taxable * sched[first].rate - scheduleTax) * phase(r.agiStart)
  }
  const k = sched.findIndex((b) => taxable <= b.upTo)
  const lo = sched[k - 1].upTo
  const { base, full } = nyRecaptureAmounts(filing, k)
  return scheduleTax + base + (full - base) * phase(lo)
}

/** Recapture base (already clawed back) and full recapture at the start of bracket k. */
export function nyRecaptureAmounts(filing: Filing, k: number) {
  const sched: readonly Bracket[] = US.ny[filing]
  const lo = sched[k - 1].upTo
  const atLo = progressive(lo, sched)
  return { base: lo * sched[k - 1].rate - atLo, full: lo * sched[k].rate - atLo }
}

const nyTaxable = (c: StateCtx) => pos(c.wages - US.ny.standardDeduction[c.filing])
const nySocial = (gross: number): Line[] => [
  { label: 'NY Paid Family Leave (0.432%)', amount: Math.min(US.ny.pfl.rate * gross, US.ny.pfl.cap) },
  { label: 'NY SDI', amount: Math.min(US.ny.sdi.rate * gross, US.ny.sdi.cap) },
]

// ---------------------------------------------------------------- states

export const STATES: Record<string, StateFn> = {
  TX: () => ({ tax: [], notes: ['No state income tax'] }),
  FL: () => ({ tax: [], notes: ['No state income tax'] }),

  WA: ({ gross }) => ({
    tax: [],
    social: [
      { label: 'WA Paid Family & Medical Leave', amount: US.wa.pfml.rate * Math.min(gross, US.wa.pfml.cap) },
      { label: 'WA Cares (0.58%)', amount: US.wa.cares * gross },
    ],
    notes: ['No state income tax'],
  }),

  CA: ({ gross, wages, filing }) => {
    const c = US.ca
    const taxable = pos(wages - c.standardDeduction[filing])
    const credits = filing === 'married' ? 2 : 1
    const steps = Math.ceil(pos(wages - c.exemptionPhaseout[filing]) / c.exemptionPhaseout.step)
    const exemption = pos(c.exemptionCredit[filing] - credits * c.exemptionPhaseout.reduction * steps)
    const tax = pos(progressive(taxable, c[filing]) - exemption)
    const mhst = c.mhst.rate * pos(taxable - c.mhst.threshold)
    return {
      tax: [
        { label: 'California income tax', amount: tax },
        { label: 'CA Mental Health Services Tax (1%)', amount: mhst },
      ],
      social: [{ label: 'CA SDI (1.3%)', amount: c.sdi * gross }],
    }
  },

  NY: (c) => ({
    tax: [{ label: 'New York State income tax', amount: nyStateTax(nyTaxable(c), c.wages, c.filing) }],
    social: nySocial(c.gross),
  }),

  NYC: (c) => {
    const taxable = nyTaxable(c)
    return {
      tax: [
        { label: 'New York State income tax', amount: nyStateTax(taxable, c.wages, c.filing) },
        { label: 'New York City resident tax', amount: progressive(taxable, US.nyc[c.filing]) },
      ],
      social: nySocial(c.gross),
    }
  },

  NC: ({ wages, filing }) => ({
    tax: [{ label: 'North Carolina income tax (3.99%)', amount: US.nc.rate * pos(wages - US.nc.standardDeduction[filing]) }],
  }),

  MA: ({ gross, wages, filing, ss, medicare }) => {
    const m = US.ma
    const persons = filing === 'married' ? 2 : 1
    const ficaDeduction = Math.min(ss + medicare, m.ficaDeductionCap * persons)
    const taxable = pos(wages - m.exemption[filing] - ficaDeduction)
    return {
      tax: [
        { label: 'Massachusetts income tax (5%)', amount: m.rate * taxable },
        { label: 'MA millionaire surtax (4%)', amount: m.surtax.rate * pos(taxable - m.surtax.threshold) },
      ],
      social: [{ label: 'MA Paid Family & Medical Leave', amount: m.pfml.rate * Math.min(gross, m.pfml.cap) }],
    }
  },

  IL: ({ wages, filing }) => {
    const i = US.il
    const exemption = wages > i.exemptionAgiLimit[filing] ? 0 : i.exemption * (filing === 'married' ? 2 : 1)
    return { tax: [{ label: 'Illinois income tax (4.95%)', amount: i.rate * pos(wages - exemption) }] }
  },

  GA: ({ wages, filing }) => ({
    tax: [{ label: 'Georgia income tax (4.99%)', amount: US.ga.rate * pos(wages - US.ga.standardDeduction[filing]) }],
  }),
}
