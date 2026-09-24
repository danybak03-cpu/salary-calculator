import { fromThresholds } from '../engine/progressive'

/** Canada 2026 — federal, CPP/QPP, EI, QPIP and provincial parameters (annual rates). */
export const CA = {
  federal: {
    scale: fromThresholds([[0, 0.14], [58_523, 0.205], [117_045, 0.26], [181_440, 0.29], [258_482, 0.33]]),
    creditRate: 0.14,
    bpa: { max: 16_452, min: 14_829, phaseStart: 181_440, phaseEnd: 258_482 },
    employmentAmount: 1_501,
    quebecAbatement: 0.165,
  },
  cpp: { ympe: 74_600, yampe: 85_000, exemption: 3_500, rate: 0.0595, baseRate: 0.0495, cpp2Rate: 0.04 },
  qpp: { ympe: 74_600, yampe: 85_000, exemption: 3_500, rate: 0.063, baseRate: 0.053, cpp2Rate: 0.04 },
  ei: { maxInsurable: 68_900, rate: 0.0163, quebecRate: 0.013 },
  qpip: { maxInsurable: 103_000, rate: 0.0043 },
  /** RRSP: 18% of earned income up to the 2026 dollar limit. */
  rrsp: { pct: 0.18, limit: 33_810 },

  on: {
    scale: fromThresholds([[0, 0.0505], [53_891, 0.0915], [107_785, 0.1116], [150_000, 0.1216], [220_000, 0.1316]]),
    bpa: 12_989,
    surtax: [
      { threshold: 5_818, rate: 0.2 },
      { threshold: 7_446, rate: 0.36 },
    ],
    reductionBase: 300,
    /** Ontario Health Premium: [from, to, base, rate, cap] on taxable income. */
    healthPremium: [
      [20_000, 36_000, 0, 0.06, 300],
      [36_000, 48_000, 300, 0.06, 450],
      [48_000, 72_000, 450, 0.25, 600],
      [72_000, 200_000, 600, 0.25, 750],
      [200_000, Infinity, 750, 0.25, 900],
    ] as const,
  },
  bc: {
    scale: fromThresholds([[0, 0.056], [50_363, 0.077], [100_728, 0.105], [115_648, 0.1229], [140_430, 0.147], [190_405, 0.168], [265_545, 0.205]]),
    bpa: 13_216,
    reduction: { max: 690, threshold: 25_570, rate: 0.0356 },
  },
  ab: {
    scale: fromThresholds([[0, 0.08], [61_200, 0.1], [154_259, 0.12], [185_111, 0.13], [246_813, 0.14], [370_220, 0.15]]),
    bpa: 22_769,
    supplemental: { floor: 4_896, rate: 0.25 },
  },
  qc: {
    /** Top two rates carried over from 2025 (not confirmed in a primary source). */
    scale: fromThresholds([[0, 0.14], [54_345, 0.19], [108_680, 0.24], [132_245, 0.2575]]),
    bpa: 18_952,
    creditRate: 0.14,
    employmentDeduction: { rate: 0.06, max: 1_450 },
  },
} as const
