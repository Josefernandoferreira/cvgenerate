import type { CoverLetter, CVData, CvLang } from '../types'
import { draftCoverLetter, LETTER_COPY } from '../lib/coverLetter'

type Props = {
  cv: CVData
  letter: CoverLetter
  lang: CvLang
  onChange: (letter: CoverLetter) => void
}

export function LetterEditor({ cv, letter, lang, onChange }: Props) {
  const copy = LETTER_COPY[lang]

  function patch(partial: Partial<CoverLetter>) {
    onChange({ ...letter, ...partial })
  }

  return (
    <div className="editor">
      <details open>
        <summary>{copy.title}</summary>
        <p className="field-hint">
          Padrão internacional de uma página: cabeçalho com seus dados, destinatário, corpo e assinatura.
          Papel e idioma seguem o destino do currículo.
        </p>
        <label>
          Empresa
          <input
            placeholder="Empresa de destino"
            value={letter.company}
            onChange={(e) => patch({ company: e.target.value })}
          />
        </label>
        <label>
          Vaga
          <input
            placeholder="Cargo ou vaga"
            value={letter.role}
            onChange={(e) => patch({ role: e.target.value })}
          />
        </label>
        <label>
          Destinatário
          <input
            placeholder="Nome de quem recebe, se souber"
            value={letter.recipient}
            onChange={(e) => patch({ recipient: e.target.value })}
          />
        </label>
        <label>
          Data
          <input value={letter.date} onChange={(e) => patch({ date: e.target.value })} />
        </label>
        <label>
          Saudação
          <input value={letter.greeting} onChange={(e) => patch({ greeting: e.target.value })} />
        </label>
        <label>
          Corpo
          <textarea
            rows={12}
            placeholder="Separe os parágrafos com uma linha em branco."
            value={letter.body}
            onChange={(e) => patch({ body: e.target.value })}
          />
        </label>
        <label>
          Encerramento
          <input value={letter.signOff} onChange={(e) => patch({ signOff: e.target.value })} />
        </label>
        <button
          type="button"
          className="btn add"
          onClick={() => onChange(draftCoverLetter(cv, lang, { ...letter, body: '' }))}
        >
          Gerar a partir do currículo
        </button>
      </details>
    </div>
  )
}
