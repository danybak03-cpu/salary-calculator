import { fromThresholds } from '../engine/progressive'

/** Ireland 2026 — Income tax, USC and PRSI Class A. */
export const IE = {
  band: { single: 44_000, married: 53_000 },
  personalCredit: { single: 2_000, married: 4_000 },
  employeeCredit: 2_000,
  usc: {
    exemption: 13_000,
    scale: fromThresholds([[0, 0.005], [12_012, 0.02], [28_700, 0.03], [70_044, 0.08]]),
  },
  prsi: {
    weeklyThreshold: 352,
    /** 4.20% to 30 Sep 2026 (39 weeks), 4.35% from 1 Oct 2026 (13 weeks). */
    rateWeeks: [
      { weeks: 39, rate: 0.042 },
      { weeks: 13, rate: 0.0435 },
    ],
    credit: { max: 12, from: 352.01, to: 424, divisor: 6 },
  },
  /** Max age-related relief (40%) on earnings up to 115,000. */
  pensionReliefCap: { pct: 0.4, earningsCap: 115_000 },
} as const
