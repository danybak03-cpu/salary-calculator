# Take-home pay calculator (2026)

Gross-to-net salary and bonus calculator for Spain (Madrid, Cataluña, Andalucía, C. Valenciana,
Bizkaia and other regions), Ireland, the UK (rUK and Scotland), ten US states or cities (CA, NY, NYC,
TX, FL, WA, NC, MA, IL, GA) and Canada (ON, BC, AB, QC). Every jurisdiction can be compared in one
currency using live ECB exchange rates.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine anchor tests
npm run build
```

## Layout

- `src/data/*.ts`: 2026 parameters for each country, plus `sources.ts` with the official links.
- `src/engine/`: pure tax engines (`spain`, `ireland`, `uk`, `us`, `canada`), `registry.ts` (the only
  list the UI loops over) and `analysis.ts` (marginal rate and bonus = tax(base + bonus) − tax(base)).
- `src/fx/useFx.ts`: fetches ECB rates from frankfurter.dev. Falls back to fixed rates if the fetch
  fails; rate edits are saved in localStorage.
- `src/components/`: the UI (breakdown, bonus, side-by-side, all-jurisdictions chart and table).

## Assumptions

The calculator works out the **annual tax owed**, not what monthly payroll withholds. The employee is
assumed to have no other income, standard allowances and no dependants.

Figures not yet confirmed for 2026:
- California's 2026 brackets aren't published, so the 2025 indexed brackets are used.
- Quebec's 24% and 25.75% rates are carried over from 2025.

To add a jurisdiction, write a `compute(input)` function and register it in `src/engine/registry.ts`.
