import { useCallback, useEffect, useMemo } from 'react'
import { AllJurisdictions } from './components/AllJurisdictions'
import { BonusCard } from './components/BonusCard'
import { BreakdownCard } from './components/BreakdownCard'
import { CompareTwo } from './components/CompareTwo'
import { Footer } from './components/Footer'
import { FxPanel } from './components/FxPanel'
import { Header } from './components/Header'
import { InputPanel } from './components/InputPanel'
import { byId, JURISDICTIONS } from './engine/registry'
import type { Currency } from './engine/types'
import { useFx } from './fx/useFx'
import { evaluate, type Evaluation, type Settings } from './lib/evaluate'
import { money } from './lib/format'
import { usePersistent } from './lib/usePersistent'

const DEFAULTS: Settings = {
  jid: 'es-madrid',
  gross: 60_000,
  inputCurrency: 'EUR',
  bonus: 10_000,
  filing: 'single',
  pensionPct: 0,
  period: 'year',
  display: 'EUR',
}

const prefersDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export default function App() {
  const fx = useFx()
  const [s, setS] = usePersistent<Settings>('settings', DEFAULTS)
  const [cmp, setCmp] = usePersistent('compare', { a: 'es-madrid', b: 'us-nc' })
  const [showLocal, setShowLocal] = usePersistent('show-local', true)
  const [dark, setDark] = usePersistent('dark', prefersDark())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }))

  /** Changing currency converts the typed amounts so the salary stays equivalent. */
  const changeInputCurrency = (c: Currency) =>
    setS((p) => {
      if (c === p.inputCurrency) return p
      const round = (x: number) => Math.round(fx.convert(x, p.inputCurrency, c) / 100) * 100
      return { ...p, inputCurrency: c, gross: round(p.gross), bonus: round(p.bonus) }
    })

  const changeJurisdiction = (id: string) => {
    set('jid', id)
    changeInputCurrency(byId(id).currency)
  }

  const evals = useMemo(() => JURISDICTIONS.map((j) => evaluate(j, s, fx)), [s, fx])
  const find = (id: string) => evals.find((e) => e.j.id === id) ?? evals[0]
  const main = find(s.jid)

  const divisor = s.period === 'month' ? 12 : 1
  const periodLabel = s.period === 'month' ? 'per month' : 'per year'
  const conv = useCallback((ev: Evaluation, x: number) => fx.convert(x, ev.j.currency, s.display), [fx, s.display])

  const mainCur: Currency = showLocal ? main.j.currency : s.display
  const mainAmount = (x: number) => fx.convert(x, main.j.currency, mainCur)
  const fmtMain = (x: number) => money(mainAmount(x) / divisor, mainCur)

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:py-10">
      <Header display={s.display} onDisplay={(c) => set('display', c)} dark={dark} onDark={setDark} />

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <InputPanel s={s} set={set} onJurisdiction={changeJurisdiction} onInputCurrency={changeInputCurrency} />
          <FxPanel fx={fx} />
        </aside>

        <main className="min-w-0 space-y-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <BreakdownCard
              ev={main}
              fmt={fmtMain}
              periodLabel={periodLabel}
              showLocal={showLocal}
              onShowLocal={setShowLocal}
              displayCode={s.display}
            />
            <BonusCard
              ev={main}
              fmt={(x) => money(mainAmount(x), mainCur)}
              fmtYear={(x) => money(mainAmount(x), mainCur)}
              fmtMonth={(x) => money(mainAmount(x) / 12, mainCur)}
            />
          </div>

          <CompareTwo
            a={find(cmp.a)}
            b={find(cmp.b)}
            onA={(a) => setCmp((c) => ({ ...c, a }))}
            onB={(b) => setCmp((c) => ({ ...c, b }))}
            conv={conv}
            display={s.display}
            periodLabel={periodLabel}
            divisor={divisor}
          />

          <AllJurisdictions
            evals={evals}
            selected={s.jid}
            onSelect={(id) => set('jid', id)}
            conv={conv}
            display={s.display}
            divisor={divisor}
            periodLabel={periodLabel}
          />
        </main>
      </div>

      <Footer />
    </div>
  )
}
