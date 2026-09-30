import type { CvLang } from '../types'
import { CV_LANGS } from '../lib/cvLang'

type Props = {
  lang: CvLang
  busy?: boolean
  compact?: boolean
  onLang: (id: CvLang) => void
}

export function LangPicker({ lang, busy, compact, onLang }: Props) {
  return (
    <div className={`lang-picker ${compact ? 'is-compact' : ''}`}>
      {!compact && <p className="picker-label">Idioma do currículo</p>}
      <div className="lang-grid" role="group" aria-label="Idioma do currículo">
        {CV_LANGS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lang-card ${lang === item.id ? 'is-on' : ''}`}
            disabled={busy}
            onClick={() => onLang(item.id)}
          >
            <strong>{item.native}</strong>
            {!compact && <span>{item.name}</span>}
          </button>
        ))}
      </div>
      {!compact && (
        <p className="field-hint">
          Traduz resumo, cargos, bullets, formação e certificações via Google Translate. Nome, empresas e escolas ficam iguais.
        </p>
      )}
    </div>
  )
}
