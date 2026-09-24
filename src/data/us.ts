import { fromThresholds } from '../engine/progressive'

/** United States 2026 — federal (Rev. Proc. 2025-32, post-OBBBA) and state parameters. */
export const US = {
  federal: {
    single: fromThresholds([[0, 0.1], [12_400, 0.12], [50_400, 0.22], [105_700, 0.24], [201_775, 0.32], [256_225, 0.35], [640_600, 0.37]]),
    married: fromThresholds([[0, 0.1], [24_800, 0.12], [100_800, 0.22], [211_400, 0.24], [403_550, 0.32], [512_450, 0.35], [768_700, 0.37]]),
    standardDeduction: { single: 16_100, married: 32_200 },
  },
  fica: {
    ssRate: 0.062,
    ssWageBase: 184_500,
    medicare: 0.0145,
    addlMedicare: 0.009,
    addlThreshold: { single: 200_000, married: 250_000 },
  },
  k401Limit: 24_500,

  /** California — 2026 brackets not yet published; EDD 2026 tables use the 2025 indexed figures. */
  ca: {
    single: fromThresholds([[0, 0.01], [11_079, 0.02], [26_264, 0.04], [41_452, 0.06], [57_542, 0.08], [72_724, 0.093], [371_479, 0.103], [445_771, 0.113], [742_953, 0.123]]),
    married: fromThresholds([[0, 0.01], [22_158, 0.02], [52_528, 0.04], [82_904, 0.06], [115_084, 0.08], [145_448, 0.093], [742_958, 0.103], [891_542, 0.113], [1_485_906, 0.123]]),
    standardDeduction: { single: 5_706, married: 11_412 },
    exemptionCredit: { single: 153, married: 306 },
    /** Exemption credit phase-out: $6 per $2,500 of AGI over the threshold (per credit). 2025 thresholds. */
    exemptionPhaseout: { single: 252_203, married: 504_411, step: 2_500, reduction: 6 },
    mhst: { threshold: 1_000_000, rate: 0.01 },
    sdi: 0.013,
  },

  ny: {
    single: fromThresholds([[0, 0.039], [8_500, 0.044], [11_700, 0.0515], [13_900, 0.054], [80_650, 0.059], [215_400, 0.0685], [1_077_550, 0.0965], [5_000_000, 0.103], [25_000_000, 0.109]]),
    married: fromThresholds([[0, 0.039], [17_150, 0.044], [23_600, 0.0515], [27_900, 0.054], [161_550, 0.059], [323_200, 0.0685], [2_155_350, 0.0965], [5_000_000, 0.103], [25_000_000, 0.109]]),
    standardDeduction: { single: 8_000, married: 16_050 },
    /** Supplemental tax (benefit recapture) — IT-2105-I tax computation worksheets. */
    recapture: { agiStart: 107_650, phaseIn: 50_000, allIncomeTopRateAgi: 25_000_000, firstBracket: { single: 4, married: 3 } },
    pfl: { rate: 0.00432, cap: 411.91 },
    sdi: { rate: 0.005, cap: 31.2 },
  },
  nyc: {
    single: fromThresholds([[0, 0.03078], [12_000, 0.03762], [25_000, 0.03819], [50_000, 0.03876]]),
    married: fromThresholds([[0, 0.03078], [21_600, 0.03762], [45_000, 0.03819], [90_000, 0.03876]]),
  },
  wa: { pfml: { rate: 0.00807, cap: 184_500 }, cares: 0.0058 },
  nc: { rate: 0.0399, standardDeduction: { single: 12_750, married: 25_500 } },
  ma: {
    rate: 0.05,
    surtax: { rate: 0.04, threshold: 1_107_750 },
    exemption: { single: 4_400, married: 8_800 },
    /** Deduction for employee FICA contributions, max $2,000 per person. */
    ficaDeductionCap: 2_000,
    pfml: { rate: 0.0046, cap: 184_500 },
  },
  il: { rate: 0.0495, exemption: 2_925, exemptionAgiLimit: { single: 250_000, married: 500_000 } },
  ga: { rate: 0.0499, standardDeduction: { single: 15_000, married: 30_000 } },
} as const
