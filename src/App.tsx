import { useEffect, useRef, useState } from 'react'
import { Landing } from './components/Landing'
import { Studio } from './components/Studio'
import { draftCoverLetter, emptyLetter, isLetterSparse } from './lib/coverLetter'
import { emptyCv } from './lib/empty'
import { importCvFile, isSparseCv } from './lib/importFile'
import { organizeCv } from './lib/organize'
import { langName } from './lib/cvLang'
import { adaptCvForRegion, REGIONS } from './lib/regions'
import { loadState, saveState } from './lib/storage'
import { useToast } from './lib/toast'
import { detectCvLang, sourceLangFor, translateCoverLetter, translateCv, cvTextBlob } from './lib/translateCv'
import { looksPortuguese } from './lib/translateOffline'
import { sampleCv } from './sample'
import type { AccentId, CoverLetter, CVData, CvLang, DocMode, LayoutId, RegionId } from './types'

export default function App() {
  const [started, setStarted] = useState(() => Boolean(loadState()))
  const [cv, setCv] = useState<CVData>(() => organizeCv(loadState()?.cv ?? emptyCv()))
  const [layout, setLayout] = useState<LayoutId>(() => loadState()?.layout ?? 'classic')
  const [accent, setAccent] = useState<AccentId>(() => loadState()?.accent ?? 'copper')
  const [region, setRegion] = useState<RegionId>(() => loadState()?.region ?? 'br')
  const [lang, setLang] = useState<CvLang>(() => loadState()?.lang ?? 'pt')
  const [letter, setLetter] = useState<CoverLetter>(() => loadState()?.letter ?? emptyLetter(loadState()?.lang ?? 'pt'))
  const [mode, setMode] = useState<DocMode>(() => loadState()?.mode ?? 'cv')
  const [busy, setBusy] = useState(false)
  const [translating, setTranslating] = useState(false)
  const { push } = useToast()
  const translateSeq = useRef(0)

  useEffect(() => {
    setCv((current) => organizeCv(current))
  }, [])

  useEffect(() => {
    if (started) saveState({ cv, letter, mode, layout, accent, region, lang })
  }, [cv, letter, mode, layout, accent, region, lang, started])

  function applyRegion(id: RegionId, announce = true) {
    const profile = REGIONS[id]
    setRegion(id)
    setCv((current) => adaptCvForRegion(current, id))
    setLayout(profile.preferredLayout)
    setAccent(profile.preferredAccent)
    if (announce && started) {
      push(
        `Padrão ${profile.name}: ${profile.formal}, papel ${profile.paper === 'letter' ? 'Letter' : 'A4'}.`,
      )
    }
  }

  function applyMode(next: DocMode) {
    setMode(next)
    if (next === 'letter' && isLetterSparse(letter)) {
      setLetter(draftCoverLetter(cv, lang, letter))
      push('Carta gerada no padrão internacional a partir do currículo.')
    }
  }

  async function applyLang(next: CvLang) {
    const blob = cvTextBlob(cv)
    const source =
      next !== 'pt' && (lang === 'pt' || looksPortuguese(blob))
        ? 'pt'
        : lang !== next
          ? lang
          : sourceLangFor(cv, next)
    if (source === next) return
    const mine = ++translateSeq.current
    setTranslating(true)
    push(`Traduzindo para ${langName(next)}…`, 'info')
    try {
      const [translated, translatedLetter] = await Promise.all([
        translateCv(cv, next, source),
        translateCoverLetter(letter, next, source),
      ])
      if (mine !== translateSeq.current) return
      setCv(translated)
      setLetter(translatedLetter)
      setLang(next)
      push(mode === 'letter' ? `Carta em ${langName(next)}.` : `Currículo em ${langName(next)}.`)
    } catch {
      if (mine !== translateSeq.current) return
      push('Não foi possível traduzir agora. Tente de novo.', 'error')
    } finally {
      if (mine === translateSeq.current) setTranslating(false)
    }
  }

  async function ingest(file: File) {
    setBusy(true)
    push(`Lendo ${file.name}…`, 'info')
    try {
      const next = await importCvFile(file)
      if (isSparseCv(next)) {
        throw new Error(
          'O arquivo abriu, mas não trouxe nome nem experiências. Use o PDF do LinkedIn: Recursos → Salvar em PDF.',
        )
      }
      setCv(adaptCvForRegion(next, region))
      setLang(looksPortuguese(cvTextBlob(next)) ? 'pt' : detectCvLang(next))
      setLetter(emptyLetter(looksPortuguese(cvTextBlob(next)) ? 'pt' : detectCvLang(next)))
      setStarted(true)
      push(`Importado: ${next.name || file.name}. ${next.experience.length} experiência(s) lidas.`)
    } catch (err) {
      push(err instanceof Error ? err.message : 'Não foi possível ler o arquivo.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!started) {
    return (
      <Landing
        busy={busy}
        region={region}
        onRegion={(id) => applyRegion(id, false)}
        onFile={ingest}
        onSample={() => {
          setCv(adaptCvForRegion(sampleCv, region))
          setLang(detectCvLang(sampleCv))
          setLayout(REGIONS[region].preferredLayout)
          setAccent(REGIONS[region].preferredAccent)
          setStarted(true)
          push('Exemplo carregado. Ajuste o destino e exporte.')
        }}
        onBlank={() => {
          setCv(emptyCv())
          setStarted(true)
          push('Currículo em branco. Preencha no editor.')
        }}
      />
    )
  }

  return (
    <Studio
      cv={cv}
      letter={letter}
      mode={mode}
      layout={layout}
      accent={accent}
      region={region}
      lang={lang}
      busy={busy}
      translating={translating}
      onCv={setCv}
      onLetter={setLetter}
      onMode={applyMode}
      onLayout={setLayout}
      onAccent={setAccent}
      onRegion={applyRegion}
      onLang={applyLang}
      onImport={ingest}
      onReset={() => {
        setStarted(false)
      }}
    />
  )
}
