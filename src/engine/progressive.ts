import type { Line, TaxResult } from './types'

/** A bracket applies its rate to income up to `upTo` (use Infinity for the top band). */
export interface Bracket {
  upTo: number
  rate: number
}

export function progressive(amount: number, brackets: readonly Bracket[]): number {
  let tax = 0
  let lower = 0
  for (const b of brackets) {
    if (amount <= lower) break
    tax += (Math.min(amount, b.upTo) - lower) * b.rate
    lower = b.upTo
  }
  return tax
}

/** Rate of the bracket containing `amount`. */
export function bracketRate(amount: number, brackets: readonly Bracket[]): number {
  return (brackets.find((b) => amount <= b.upTo) ?? brackets[brackets.length - 1]).rate
}

/** Build brackets from `[threshold, rate]` pairs, where each rate applies from its threshold upward. */
export function fromThresholds(pairs: readonly (readonly [number, number])[]): Bracket[] {
  return pairs.map(([, rate], i) => ({ upTo: i + 1 < pairs.length ? pairs[i + 1][0] : Infinity, rate }))
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
export const pos = (x: number) => Math.max(0, x)

const sum = (lines: Line[]) => lines.reduce((s, l) => s + l.amount, 0)

export function finalize(
  gross: number,
  pension: number,
  incomeTaxLines: Line[],
  socialLines: Line[],
  notes: string[] = [],
): TaxResult {
  const incomeTax = sum(incomeTaxLines)
  const social = sum(socialLines)
  return {
    gross,
    pension,
    incomeTaxLines: incomeTaxLines.filter((l) => Math.abs(l.amount) > 0.005),
    socialLines: socialLines.filter((l) => Math.abs(l.amount) > 0.005),
    incomeTax,
    social,
    net: gross - pension - incomeTax - social,
    effectiveRate: gross > 0 ? (incomeTax + social) / gross : 0,
    notes,
  }
}
