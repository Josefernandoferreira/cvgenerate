import type { CoverLetter, CVData, CvLang } from '../types'
import { LETTER_COPY, letterParagraphs } from './coverLetter'
import { formatToday } from './cvLang'
import { translateWithGoogle } from './googleTranslate'
import { formatDateForLang, organizeCv } from './organize'
import {
  looksEnglish,
  looksPortuguese,
  looksSpanish,
  translateOffline,
} from './translateOffline'

type Field = { path: string; text: string; kind: 'prose' | 'date' | 'level' }

const LEVELS: Record<string, Record<CvLang, string>> = {
  C2: { pt: 'Nativo', en: 'Native', es: 'Nativo' },
  C1: { pt: 'Fluente', en: 'Fluent', es: 'Fluido' },
  B2: { pt: 'Avançado', en: 'Professional', es: 'Avanzado' },
  B1: { pt: 'Intermediário', en: 'Intermediate', es: 'Intermedio' },
  A2: { pt: 'Básico', en: 'Basic', es: 'Básico' },
  A1: { pt: 'Básico', en: 'Basic', es: 'Básico' },
}

const GLOSSARY: Array<{ re: RegExp; to: Record<CvLang, string> }> = [
  { re: /^(atual|presente?|present|actual|o momento)$/i, to: { pt: 'Atual', en: 'Present', es: 'Actual' } },
  { re: /^(native or bilingual|nativo|nativo o bilingue)$/i, to: { pt: 'Nativo', en: 'Native', es: 'Nativo' } },
  { re: /^(full professional|fluente|profesional completo)$/i, to: { pt: 'Fluente', en: 'Fluent', es: 'Fluido' } },
  { re: /^(professional working|avancado|avanzado)$/i, to: { pt: 'Avançado', en: 'Professional', es: 'Avanzado' } },
  { re: /^(limited working|intermediario|intermedio)$/i, to: { pt: 'Intermediário', en: 'Intermediate', es: 'Intermedio' } },
  { re: /^(elementary|basico|básico)$/i, to: { pt: 'Básico', en: 'Basic', es: 'Básico' } },
]

export function detectLang(text: string): CvLang {
  if (looksPortuguese(text)) return 'pt'
  if (looksSpanish(text)) return 'es'
  if (looksEnglish(text)) return 'en'
  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const score = (re: RegExp) => n.match(re)?.length ?? 0
  const pt = score(
    /\b(desenvolvedor|desenvolvimento|curriculo|voce|nao|formacao|tecnologo|experiencia|enfase|criacao|usuario|garantindo)\b/g,
  )
  const es = score(/\b(desarrollador|curriculum|usted|formacion academica|trayectoria|resumen)\b/g)
  const en = score(/\b(the|with|from|this|which|developed|responsible|summary)\b/g)
  if (pt >= es && pt >= en && pt > 0) return 'pt'
  if (es >= en && es > 0) return 'es'
  if (en > 0) return 'en'
  return 'pt'
}

export function cvTextBlob(cv: CVData) {
  return [
    cv.headline,
    cv.summary,
    cv.objective,
    ...cv.experience.flatMap((job) => [job.title, ...job.bullets]),
    ...cv.education.map((ed) => `${ed.degree} ${ed.field} ${ed.details}`),
    ...cv.certifications.map((cert) => `${cert.name} ${cert.issuer}`),
  ].join(' ')
}

export function detectCvLang(cv: CVData): CvLang {
  return detectLang(cvTextBlob(cv))
}

export function sourceLangFor(cv: CVData, to: CvLang, detected = detectCvLang(cv)): CvLang {
  const text = cvTextBlob(cv)
  if (to !== 'pt' && looksPortuguese(text)) return 'pt'
  if (detected !== to) return detected
  if (to !== 'pt' && !looksEnglish(text)) return 'pt'
  return detected
}

