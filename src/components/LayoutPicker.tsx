import type { AccentId, LayoutId, RegionId, CvLang, DocMode } from '../types'
import { ACCENTS, LAYOUTS } from '../types'
import { LETTER_COPY } from '../lib/coverLetter'
import { LangPicker } from './LangPicker'
import { RegionPicker } from './RegionPicker'

type Props = {
  layout: LayoutId
  accent: AccentId
  region: RegionId
  lang: CvLang
  mode?: DocMode
  translating?: boolean
  onLayout: (id: LayoutId) => void
  onAccent: (id: AccentId) => void
  onRegion: (id: RegionId) => void
  onLang: (id: CvLang) => void
}

export function LayoutPicker({
  layout,
  accent,
  region,
  lang,
  mode = 'cv',
  translating,
  onLayout,
  onAccent,
  onRegion,
  onLang,
}: Props) {
  return (
    <div className="picker">
      <RegionPicker region={region} onRegion={onRegion} />
      <LangPicker lang={lang} busy={translating} onLang={onLang} />
      {mode === 'letter' ? (
        <p className="field-hint">
          {LETTER_COPY[lang].title} no padrão internacional. Papel {region === 'us' ? 'Letter' : 'A4'},
          idioma e cor seguem o destino.
        </p>
      ) : (
        <>
          <p className="picker-label">Layout</p>
          <div className="layout-grid">
            {LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`layout-card ${layout === item.id ? 'is-on' : ''}`}
                onClick={() => onLayout(item.id)}
              >
                <Mini layout={item.id} accent={ACCENTS[accent]} />
                <span>
                  <strong>{item.name}</strong>
                  {item.blurb}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <p className="picker-label">Cor</p>
      <div className="swatches">
        {(Object.keys(ACCENTS) as AccentId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`swatch ${accent === id ? 'is-on' : ''}`}
            style={{ background: ACCENTS[id] }}
            aria-label={id}
            onClick={() => onAccent(id)}
          />
        ))}
      </div>
    </div>
  )
}

function Mini({ layout, accent }: { layout: LayoutId; accent: string }) {
  return (
    <div className={`mini mini-${layout}`} style={{ ['--m' as string]: accent }}>
      <i />
      <i />
      <i />
      <i />
    </div>
  )
}
