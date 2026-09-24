import { SOURCES } from '../data/sources'
import { JURISDICTIONS } from '../engine/registry'

export function Footer() {
  const caveats = JURISDICTIONS.filter((j) => j.caveat)
  return (
    <footer className="space-y-3 border-t border-line pt-5 text-xs leading-relaxed text-muted">
      <p>
        <strong className="font-medium text-ink-2">Estimates only.</strong> Based on 2026 rules for an employee with no other
        income, standard allowances and no dependants. Single filer unless married is selected (US married filing jointly;
        Ireland married one earner). Figures are annual liabilities (Spain: Renta; UK: tax year 2026/27), which can
        differ from monthly payroll withholding. Not tax advice.
      </p>
      <ul className="space-y-0.5">
        {caveats.map((j) => (
          <li key={j.id}>
            • {j.label}: {j.caveat}
          </li>
        ))}
        <li>• Ireland PRSI blends 4.20% (Jan–Sep) and 4.35% (Oct–Dec 2026).</li>
        <li>• Exchange rates: ECB reference rates via frankfurter.dev (editable). Comparisons show nominal values, not purchasing power.</li>
      </ul>
      <details className="group">
        <summary className="cursor-pointer select-none font-medium text-ink-2 hover:text-ink">Sources</summary>
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SOURCES).map(([country, list]) => (
            <div key={country}>
              <div className="mb-1 font-medium text-ink-2">{country}</div>
              <ul className="space-y-0.5">
                {list.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </footer>
  )
}
