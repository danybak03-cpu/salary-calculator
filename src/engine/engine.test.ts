import { describe, expect, it } from 'vitest'
import { bonusImpact, marginalRate } from './analysis'
import { computeCanada } from './canada'
import { computeIreland } from './ireland'
import { byId, JURISDICTIONS } from './registry'
import { computeBizkaia, computeSpain } from './spain'
import type { Line, TaxInput } from './types'
import { computeUK } from './uk'
import { computeUS, nyRecaptureAmounts, nyStateTax, STATES } from './us'

const single = (gross: number, pension = 0): TaxInput => ({ gross, filing: 'single', pension })
const line = (lines: Line[], label: string) => lines.find((l) => l.label.startsWith(label))?.amount ?? 0

describe('UK 2026/27', () => {
  it('£50,000 rUK', () => {
    const r = computeUK(false, single(50_000))
    expect(r.incomeTax).toBeCloseTo(7_486, 2)
    expect(r.social).toBeCloseTo(2_994.4, 2)
  })
  it('£110,000 tapers the personal allowance (62% marginal)', () => {
    const r = computeUK(false, single(110_000))
    expect(r.incomeTax).toBeCloseTo(33_432, 2)
    expect(r.social).toBeCloseTo(4_210.6, 2)
    expect(marginalRate(byId('uk'), single(110_000))).toBeCloseTo(0.62, 3)
  })
  it('£50,000 Scotland', () => {
    expect(computeUK(true, single(50_000)).incomeTax).toBeCloseTo(8_982.05, 2)
  })
  it('salary sacrifice reduces tax and NI', () => {
    const r = computeUK(false, single(50_000, 5_000))
    expect(r.incomeTax).toBeCloseTo(6_486, 2)
    expect(r.social).toBeCloseTo(2_594.4, 2)
  })
})

describe('Spain 2026', () => {
  it('Madrid €40,000', () => {
    const r = computeSpain('madrid', single(40_000))
    expect(r.social).toBeCloseTo(2_600, 2)
    expect(line(r.incomeTaxLines, 'IRPF — state')).toBeCloseTo(3_872.5, 1)
    expect(line(r.incomeTaxLines, 'IRPF — regional')).toBeCloseTo(3_331.82, 1)
  })
  it('Madrid €18,000 gets the art. 20 reduction and the SMI credit', () => {
    const r = computeSpain('madrid', single(18_000))
    expect(line(r.incomeTaxLines, 'Low-income')).toBeCloseTo(-409.69, 1)
    expect(r.incomeTax).toBeCloseTo(534.86, 0)
  })
  it('SMI-level pay pays no IRPF', () => {
    expect(computeSpain('madrid', single(17_094)).incomeTax).toBeCloseTo(0, 2)
  })
  it('SS caps at the max base and adds solidarity above it', () => {
    const r = computeSpain('cataluna', single(120_000))
    expect(line(r.socialLines, 'Social Security')).toBeCloseTo(0.065 * 61_214.4, 2)
    // monthly 10,000: (5,611.32−5,101.20)×0.19% + (7,651.80−5,611.32)×0.21% + (10,000−7,651.80)×0.24%
    const monthly = 510.12 * 0.0019 + 2_040.48 * 0.0021 + 2_348.2 * 0.0024
    expect(line(r.socialLines, 'Solidarity')).toBeCloseTo(monthly * 12, 2)
  })
  it('Bizkaia €40,000', () => {
    expect(computeBizkaia(single(40_000)).incomeTax).toBeCloseTo(7_113, 1)
  })
})

describe('Ireland 2026', () => {
  it('€60,000 single', () => {
    const r = computeIreland(single(60_000))
    expect(line(r.incomeTaxLines, 'Income tax')).toBeCloseTo(11_200, 2)
    expect(line(r.incomeTaxLines, 'Universal')).toBeCloseTo(1_332.82, 2)
    expect(r.social).toBeCloseTo(2_542.5, 2)
  })
  it('USC exempt at €13,000', () => {
    expect(line(computeIreland(single(13_000)).incomeTaxLines, 'Universal')).toBe(0)
  })
})

