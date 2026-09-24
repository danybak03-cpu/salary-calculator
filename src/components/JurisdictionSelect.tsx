import { JURISDICTIONS } from '../engine/registry'
import type { Region } from '../engine/types'
import { inputClass } from './ui'

const GROUPS: { region: Region; label: string }[] = [
  { region: 'Europe', label: 'Europe' },
  { region: 'US', label: 'United States' },
  { region: 'Canada', label: 'Canada' },
]

export function JurisdictionSelect({ id, value, onChange, className = '' }: {
  id?: string
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${className}`}>
      {GROUPS.map((g) => (
        <optgroup key={g.region} label={g.label}>
          {JURISDICTIONS.filter((j) => j.region === g.region).map((j) => (
            <option key={j.id} value={j.id}>
              {j.flag} {j.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
