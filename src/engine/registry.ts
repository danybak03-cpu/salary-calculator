import { computeCanada } from './canada'
import { computeIreland } from './ireland'
import { computeBizkaia, computeSpain } from './spain'
import type { Jurisdiction } from './types'
import { computeUK } from './uk'
import { computeUS, STATES } from './us'

const US_CAVEAT_CA = 'California 2026 brackets not yet published — 2025 indexed brackets used (EDD 2026 tables).'

const us = (code: string, label: string, caveat?: string): Jurisdiction => ({
  id: `us-${code.toLowerCase()}`,
  label: `US — ${label}`,
  short: code === 'NYC' ? 'NYC' : `US-${code}`,
  region: 'US',
  country: 'United States',
  flag: '🇺🇸',
  currency: 'USD',
  supportsMarried: true,
  caveat,
  compute: (i) => computeUS(STATES[code], i),
})

export const JURISDICTIONS: Jurisdiction[] = [
  { id: 'es-madrid', label: 'Spain — Madrid', short: 'ES-Madrid', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, compute: (i) => computeSpain('madrid', i) },
  { id: 'es-cataluna', label: 'Spain — Cataluña', short: 'ES-Cataluña', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, compute: (i) => computeSpain('cataluna', i) },
  { id: 'es-andalucia', label: 'Spain — Andalucía', short: 'ES-Andalucía', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, compute: (i) => computeSpain('andalucia', i) },
  { id: 'es-valencia', label: 'Spain — C. Valenciana', short: 'ES-Valencia', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, compute: (i) => computeSpain('valencia', i) },
  { id: 'es-bizkaia', label: 'Spain — País Vasco (Bizkaia)', short: 'ES-Bizkaia', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, compute: computeBizkaia },
  { id: 'es-generic', label: 'Spain — other regions (approx.)', short: 'ES-Other', region: 'Europe', country: 'Spain', flag: '🇪🇸', currency: 'EUR', supportsMarried: false, caveat: 'Regional half approximated with the state scale.', compute: (i) => computeSpain('generic', i) },
  { id: 'ie', label: 'Ireland', short: 'Ireland', region: 'Europe', country: 'Ireland', flag: '🇮🇪', currency: 'EUR', supportsMarried: true, compute: computeIreland },
  { id: 'uk', label: 'UK — England, Wales & NI', short: 'UK', region: 'Europe', country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', supportsMarried: false, compute: (i) => computeUK(false, i) },
  { id: 'uk-scotland', label: 'UK — Scotland', short: 'UK-Scotland', region: 'Europe', country: 'United Kingdom', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', currency: 'GBP', supportsMarried: false, compute: (i) => computeUK(true, i) },
  us('CA', 'California', US_CAVEAT_CA),
  us('NY', 'New York'),
  us('NYC', 'New York City'),
  us('TX', 'Texas'),
  us('FL', 'Florida'),
  us('WA', 'Washington'),
  us('NC', 'North Carolina'),
  us('MA', 'Massachusetts'),
  us('IL', 'Illinois'),
  us('GA', 'Georgia'),
  { id: 'ca-on', label: 'Canada — Ontario', short: 'CA-ON', region: 'Canada', country: 'Canada', flag: '🇨🇦', currency: 'CAD', supportsMarried: false, compute: (i) => computeCanada('ON', i) },
  { id: 'ca-bc', label: 'Canada — British Columbia', short: 'CA-BC', region: 'Canada', country: 'Canada', flag: '🇨🇦', currency: 'CAD', supportsMarried: false, compute: (i) => computeCanada('BC', i) },
  { id: 'ca-ab', label: 'Canada — Alberta', short: 'CA-AB', region: 'Canada', country: 'Canada', flag: '🇨🇦', currency: 'CAD', supportsMarried: false, compute: (i) => computeCanada('AB', i) },
  { id: 'ca-qc', label: 'Canada — Quebec', short: 'CA-QC', region: 'Canada', country: 'Canada', flag: '🇨🇦', currency: 'CAD', supportsMarried: false, caveat: 'Quebec 24% and 25.75% rates carried over from 2025 (unverified for 2026).', compute: (i) => computeCanada('QC', i) },
]

export const byId = (id: string) => JURISDICTIONS.find((j) => j.id === id) ?? JURISDICTIONS[0]