describe('US 2026', () => {
  it('Texas $100,000 single', () => {
    const r = computeUS(STATES.TX, single(100_000))
    expect(line(r.incomeTaxLines, 'Federal')).toBeCloseTo(13_170, 2)
    expect(r.social).toBeCloseTo(7_650, 2)
  })
  it('North Carolina $100,000 single', () => {
    const r = computeUS(STATES.NC, single(100_000))
    expect(line(r.incomeTaxLines, 'North Carolina')).toBeCloseTo(3_481.28, 1)
  })
  it('401(k) reduces income tax but not FICA', () => {
    const r = computeUS(STATES.TX, single(100_000, 10_000))
    expect(line(r.incomeTaxLines, 'Federal')).toBeCloseTo(13_170 - 2_200, 2)
    expect(r.social).toBeCloseTo(7_650, 2)
    expect(r.pension).toBe(10_000)
  })
  it('NY recapture amounts match IT-2105-I (±2 for official rounding)', () => {
    const official = {
      single: [[567, 2_047], [2_614, 30_172], [32_786, 32_500]],
      married: [[333, 807], [1_140, 3_071], [4_211, 60_350], [64_561, 32_500]],
    } as const
    for (const filing of ['single', 'married'] as const) {
      const first = filing === 'single' ? 5 : 4
      official[filing].forEach(([base, incr], i) => {
        const r = nyRecaptureAmounts(filing, first + i)
        expect(Math.abs(r.base - base)).toBeLessThan(2)
        expect(Math.abs(r.full - r.base - incr)).toBeLessThan(2)
      })
    }
  })
  it('NY flat rate once fully phased in', () => {
    expect(nyStateTax(192_000, 200_000, 'single')).toBeCloseTo(192_000 * 0.059, 2)
    expect(nyStateTax(90_000, 98_000, 'single')).toBeLessThan(90_000 * 0.059)
  })
  it('married filing jointly uses MFJ brackets', () => {
    const r = computeUS(STATES.TX, { gross: 100_000, filing: 'married', pension: 0 })
    // 67,800 taxable: 24,800×10% + 43,000×12%
    expect(line(r.incomeTaxLines, 'Federal')).toBeCloseTo(7_640, 2)
  })
})

describe('Canada 2026', () => {
  it('Ontario C$80,000', () => {
    const r = computeCanada('ON', single(80_000))
    expect(line(r.incomeTaxLines, 'Federal')).toBeCloseTo(9_242.6, 1)
    expect(line(r.incomeTaxLines, 'Ontario income')).toBeCloseTo(4_135.26, 1)
    expect(line(r.incomeTaxLines, 'Ontario Health')).toBe(750)
    expect(r.social).toBeCloseTo(5_569.52, 1)
    expect(r.net).toBeCloseTo(60_302.63, 0)
  })
  it('Quebec C$80,000', () => {
    const r = computeCanada('QC', single(80_000))
    expect(line(r.incomeTaxLines, 'Federal')).toBeCloseTo(9_191.43, 1)
    expect(line(r.incomeTaxLines, 'Quebec abatement')).toBeCloseTo(-1_516.59, 1)
    expect(line(r.incomeTaxLines, 'Quebec income')).toBeCloseTo(9_377.84, 1)
    expect(r.social).toBeCloseTo(5_935, 1)
  })
})

describe('bonus and sanity across all jurisdictions', () => {
  for (const j of JURISDICTIONS) {
    it(`${j.label}: bonus identity, monotonic net, sane rates`, () => {
      const input = single(j.currency === 'GBP' ? 55_000 : 70_000)
      const base = j.compute(input)
      const b = bonusImpact(j, input, 10_000, base)
      expect(b.net).toBeCloseTo(b.total.net - base.net, 6)
      expect(b.total.net).toBeGreaterThan(base.net)
      expect(base.effectiveRate).toBeGreaterThan(0.05)
      expect(base.effectiveRate).toBeLessThan(0.5)
      const m = marginalRate(j, input, base)
      expect(m).toBeGreaterThan(0)
      expect(m).toBeLessThan(0.7)
    })
  }
})