export async function translateCv(cv: CVData, to: CvLang, from = detectCvLang(cv)): Promise<CVData> {
  const source = from !== to ? from : sourceLangFor(cv, to, from)
  const fields = collectFields(cv)
  const translated: Record<string, string> = {}
  const unique = new Map<string, string[]>()

  for (const field of fields) {
    if (field.kind === 'date') {
      translated[field.path] = formatDateForLang(field.text, to)
      continue
    }
    if (field.kind === 'level') {
      translated[field.path] = mapLevel(field.text, to)
      continue
    }
    const local = translateLocal(field.text, to)
    if (source === to) {
      translated[field.path] = applyPhrases(field.text, to)
      continue
    }
    if (local) {
      translated[field.path] = local
      continue
    }
    const key = field.text.trim()
    const bucket = unique.get(key) ?? []
    bucket.push(field.path)
    unique.set(key, bucket)
  }

  if (source !== to && unique.size) {
    const entries = [...unique.entries()]
    const results = await translateRemoteMany(
      entries.map(([text]) => text),
      source,
      to,
    )
    entries.forEach(([text], i) => {
      const value = pickTranslation(text, results[i] || '', source, to)
      for (const path of unique.get(text) ?? []) translated[path] = value
    })
  }

  return organizeCv(applyFields(cv, translated))
}

export function translateCvLocal(cv: CVData, to: CvLang): CVData {
  const source = sourceLangFor(cv, to)
  const translated: Record<string, string> = {}
  for (const field of collectFields(cv)) {
    if (field.kind === 'date') translated[field.path] = formatDateForLang(field.text, to)
    else if (field.kind === 'level') translated[field.path] = mapLevel(field.text, to)
    else {
      translated[field.path] = pickTranslation(field.text, '', source, to)
    }
  }
  return organizeCv(applyFields(cv, translated))
}

function pickTranslation(source: string, remote: string, from: CvLang, to: CvLang) {
  if (from === to) return applyPhrases(source, to)
  const glossary = translateLocal(source, to)
  if (glossary) return glossary
  if (translationWorked(source, remote, to)) return applyPhrases(remote, to)
  return applyPhrases(translateOffline(source, from, to), to)
}

function translationWorked(source: string, result: string, to: CvLang) {
  if (!result?.trim() || /MYMEMORY WARNING|quotaFinished|YOU USED ALL AVAILABLE/i.test(result)) return false
  if (fold(result) === fold(source)) return false
  if (to === 'en' && looksPortuguese(result)) return false
  if (to === 'pt' && looksEnglish(result) && !looksPortuguese(result)) return false
  return true
}

export async function translateCoverLetter(letter: CoverLetter, to: CvLang, from: CvLang): Promise<CoverLetter> {
  if (from === to) return letter
  const copyFrom = LETTER_COPY[from]
  const copyTo = LETTER_COPY[to]
  const greeting =
    fold(letter.greeting) === fold(copyFrom.greeting)
      ? copyTo.greeting
      : pickTranslation(letter.greeting, await translateRemote(letter.greeting, from, to), from, to)
  const signOff =
    fold(letter.signOff) === fold(copyFrom.signOff)
      ? copyTo.signOff
      : pickTranslation(letter.signOff, await translateRemote(letter.signOff, from, to), from, to)
  const role = letter.role.trim()
    ? pickTranslation(letter.role, await translateRemote(letter.role, from, to), from, to)
    : letter.role
  const paragraphs = letterParagraphs(letter.body)
  const bodyParts = paragraphs.length
    ? (await translateRemoteMany(paragraphs, from, to)).map((part, i) =>
        pickTranslation(paragraphs[i], part, from, to),
      )
    : []
  const date =
    !letter.date.trim() || fold(letter.date) === fold(formatToday(from)) ? formatToday(to) : formatDateForLang(letter.date, to)

  return {
    ...letter,
    greeting: greeting.trim() || copyTo.greeting,
    signOff: signOff.trim() || copyTo.signOff,
    role,
    body: bodyParts.join('\n\n'),
    date: date || formatToday(to),
  }
}

export function translateCoverLetterLocal(letter: CoverLetter, to: CvLang, from: CvLang): CoverLetter {
  if (from === to) return letter
  const copyFrom = LETTER_COPY[from]
  const copyTo = LETTER_COPY[to]
  return {
    ...letter,
    greeting: fold(letter.greeting) === fold(copyFrom.greeting) ? copyTo.greeting : letter.greeting,
    signOff: fold(letter.signOff) === fold(copyFrom.signOff) ? copyTo.signOff : letter.signOff,
    date: !letter.date.trim() || fold(letter.date) === fold(formatToday(from)) ? formatToday(to) : letter.date,
  }
}

