export type Filing = 'single' | 'married'
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD'
export type Region = 'Europe' | 'US' | 'Canada'

export interface TaxInput {
  /** Annual gross pay in the jurisdiction's local currency. */
  gross: number
  filing: Filing
  /** Requested pre-tax pension contribution (absolute, local currency). Engines apply local caps. */
  pension: number
}

export interface Line {
  label: string
  amount: number
}

export interface TaxResult {
  gross: number
  /** Pension contribution actually applied after caps. */
  pension: number
  incomeTaxLines: Line[]
  socialLines: Line[]
  incomeTax: number
  social: number
  net: number
  /** (income tax + social) / gross */
  effectiveRate: number
  notes: string[]
}

export interface Jurisdiction {
  id: string
  label: string
  short: string
  region: Region
  country: string
  flag: string
  currency: Currency
  supportsMarried: boolean
  /** Shown when the parameters are not fully confirmed for 2026. */
  caveat?: string
  compute: (input: TaxInput) => TaxResult
}
