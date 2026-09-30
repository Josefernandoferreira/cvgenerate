import { useRef, useState } from 'react'
import type { RegionId } from '../types'
import { ImportButton } from './ImportButton'
import { RegionPicker } from './RegionPicker'

type Props = {
  busy: boolean
  region: RegionId
  onRegion: (id: RegionId) => void
  onFile: (file: File) => void
  onSample: () => void
  onBlank: () => void
}

export function Landing({ busy, region, onRegion, onFile, onSample, onBlank }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function take(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <main className="landing">
      <div className="landing-inner">
        <p className="eyebrow">Folio</p>
        <h1>
          Seu LinkedIn,
          <br />
          tipografado.
        </h1>
        <p className="lede">
          Importe o PDF do LinkedIn e formate no padrão do destino: currículo brasileiro, CV europeu
          ou resume americano.
        </p>

        <RegionPicker region={region} onRegion={onRegion} compact />

        <div
          className={`dropzone ${over ? 'is-over' : ''} ${busy ? 'is-busy' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            take(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.zip,.json,application/pdf,application/zip,application/json"
            hidden
            onChange={(e) => {
              take(e.target.files)
              e.target.value = ''
            }}
          />
          <strong>{busy ? 'Lendo o arquivo…' : 'Solte o PDF do LinkedIn aqui'}</strong>
          <span>ou clique para escolher · PDF, ZIP de dados ou JSON</span>
        </div>

        <div className="landing-actions">
          <ImportButton onFile={onFile} busy={busy} label="Escolher arquivo" />
          <button type="button" className="btn ghost" onClick={onSample}>
            Ver um exemplo
          </button>
          <button type="button" className="btn ghost" onClick={onBlank}>
            Começar em branco
          </button>
          <a className="btn ghost" href="/sample-linkedin.pdf" download>
            Baixar PDF de teste
          </a>
        </div>

        <ol className="howto">
          <li>
            No LinkedIn, abra seu perfil e toque em <em>Recursos</em> → <em>Salvar em PDF</em>.
          </li>
          <li>Traga o arquivo para cá. O Folio extrai nome, cargos, formação e competências.</li>
          <li>Escolha o destino (Brasil, Europa ou EUA), o layout, e baixe o PDF.</li>
        </ol>
      </div>
    </main>
  )
}
