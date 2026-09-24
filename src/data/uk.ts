import { fromThresholds } from '../engine/progressive'

/** United Kingdom 2026/27 tax year (6 Apr 2026 – 5 Apr 2027). */
export const UK = {
  personalAllowance: 12_570,
  taperStart: 100_000,
  rUK: fromThresholds([[0, 0.2], [37_700, 0.4], [125_140, 0.45]]),
  scotland: fromThresholds([[0, 0.19], [3_967, 0.2], [16_956, 0.21], [31_092, 0.42], [62_430, 0.45], [125_140, 0.48]]),
  nic: { pt: 12_570, uel: 50_270, main: 0.08, upper: 0.02 },
  /** Annual allowance for pension contributions. */
  pensionCap: 60_000,
} as const
