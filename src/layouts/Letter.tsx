import type { AccentId, CoverLetter, CVData, PaperId } from '../types'
import { ACCENTS } from '../types'
import { formatToday } from '../lib/cvLang'
import { LETTER_COPY, letterParagraphs } from '../lib/coverLetter'
import { useRegion } from '../lib/regionContext'
import { ContactRow, show } from './shared'

export function LetterSheet({
  cv,
  letter,
  accent,
  paper = 'a4',
}: {
  cv: CVData
  letter: CoverLetter
  accent: AccentId
  paper?: PaperId
}) {
  const { lang, labels } = useRegion()
  const copy = LETTER_COPY[lang]
  const date = letter.date.trim() || formatToday(lang)
  const paragraphs = letterParagraphs(letter.body)
  const recipient = [letter.recipient, letter.role, letter.company].map((item) => item.trim()).filter(Boolean)

  return (
    <div
      className={`cv-page layout-classic paper-${paper}`}
      style={{ ['--cv-accent' as string]: ACCENTS[accent] }}
    >
      <article className="cv letter">
        <header className="letter-head">
          <p className="letter-kicker">{copy.title}</p>
          <h1>{cv.name || labels.nameFallback}</h1>
          {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}
          <ContactRow cv={cv} />
        </header>

        <p className="letter-date">
          {[cv.contact.location, date].filter((item) => item.trim()).join(', ')}
        </p>

        {recipient.length > 0 && (
          <div className="letter-to">
            {recipient.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        {show(letter.greeting) && <p className="letter-hello">{letter.greeting}</p>}

        {paragraphs.map((part, i) => (
          <p key={`${i}-${part.slice(0, 24)}`} className="letter-p">
            {part}
          </p>
        ))}

        <div className="letter-sign">
          <p>{letter.signOff || copy.signOff}</p>
          <strong>{cv.name || labels.nameFallback}</strong>
        </div>
      </article>
    </div>
  )
}
