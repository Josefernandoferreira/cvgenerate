import type { CoverLetter, CVData, CvLang } from '../types'
import { formatToday } from './cvLang'
import { sortExperience } from './organize'

export const LETTER_COPY: Record<
  CvLang,
  { greeting: string; signOff: string; title: string; mode: string }
> = {
  pt: {
    greeting: 'Prezado(a) responsável pela vaga,',
    signOff: 'Atenciosamente,',
    title: 'Carta de apresentação',
    mode: 'Carta',
  },
  en: {
    greeting: 'Dear Hiring Manager,',
    signOff: 'Sincerely,',
    title: 'Cover letter',
    mode: 'Letter',
  },
  es: {
    greeting: 'Estimado/a responsable de selección,',
    signOff: 'Atentamente,',
    title: 'Carta de presentación',
    mode: 'Carta',
  },
}

export function emptyLetter(lang: CvLang = 'pt'): CoverLetter {
  const copy = LETTER_COPY[lang]
  return {
    company: '',
    role: '',
    recipient: '',
    greeting: copy.greeting,
    body: '',
    signOff: copy.signOff,
    date: formatToday(lang),
  }
}

export function mergeLetter(partial: Partial<CoverLetter> | undefined, lang: CvLang): CoverLetter {
  return { ...emptyLetter(lang), ...partial }
}

export function isLetterSparse(letter: CoverLetter) {
  return !letter.body.trim()
}

export function draftCoverLetter(cv: CVData, lang: CvLang, current?: CoverLetter): CoverLetter {
  const base = mergeLetter(current, lang)
  const copy = LETTER_COPY[lang]
  return {
    ...base,
    greeting: base.greeting.trim() || copy.greeting,
    signOff: base.signOff.trim() || copy.signOff,
    date: base.date.trim() || formatToday(lang),
    body: base.body.trim() || defaultBody(cv, lang, base),
  }
}

export function letterParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function defaultBody(cv: CVData, lang: CvLang, letter: CoverLetter): string {
  const role = letter.role.trim()
  const company = letter.company.trim()
  const job = sortExperience(cv.experience)[0]
  const proof = job?.bullets.find((item) => item.trim()) ?? ''
  const who = cv.headline.trim() || cv.name.trim()

  if (lang === 'en') {
    const open = role || company
      ? `I am writing to apply for the ${role || 'open'} role${company ? ` at ${company}` : ''}.`
      : 'I am writing to introduce my professional background and apply for a role on your team.'
    const profile = cv.summary.trim() || (who ? `I work as ${who}.` : '')
    const recent = job
      ? `Most recently I have been ${job.title || 'working'}${job.company ? ` at ${job.company}` : ''}.${proof ? ` ${proof}` : ''}`
      : ''
    return [open, profile, recent, 'I would welcome the opportunity to speak further.']
      .filter(Boolean)
      .join('\n\n')
  }

  if (lang === 'es') {
    const open = role || company
      ? `Me dirijo a ustedes para postularme al puesto de ${role || 'la vacante'}${company ? ` en ${company}` : ''}.`
      : 'Me dirijo a ustedes para presentar mi perfil profesional y postularme a una vacante en su equipo.'
    const profile = cv.summary.trim() || (who ? `Actúo como ${who}.` : '')
    const recent = job
      ? `Recientemente me he desempeñado como ${job.title || 'profesional'}${job.company ? ` en ${job.company}` : ''}.${proof ? ` ${proof}` : ''}`
      : ''
    return [open, profile, recent, 'Quedo atento/a a una conversación.']
      .filter(Boolean)
      .join('\n\n')
  }

  const open = role || company
    ? `Venho por meio desta me candidatar à vaga de ${role || 'profissional'}${company ? ` na ${company}` : ''}.`
    : 'Venho por meio desta apresentar meu percurso profissional e me candidatar a uma vaga na empresa.'
  const profile = cv.summary.trim() || (who ? `Atuo como ${who}.` : '')
  const recent = job
    ? `Na trajetória recente, atuei como ${job.title || 'profissional'}${job.company ? ` na ${job.company}` : ''}.${proof ? ` ${proof}` : ''}`
    : ''
  return [open, profile, recent, 'Fico à disposição para uma conversa.']
    .filter(Boolean)
    .join('\n\n')
}
