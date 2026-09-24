import { fromThresholds } from '../engine/progressive'

/** Spain 2026 — IRPF (annual Renta liability) and employee Social Security. */
export const ES = {
  stateScale: fromThresholds([
    [0, 0.095], [12_450, 0.12], [20_200, 0.15], [35_200, 0.185], [60_000, 0.225], [300_000, 0.245],
  ]),
  stateMinimum: 5_550,
  otherExpenses: 2_000,
  /** Art. 20 LIRPF reduction on net work income (gross − SS). */
  workReduction: { lowRN: 14_852, midRN: 17_673.52, highRN: 19_747.5, max: 7_302, midMax: 2_364.34, slope1: 1.75, slope2: 1.14 },
  /** DA 61 LIRPF (RD-ley 5/2026) low-income credit. */
  smiCredit: { full: 590.89, smi: 17_094, limit: 20_048.45, slope: 0.2 },
  /** Employee plan de pensiones de empleo cap (1,500 individual + 8,500 company plan). */
  pensionCap: 10_000,
  ss: {
    rate: 0.047 + 0.0155 + 0.001 + 0.0015, // CC + desempleo (indefinido) + FP + MEI = 6.50%
    maxBaseMonthly: 5_101.2,
    /** Cuota de solidaridad, employee share, on monthly pay above the max base. */
    solidarity: [
      { upTo: 5_611.32, rate: 0.0019 },
      { upTo: 7_651.8, rate: 0.0021 },
      { upTo: Infinity, rate: 0.0024 },
    ],
  },
  regions: {
    madrid: {
      name: 'Madrid',
      minimum: 5_956.65,
      scale: fromThresholds([[0, 0.085], [13_362.22, 0.107], [19_004.63, 0.128], [35_425.68, 0.174], [57_320.4, 0.205]]),
    },
    cataluna: {
      name: 'Cataluña',
      minimum: 5_550,
      scale: fromThresholds([
        [0, 0.095], [12_500, 0.125], [22_000, 0.16], [33_000, 0.19], [53_000, 0.215], [90_000, 0.235], [120_000, 0.245], [175_000, 0.255],
      ]),
    },
    andalucia: {
      name: 'Andalucía',
      minimum: 5_790,
      scale: fromThresholds([[0, 0.095], [13_000, 0.12], [21_100, 0.15], [35_200, 0.185], [60_000, 0.225]]),
    },
    valencia: {
      name: 'C. Valenciana',
      minimum: 6_105,
      scale: fromThresholds([
        [0, 0.088], [12_000, 0.117], [22_000, 0.146], [32_000, 0.17], [42_000, 0.194], [52_000, 0.219],
        [62_000, 0.244], [72_000, 0.261], [100_000, 0.2735], [150_000, 0.2835], [200_000, 0.2935],
      ]),
    },
    generic: {
      name: 'Other regions (approx.)',
      minimum: 5_550,
      scale: fromThresholds([
        [0, 0.095], [12_450, 0.12], [20_200, 0.15], [35_200, 0.185], [60_000, 0.225], [300_000, 0.245],
      ]),
    },
  },
  bizkaia: {
    scale: fromThresholds([
      [0, 0.23], [18_080, 0.28], [36_160, 0.35], [54_240, 0.4], [77_450, 0.45], [107_260, 0.46], [142_960, 0.47], [208_390, 0.49],
    ]),
    credit: 1_615,
    /** Art. 23 NF 13/2013 work-income allowance on (gross − SS). */
    workAllowance: { low: 14_800, high: 23_000, max: 8_000, min: 3_000, slope: 0.6098 },
    pensionCap: 10_000,
  },
} as const

export type SpainRegion = keyof typeof ES.regions