function collectFields(cv: CVData): Field[] {
  const fields: Field[] = []
  const add = (path: string, text: string, kind: Field['kind'] = 'prose') => {
    if (text?.trim() && !isProtected(text)) fields.push({ path, text, kind })
  }

  add('headline', cv.headline)
  add('summary', cv.summary)
  add('objective', cv.objective)
  add('nationality', cv.nationality)
  add('workAuth', cv.workAuth)
  add('contact.location', cv.contact.location)

  cv.experience.forEach((job, i) => {
    add(`experience.${i}.title`, job.title)
    add(`experience.${i}.location`, job.location)
    add(`experience.${i}.startDate`, job.startDate, 'date')
    add(`experience.${i}.endDate`, job.endDate, 'date')
    job.bullets.forEach((bullet, b) => add(`experience.${i}.bullets.${b}`, bullet))
  })

  cv.education.forEach((ed, i) => {
    add(`education.${i}.degree`, ed.degree)
    add(`education.${i}.field`, ed.field)
    add(`education.${i}.details`, ed.details)
    add(`education.${i}.startDate`, ed.startDate, 'date')
    add(`education.${i}.endDate`, ed.endDate, 'date')
  })

  cv.skills.forEach((skill, i) => {
    if (!isTechToken(skill.name)) add(`skills.${i}.name`, skill.name)
  })

  cv.languages.forEach((lang, i) => {
    add(`languages.${i}.name`, lang.name)
    add(`languages.${i}.level`, lang.level, 'level')
  })

  cv.certifications.forEach((cert, i) => {
    add(`certifications.${i}.name`, cert.name)
    add(`certifications.${i}.issuer`, cert.issuer)
    add(`certifications.${i}.date`, cert.date, 'date')
  })

  return fields
}

function applyFields(cv: CVData, translated: Record<string, string>): CVData {
  const pick = (path: string, fallback: string) => translated[path] ?? fallback
  return {
    ...cv,
    headline: pick('headline', cv.headline),
    summary: pick('summary', cv.summary),
    objective: pick('objective', cv.objective),
    nationality: pick('nationality', cv.nationality),
    workAuth: pick('workAuth', cv.workAuth),
    contact: {
      ...cv.contact,
      location: pick('contact.location', cv.contact.location),
    },
    experience: cv.experience.map((job, i) => ({
      ...job,
      title: pick(`experience.${i}.title`, job.title),
      location: pick(`experience.${i}.location`, job.location),
      startDate: pick(`experience.${i}.startDate`, job.startDate),
      endDate: pick(`experience.${i}.endDate`, job.endDate),
      bullets: job.bullets.map((bullet, b) => pick(`experience.${i}.bullets.${b}`, bullet)),
    })),
    education: cv.education.map((ed, i) => ({
      ...ed,
      degree: pick(`education.${i}.degree`, ed.degree),
      field: pick(`education.${i}.field`, ed.field),
      details: pick(`education.${i}.details`, ed.details),
      startDate: pick(`education.${i}.startDate`, ed.startDate),
      endDate: pick(`education.${i}.endDate`, ed.endDate),
    })),
    skills: cv.skills.map((skill, i) => ({
      ...skill,
      name: pick(`skills.${i}.name`, skill.name),
    })),
    languages: cv.languages.map((lang, i) => ({
      ...lang,
      name: pick(`languages.${i}.name`, lang.name),
      level: pick(`languages.${i}.level`, lang.level),
    })),
    certifications: cv.certifications.map((cert, i) => ({
      ...cert,
      name: pick(`certifications.${i}.name`, cert.name),
      issuer: pick(`certifications.${i}.issuer`, cert.issuer),
      date: pick(`certifications.${i}.date`, cert.date),
    })),
  }
}

function translateLocal(text: string, to: CvLang): string | null {
  const trimmed = text.trim()
  for (const item of GLOSSARY) {
    if (item.re.test(trimmed)) return item.to[to]
  }
  return null
}

