import type { CVData, Education, Experience } from '../types'

const MONTHS: Record<string, number> = {
  jan: 1,
  janeiro: 1,
  january: 1,
  fev: 2,
  fevereiro: 2,
  feb: 2,
  february: 2,
  mar: 3,
  marco: 3,
  march: 3,
  abr: 4,
  abril: 4,
  apr: 4,
  april: 4,
  mai: 5,
  maio: 5,
  may: 5,
  jun: 6,
  junho: 6,
  june: 6,
  jul: 7,
  julho: 7,
  july: 7,
  ago: 8,
  agosto: 8,
  aug: 8,
  august: 8,
  set: 9,
  setembro: 9,
  sep: 9,
  sept: 9,
  september: 9,
  out: 10,
  outubro: 10,
  oct: 10,
  october: 10,
  nov: 11,
  novembro: 11,
  november: 11,
  dez: 12,
  dezembro: 12,
  dec: 12,
  december: 12,
  ene: 1,
  enero: 1,
  febrero: 2,
  marzo: 3,
  mayo: 5,
  junio: 6,
  julio: 7,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  dic: 12,
  diciembre: 12,
}

const MONTH_NAMES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const MONTH_PATTERN =
  'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|january|february|march|april|may|june|july|august|september|october|november|december|feb|apr|aug|sep|sept|oct|dec|ene|enero|febrero|marzo|mayo|junio|julio|septiembre|octubre|noviembre|diciembre|dic'

