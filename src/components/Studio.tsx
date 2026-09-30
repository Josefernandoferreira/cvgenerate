import { useEffect, useRef, useState } from 'react'
import type { AccentId, CoverLetter, CVData, CvLang, DocMode, LayoutId, RegionId } from '../types'
import { downloadPdf, filenameFrom } from '../lib/exportPdf'
import { RegionProvider } from '../lib/regionContext'
import { REGIONS } from '../lib/regions'
import { LETTER_COPY } from '../lib/coverLetter'
import { Editor } from './Editor'
import { ImportButton } from './ImportButton'
import { LangPicker } from './LangPicker'
import { LayoutPicker } from './LayoutPicker'
import { LetterEditor } from './LetterEditor'
import { Preview } from './Preview'
import { isSparseCv } from '../lib/importFile'
import { useToast } from '../lib/toast'

type Props = {
  cv: CVData
  letter: CoverLetter
  mode: DocMode
  layout: LayoutId
  accent: AccentId
  region: RegionId
  lang: CvLang
  busy?: boolean
  translating?: boolean
  onCv: (cv: CVData) => void
  onLetter: (letter: CoverLetter) => void
  onMode: (mode: DocMode) => void
  onLayout: (id: LayoutId) => void
  onAccent: (id: AccentId) => void
  onRegion: (id: RegionId) => void
  onLang: (id: CvLang) => void
  onImport: (file: File) => void
  onReset: () => void
}

export function Studio({
  cv,
  letter,
  mode,
  layout,
  accent,
  region,
  lang,
  busy,
  translating,
  onCv,
  onLetter,
  onMode,
  onLayout,
  onAccent,
  onRegion,
  onLang,
  onImport,
  onReset,
}: Props) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const { push } = useToast()
  const empty = isSparseCv(cv)
  const [panel, setPanel] = useState<'edit' | 'layout'>('layout')
  const profile = REGIONS[region]

  useEffect(() => {
    document.documentElement.dataset.paper = profile.paper
  }, [profile.paper])

  async function exportNow() {
    if (!pageRef.current) return
    setExporting(true)
    push('Gerando PDF…', 'info')
    try {
      const suffix =
        mode === 'letter'
          ? lang === 'en'
            ? 'cover-letter'
            : 'carta'
          : lang === 'en'
            ? 'resume'
            : lang === 'es'
              ? 'cv'
              : 'curriculo'
      await downloadPdf(pageRef.current, filenameFrom(cv.name, suffix), profile.paper, accent)
      push('PDF gerado. Confira o download.')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error(err)
      push(err instanceof Error ? err.message : 'Não foi possível gerar o PDF. Tente de novo.', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <RegionProvider region={region} lang={lang}>
      <style>{`@page { size: ${profile.paper === 'letter' ? 'letter' : 'A4'}; margin: 0; }`}</style>
      <div className="studio">
        <header className="chrome">
          <button type="button" className="wordmark" onClick={onReset}>
            Folio
          </button>
          <div className="chrome-tabs">
            <button type="button" className={mode === 'cv' ? 'is-on' : ''} onClick={() => onMode('cv')}>
              Currículo
            </button>
            <button type="button" className={mode === 'letter' ? 'is-on' : ''} onClick={() => onMode('letter')}>
              {LETTER_COPY[lang].mode}
            </button>
          </div>
          <div className="chrome-tabs">
            <button
              type="button"
              className={panel === 'layout' ? 'is-on' : ''}
              onClick={() => setPanel('layout')}
            >
              Destino
            </button>
            <button
              type="button"
              className={panel === 'edit' ? 'is-on' : ''}
              onClick={() => setPanel('edit')}
            >
              Editar
            </button>
          </div>
          <div className="chrome-actions">
            <LangPicker lang={lang} busy={translating} compact onLang={onLang} />
            <span className="region-chip">
              {profile.flag} {profile.formal}
            </span>
            <ImportButton onFile={onImport} busy={busy} label="Importar novo" />
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const payload = { cv, letter, layout, accent, region, lang, mode }
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${(cv.name || 'curriculo').toLowerCase().replace(/\s+/g, '-')}.json`
                a.click()
                URL.revokeObjectURL(url)
                push('JSON baixado.')
              }}
            >
              JSON
            </button>
            <button type="button" className="btn ghost" onClick={() => window.print()}>
              Imprimir
            </button>
            <button type="button" className="btn solid" disabled={exporting} onClick={exportNow}>
              {exporting ? 'Gerando…' : 'Baixar PDF'}
            </button>
          </div>
        </header>

        <div className="studio-body">
          <aside className="rail">
            <div className="import-panel">
              <p className="picker-label">Arquivo</p>
              <ImportButton onFile={onImport} busy={busy} label="Importar novo" hint />
            </div>
            {panel === 'layout' ? (
              <LayoutPicker
                layout={layout}
                accent={accent}
                region={region}
                lang={lang}
                mode={mode}
                translating={translating}
                onLayout={onLayout}
                onAccent={onAccent}
                onRegion={onRegion}
                onLang={onLang}
              />
            ) : mode === 'letter' ? (
              <LetterEditor cv={cv} letter={letter} lang={lang} onChange={onLetter} />
            ) : (
              <Editor cv={cv} onChange={onCv} />
            )}
          </aside>
          <div className="stage-wrap">
            {empty && mode === 'cv' && (
              <div className="empty-import">
                <p>Nada foi importado ainda.</p>
                <ImportButton onFile={onImport} busy={busy} label="Importar novo" hint />
              </div>
            )}
            <Preview
              cv={cv}
              letter={letter}
              mode={mode}
              layout={layout}
              accent={accent}
              paper={profile.paper}
              pageRef={pageRef}
            />
          </div>
        </div>
      </div>
    </RegionProvider>
  )
}