const PHRASES: Array<{ re: RegExp; to: Record<CvLang, string> }> = [
  { re: /forma[cç][aã]o acad[eê]mica/gi, to: { pt: 'formação acadêmica', en: 'academic education', es: 'formación académica' } },
  { re: /licen[cç]as?\s+e\s+certifica[cç][oõ]es/gi, to: { pt: 'licenças e certificações', en: 'licenses and certifications', es: 'licencias y certificaciones' } },
  { re: /certifica[cç][oõ]es/gi, to: { pt: 'certificações', en: 'certifications', es: 'certificaciones' } },
  { re: /certifica[cç][aã]o/gi, to: { pt: 'certificação', en: 'certification', es: 'certificación' } },
  { re: /certificado/gi, to: { pt: 'certificado', en: 'certificate', es: 'certificado' } },
  { re: /forma[cç][aã]o/gi, to: { pt: 'formação', en: 'training', es: 'formación' } },
  { re: /licen[cç]as/gi, to: { pt: 'licenças', en: 'licenses', es: 'licencias' } },
  { re: /licen[cç]a/gi, to: { pt: 'licença', en: 'license', es: 'licencia' } },
  { re: /programa[cç][aã]o/gi, to: { pt: 'programação', en: 'programming', es: 'programación' } },
  { re: /desenvolvimento/gi, to: { pt: 'desenvolvimento', en: 'development', es: 'desarrollo' } },
  { re: /conclu[ií]do/gi, to: { pt: 'concluído', en: 'completed', es: 'completado' } },
  { re: /conclus[aã]o/gi, to: { pt: 'conclusão', en: 'completion', es: 'conclusión' } },
  { re: /emiss[aã]o/gi, to: { pt: 'emissão', en: 'issued', es: 'emisión' } },
  { re: /expedi[cç][aã]o/gi, to: { pt: 'expedição', en: 'issued', es: 'expedición' } },
  { re: /carga hor[aá]ria/gi, to: { pt: 'carga horária', en: 'workload', es: 'carga horaria' } },
  { re: /\bhoras\b/gi, to: { pt: 'horas', en: 'hours', es: 'horas' } },
  { re: /\bcurso de\b/gi, to: { pt: 'curso de', en: 'course in', es: 'curso de' } },
  { re: /\bcurso\b/gi, to: { pt: 'curso', en: 'course', es: 'curso' } },
  { re: /\bescola\b/gi, to: { pt: 'escola', en: 'school', es: 'escuela' } },
  { re: /\binstituto\b/gi, to: { pt: 'instituto', en: 'institute', es: 'instituto' } },
  { re: /\bfunda[cç][aã]o\b/gi, to: { pt: 'fundação', en: 'foundation', es: 'fundación' } },
]

function applyPhrases(text: string, to: CvLang): string {
  if (!text?.trim()) return text
  let out = text
  for (const item of PHRASES) {
    out = out.replace(item.re, (match) => preserveCase(match, item.to[to]))
  }
  return out.replace(/\s+/g, ' ').trim()
}

function preserveCase(source: string, replacement: string): string {
  if (source.toUpperCase() === source) return replacement.toUpperCase()
  if (source[0] === source[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function mapLevel(level: string, to: CvLang): string {
  const raw = level.trim()
  if (!raw) return raw
  const key = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const cefr = key.match(/\b([abc][12])\b/)?.[1]?.toUpperCase()
  const token =
    cefr ??
    (/(nativo|native|bilingual|c2)/.test(key)
      ? 'C2'
      : /(fluente|fluent|fluido|c1)/.test(key)
        ? 'C1'
        : /(avancado|advanced|professional|b2)/.test(key)
          ? 'B2'
          : /(intermediario|intermediate|b1)/.test(key)
            ? 'B1'
            : /(basico|basic|a2|a1)/.test(key)
              ? 'A2'
              : '')
  if (token && LEVELS[token]) return LEVELS[token][to]
  return translateLocal(raw, to) ?? raw
}

function fold(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isProtected(text: string) {
  return /@/.test(text) || /https?:\/\//i.test(text) || /linkedin\.com/i.test(text) || /^[\d+\s().-]{8,}$/.test(text)
}

function isTechToken(text: string) {
  return /^[A-Za-z0-9.+#\-/]{1,18}$/.test(text.trim()) && !/\s/.test(text.trim())
}

async function translateRemote(text: string, from: CvLang, to: CvLang): Promise<string> {
  const [translated] = await translateRemoteMany([text], from, to)
  return translated ?? ''
}

async function translateRemoteMany(texts: string[], from: CvLang, to: CvLang): Promise<string[]> {
  if (!texts.length || from === to) return texts
  try {
    return await translateWithGoogle(texts, from, to)
  } catch {
    return texts.map(() => '')
  }
}