const YEAR = '(?:19|20)\\d{2}'
const DATE_TOKEN = `(?:\\d{1,2}\\s+de\\s+)?(?:${MONTH_PATTERN})\\.?\\s*(?:de\\s+)?${YEAR}|${YEAR}`
const CURRENT_TOKEN = 'o momento|atual|presente?|current|now|hoje|actual'
const RANGE_SEP = '[-–—−‑‐·•∙|]'
const RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:${RANGE_SEP}|\\s+(?:a|to|até|ate)\\s+|\\s+)\\s*(${DATE_TOKEN}|${CURRENT_TOKEN})`,
  'i',
)
const DURATION_RE =
  /^\(?\s*\d+\s*(?:\+|–|-)?\s*(anos?|ano|years?|yrs?|meses?|months?|mos?)(?:\s+\d+\s*(?:meses?|months?|mos?))?\s*\)?$/i

export function isDurationOnly(text: string): boolean {
  return DURATION_RE.test(text.trim())
}

export function stripDuration(text: string): string {
  return text
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/\s*[·•|∙]\s*\(\s*\d+[^)]*\)\s*$/g, '')
    .replace(/\s*[·•|∙]\s+\d.*$/g, '')
    .replace(/\s+[·•|∙]\s+(full-?time|part-?time|tempo integral|meio[ -]?per[ií]odo).*$/i, '')
    .replace(/\s+\d+\s*(?:\+|–|-)?\s*(anos?|years?|yrs?|meses?|months?|mos?).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isCurrentDate(text: string): boolean {
  const n = normalize(stripDuration(text))
  return /^(o momento|atual|presente?|current|now|hoje|actual)$/.test(n)
}

export function parseCvDate(text: string): number {
  if (!text?.trim()) return 0
  if (isCurrentDate(text)) return 999912
  const n = normalize(stripDuration(text)).replace(/\./g, '')

  const iso = n.match(/^(\d{4})[/-](\d{1,2})(?:[/-]\d{1,2})?$/)
  if (iso) return Number(iso[1]) * 100 + Number(iso[2])

  const br = n.match(/^(\d{1,2})[/-](\d{4})$/)
  if (br) return Number(br[2]) * 100 + Number(br[1])

  const year = n.match(/(?:19|20)\d{2}/)
  if (!year) return 0
  let month = 0
  for (const [name, value] of Object.entries(MONTHS)) {
    if (new RegExp(`\\b${name}\\b`).test(n)) {
      month = value
      break
    }
  }
  return Number(year[0]) * 100 + month
}

export function extractRange(text: string): { start: string; end: string } | null {
  const match = text.match(RANGE_RE) ?? stripDuration(text).match(RANGE_RE)
  if (!match) return null
  return {
    start: formatDateLabel(match[1], text),
    end: formatDateLabel(match[2], text),
  }
}

export function stripMatchedRange(text: string): string {
  const match = text.match(RANGE_RE)
  if (!match || match.index == null) return text.trim()
  const clipped = `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`
  return clipped
    .replace(/\s*[·•|∙]\s*\(\s*\)\s*/g, ' ')
    .replace(/\s*\(\s*\)\s*/g, ' ')
    .replace(/\s*[·•|∙]\s*$/g, '')
    .replace(/^\s*[·•|∙]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isDateRangeLine(text: string): boolean {
  return extractRange(text) !== null
}

export function hasMonthToken(text: string): boolean {
  if (!text?.trim()) return false
  const n = normalize(text).replace(/\./g, '')
  return Object.keys(MONTHS).some((name) => new RegExp(`\\b${name}\\b`).test(n))
}

const MONTH_YEAR_RE = new RegExp(
  `^(?:\\d{1,2}\\s+de\\s+)?(?:${MONTH_PATTERN})\\.?\\s*(?:de\\s+)?${YEAR}$`,
  'i',
)

function bareDate(text: string): string {
  return stripDuration(text)
    .replace(/[·•|∙]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isLooseStart(text: string): boolean {
  const n = bareDate(text)
  return MONTH_YEAR_RE.test(n) || /^(?:19|20)\d{2}$/.test(n)
}

export function isLooseEnd(text: string): boolean {
  const n = bareDate(text)
  return isCurrentDate(n) || MONTH_YEAR_RE.test(n) || /^(?:19|20)\d{2}$/.test(n)
}

export function stitchDateLines(lines: string[]): string[] {
  const out: string[] = []
  const monthOnly = new RegExp(`^(?:${MONTH_PATTERN})\\.?$`, 'i')
  const sepOnly = /^[·•|∙\-–—−‑]$/
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i].trim()
    const b = lines[i + 1]?.trim()
    const c = lines[i + 2]?.trim()
    if (b && !extractRange(a) && isLooseStart(a) && isLooseEnd(b)) {
      out.push(`${a} - ${b}`)
      i += 1
      continue
    }
    if (b && /[-–—−‑·•|∙]\s*$/.test(a) && isLooseEnd(b)) {
      out.push(`${a.replace(/[-–—−‑·•|∙]\s*$/, '').trim()} - ${b}`)
      i += 1
      continue
    }
    if (b && c && isLooseStart(a) && sepOnly.test(b) && isLooseEnd(c)) {
      out.push(`${a} - ${c}`)
      i += 2
      continue
    }
    if (b && c && monthOnly.test(a) && /^(?:19|20)\d{2}$/.test(b) && isLooseEnd(c)) {
      out.push(`${a} ${b} - ${c}`)
      i += 2
      continue
    }
    out.push(lines[i])
  }
  return out
}

export function splitDateFromLine(text: string): { rest: string; start: string; end: string } | null {
  const range = extractRange(text)
  if (!range) return null
  const rest = stripDuration(text)
    .replace(RANGE_RE, ' ')
    .replace(new RegExp(`\\s*${RANGE_SEP}\\s*`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { rest, start: range.start, end: range.end }
}

export type DateLang = 'pt' | 'en' | 'es'

export function formatDateForLang(text: string, lang: DateLang): string {
  if (!text?.trim()) return text
  if (isCurrentDate(text) || /^(atual|presente?|present|actual|o momento)$/i.test(text.trim())) {
    return lang === 'pt' ? 'Atual' : lang === 'es' ? 'Actual' : 'Present'
  }
  const value = parseCvDate(text)
  if (!value) return text.trim()
  const year = Math.floor(value / 100)
  const month = value % 100
  const names = lang === 'pt' ? MONTH_NAMES_PT : lang === 'es' ? MONTH_NAMES_ES : MONTH_NAMES_EN
  return month ? `${names[month - 1]} ${year}` : String(year)
}

function formatDateLabel(raw: string, source: string): string {
  const lang: DateLang = isSpanish(source) ? 'es' : isPortuguese(source) ? 'pt' : 'en'
  if (isCurrentDate(raw)) return formatDateForLang(raw, lang)
  const value = parseCvDate(raw)
  if (!value) return raw.trim()
  return formatDateForLang(raw, lang)
}

function isPortuguese(text: string): boolean {
  return /(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|\bfev\b|\babr\b|\bset\b|\bout\b|\bdez\b|o momento|\batual\b|de \d{4})/i.test(
    text,
  )
}

function isSpanish(text: string): boolean {
  return /(enero|febrero|marzo|mayo|junio|julio|septiembre|octubre|noviembre|diciembre|\bene\b|\bdic\b|\bactual\b)/i.test(
    text,
  )
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function endRank(endDate: string, startDate: string): number {
  if (!endDate.trim()) return startDate.trim() ? 999912 : 0
  return parseCvDate(endDate)
}

function compareTimeline(a: { startDate: string; endDate: string }, b: { startDate: string; endDate: string }) {
  const end = endRank(b.endDate, b.startDate) - endRank(a.endDate, a.startDate)
  if (end !== 0) return end
  return parseCvDate(b.startDate) - parseCvDate(a.startDate)
}

export function normalizeExperience(job: Experience): Experience {
  const fromFields = [job.startDate, job.endDate].filter(Boolean).join(' — ')
  const fromBlob = [job.startDate, job.endDate, job.title, job.company, job.location, ...job.bullets].join(' ')
  const range = extractRange(fromFields) ?? extractRange(fromBlob)

  let startDate = range?.start ?? job.startDate
  let endDate = range?.end ?? job.endDate
  if (range && job.startDate && !extractRange(job.startDate) && !job.endDate) {
    startDate = range.start
    endDate = range.end
  }
  if (isCurrentDate(endDate)) {
    const sample = `${endDate} ${job.startDate}`
    endDate = isSpanish(sample) ? 'Actual' : isPortuguese(sample) ? 'Atual' : 'Present'
  }

  let title = job.title.trim()
  let company = job.company.trim()
  let location = job.location.trim()
  if (looksLikeTitle(company) && !looksLikeCompany(company) && (looksLikeCompany(title) || !looksLikeTitle(title))) {
    const swap = title
    title = company
    company = swap
  }
  const place = company.split(/\s*[·•|]\s*/)
  if (place.length >= 2 && /(brasil|brazil|região|regiao|distrito federal|,)/i.test(place.slice(1).join(' '))) {
    if (!location) location = place.slice(1).join(' · ')
    company = place[0]
  }

  return {
    ...job,
    title,
    company,
    location: location.trim(),
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    bullets: stitchBulletLines(job.bullets),
  }
}

export function stitchBulletLines(items: string[]): string[] {
  const out: string[] = []
  for (const raw of items) {
    const line = raw.replace(/^[-–—•●▪◦]\s*/, '').trim()
    if (!line) continue
    const prev = out[out.length - 1]
    if (prev && shouldJoinBullet(prev, line)) {
      out[out.length - 1] = joinBulletText(prev, line)
    } else {
      out.push(line)
    }
  }
  return out
}

function shouldJoinBullet(prev: string, next: string) {
  if (/^[a-záàâãéêíóôõúüçñ]/.test(next)) return true
  if (/\b(da|de|do|das|dos|em|com|e|and|the|of|a|para|por|uma|um)$/i.test(prev)) return true
  return /[-,;]$/.test(prev)
}

function joinBulletText(prev: string, next: string) {
  if (prev.endsWith('-')) return `${prev.slice(0, -1)}${next}`
  return `${prev} ${next}`.replace(/\s+/g, ' ').trim()
}

function looksLikeCompany(text: string) {
  return /\b(inc|ltd|llc|gmbh|s\.?a\.?|ltda|corp|company|estudio|estúdio|labs|studio|consultoria|tecnologia|systems|system)\b/i.test(
    text,
  )
}

function looksLikeTitle(text: string) {
  return /\b(engineer|designer|developer|gerente|analista|lead|head|director|manager|product|desenvolvedor|coordenador|estagi[aá]rio|trainee|intern|consultor|fullstack|full-stack|backend|frontend|architect|specialist)\b/i.test(
    text,
  )
}

export function orderExperience(items: Experience[]): Experience[] {
  return [...items].sort(compareTimeline)
}

export function sortExperience(items: Experience[]): Experience[] {
  return orderExperience(items.map(normalizeExperience))
}

export function orderEducation(items: Education[]): Education[] {
  return [...items].sort(compareTimeline)
}

export function sortEducation(items: Education[]): Education[] {
  return orderEducation(
    items.map((item) => {
      const range = extractRange(`${item.startDate} — ${item.endDate}`) ?? extractRange(`${item.startDate} ${item.endDate}`)
      return {
        ...item,
        startDate: range?.start ?? item.startDate,
        endDate: range?.end ?? item.endDate,
      }
    }),
  )
}

export interface ExperienceGroup {
  company: string
  roles: Experience[]
}

function companyKey(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

export function groupExperience(items: Experience[]): ExperienceGroup[] {
  const sorted = sortExperience(items.filter((item) => item.company || item.title))
  const groups: ExperienceGroup[] = []
  const seen = new Map<string, number>()

  for (const job of sorted) {
    const key = companyKey(job.company)
    const existing = key ? seen.get(key) : undefined
    if (existing !== undefined) {
      groups[existing].roles.push(job)
      continue
    }
    if (key) seen.set(key, groups.length)
    groups.push({ company: job.company, roles: [job] })
  }

  return groups.map((group) => ({
    ...group,
    roles: sortExperience(group.roles),
  }))
}

export function organizeCv(cv: CVData): CVData {
  return {
    ...cv,
    experience: sortExperience(cv.experience),
    education: sortEducation(cv.education),
  }
}
