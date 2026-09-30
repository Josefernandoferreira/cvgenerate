import type {
  CVData,
  Certification,
  Education,
  Experience,
  Language,
  NamedItem,
} from '../types'
import { emptyCv } from './empty'
import { uid } from './id'
import {
  extractRange,
  hasMonthToken,
  isDateRangeLine,
  isDurationOnly,
  isLooseEnd,
  isLooseStart,
  organizeCv,
  parseCvDate,
  sortExperience,
  splitDateFromLine,
  stitchDateLines,
  stripMatchedRange,
} from './organize'

export interface PdfLine {
  text: string
  x: number
  y: number
  fontSize: number
  page: number
}

const SECTION_MAP: Record<string, string> = {
  contact: 'contact',
  contato: 'contact',
  'entre em contato': 'contact',
  'top skills': 'skills',
  'principais competencias': 'skills',
  skills: 'skills',
  competencias: 'skills',
  languages: 'languages',
  idiomas: 'languages',
  certifications: 'certs',
  certification: 'certs',
  certificacao: 'certs',
  certificacoes: 'certs',
  certificados: 'certs',
  'licenses & certifications': 'certs',
  'licenses and certifications': 'certs',
  'licencas e certificados': 'certs',
  'licencas e certificacoes': 'certs',
  experience: 'experience',
  experiencia: 'experience',
  experiencias: 'experience',
  'experiencia profissional': 'experience',
  'historico profissional': 'experience',
  'work experience': 'experience',
  'professional experience': 'experience',
  positions: 'experience',
  education: 'education',
  formacao: 'education',
  'formacao academica': 'education',
  'formacao academica e cursos': 'education',
  'academic background': 'education',
  'academic education': 'education',
  escolaridade: 'education',
  'honors-awards': 'honors',
  'honors & awards': 'honors',
  'reconhecimentos e premios': 'honors',
  publications: 'pubs',
  publicacoes: 'pubs',
  summary: 'summary',
  about: 'summary',
  sobre: 'summary',
  'about me': 'summary',
  intro: 'summary',
  'sobre mim': 'summary',
  resumo: 'summary',
  'resumo profissional': 'summary',
  'resumo do perfil': 'summary',
  sumario: 'summary',
  perfil: 'summary',
  'perfil profissional': 'summary',
  objective: 'summary',
  objetivo: 'summary',
  volunteer: 'experience',
  'volunteer experience': 'experience',
  'experiencia voluntaria': 'experience',
}

export function groupLines(
  items: { text: string; x: number; y: number; fontSize: number; page: number; width?: number; hasEOL?: boolean }[],
): PdfLine[] {
  const sorted = [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const lines: Array<PdfLine & { endX: number; hasEOL?: boolean }> = []
  const threshold = 5.2

  for (const item of sorted) {
    const width = item.width && item.width > 0 ? item.width : Math.max(item.text.length * (item.fontSize || 8) * 0.42, 2)
    const last = lines[lines.length - 1]
    if (
      last &&
      last.page === item.page &&
      Math.abs(last.y - item.y) <= threshold
    ) {
      const gap = item.x - last.endX
      const joiner = gap < 1.5 ? '' : ' '
      last.text = `${last.text}${joiner}${item.text}`.replace(/[ ]{2,}/g, ' ').trim()
      last.fontSize = Math.max(last.fontSize, item.fontSize)
      last.x = Math.min(last.x, item.x)
      last.endX = Math.max(last.endX, item.x + width)
      last.hasEOL = item.hasEOL
    } else {
      lines.push({
        text: item.text,
        x: item.x,
        y: item.y,
        fontSize: item.fontSize,
        page: item.page,
        endX: item.x + width,
        hasEOL: item.hasEOL,
      })
    }
  }

  return lines
    .map(({ text, x, y, fontSize, page }) => ({
      text: collapseSpacedLetters(text),
      x,
      y,
      fontSize,
      page,
    }))
    .filter(
      (l) =>
        l.text &&
        !/^page\s+\d+\s+of\s+\d+$/i.test(l.text) &&
        !/^p[áa]gina\s+\d+\s+de\s+\d+$/i.test(l.text),
    )
}

function collapseSpacedLetters(text: string): string {
  const trimmed = text.trim()
  if (/^(?:[\p{L}\p{N}]\s+){3,}[\p{L}\p{N}]$/u.test(trimmed)) {
    return trimmed.replace(/\s+/g, '')
  }
  return trimmed.replace(/[ ]{2,}/g, ' ')
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function peelHeadingRest(text: string, key: string): string {
  const words = text.trim().split(/\s+/)
  const keyWords = key.trim().split(/\s+/)
  return words.slice(keyWords.length).join(' ').replace(/^[:·|•-]\s*/, '').trim()
}

function splitSectionLine(text: string): { section: string; rest: string } | null {
  const collapsed = collapseSpacedLetters(text)
  const n = normalize(collapsed)
  if (!n) return null
  if (SECTION_MAP[n]) return { section: SECTION_MAP[n], rest: '' }

  const head = n.split(/[·|•]/)[0]?.trim() ?? ''
  if (SECTION_MAP[head] && head.length >= 4) {
    const after = collapsed.split(/[·|•]/).slice(1).join(' ').trim()
    if (n === head || after) return { section: SECTION_MAP[head], rest: after }
  }

  const ranked = Object.entries(SECTION_MAP).sort((a, b) => b[0].length - a[0].length)
  for (const [key, value] of ranked) {
    if (n === key) return { section: value, rest: '' }
    const prefixed = n.startsWith(`${key} `) || n.startsWith(`${key}:`)
    if (!prefixed) {
      if (
        n.endsWith(` ${key}`) &&
        key.length >= 6 &&
        collapsed.length < 48 &&
        !/[.!?…]/.test(collapsed)
      ) {
        return { section: value, rest: '' }
      }
      continue
    }
    const rest = peelHeadingRest(collapsed, key)
    if (!rest) return { section: value, rest: '' }
    if (value === 'education' && (key === 'formacao' || key === 'education')) {
      if (!/^(academica|academico|escolar)$/i.test(normalize(rest))) continue
    }
    if (value === 'summary' && key.length >= 5 && rest.length > 8) {
      return { section: value, rest }
    }
    if (rest.length < 8) return { section: value, rest }
  }
  return null
}

function sectionOf(text: string): string | null {
  return splitSectionLine(text)?.section ?? null
}

function isDateLine(text: string): boolean {
  if (isDurationOnly(text)) return false
  return (
    isDateRangeLine(text) ||
    /^\d{4}\s*[-–—−‑·]\s*(?:\d{4}|atual|presente?|current|o momento)$/i.test(text.trim())
  )
}

function isDateAnchor(text: string) {
  return isDateLine(text) || isLooseStart(text)
}

function datesFrom(text: string): [string, string] {
  const range = extractRange(text)
  return [range?.start ?? '', range?.end ?? '']
}

function cleanRoleLine(text: string): string {
  return text
    .replace(
      /\s*[·•|∙]\s*(full-?time|part-?time|tempo integral|est[aá]gio|internship|contract|freelance|aut[oô]nomo|trainee).*$/i,
      '',
    )
    .replace(/\s*[·•|∙]\s*\(\s*\d+[^)]*\)\s*$/g, '')
    .replace(/\s*\(\s*\d+\s*(?:anos?|ano|years?|yrs?|meses?|months?|mos?)[^)]*\)\s*$/i, '')
    .trim()
}

function dateAnchorCount(items: { text?: string }[]) {
  return items.filter((item) => isDateAnchor(item.text ?? '')).length
}

function isDateHeavy(items: { text?: string }[]): boolean {
  const texts = items.map((item) => item.text ?? '').filter(Boolean)
  if (texts.length < 2) return false
  const hits = texts.filter(
    (text) =>
      extractRange(text) ||
      isLooseStart(text) ||
      isLooseEnd(text) ||
      isDurationOnly(text) ||
      /^[-–—−‑·]$/.test(text.trim()),
  )
  return hits.length >= Math.max(2, Math.ceil(texts.length * 0.45))
}

export function findItemSplit(
  items: { x: number; text?: string }[],
  pageWidth: number,
): number | null {
  if (items.length < 10) return null
  const xs = items.map((item) => item.x).sort((a, b) => a - b)

  const pick = (minRatio: number, maxRatio: number) => {
    let bestGap = 0
    let split = 0
    for (let i = 1; i < xs.length; i++) {
      const gap = xs[i] - xs[i - 1]
      const mid = (xs[i] + xs[i - 1]) / 2
      if (mid < pageWidth * minRatio || mid > pageWidth * maxRatio) continue
      if (gap > bestGap) {
        bestGap = gap
        split = mid
      }
    }
    if (bestGap < 14) return null
    const left = items.filter((item) => item.x < split)
    const right = items.filter((item) => item.x >= split)
    if (left.length < 4 || right.length < 4) return null
    if (isDateHeavy(right) || isDateHeavy(left)) return null
    return split
  }

  return pick(0.16, 0.4) ?? pick(0.16, 0.55)
}

export function findColumnSplit(lines: PdfLine[], pageWidth: number): number | null {
  return findItemSplit(lines, pageWidth)
}

export function partitionPage(
  items: { text: string; x: number; y: number; fontSize: number; page: number; width?: number; hasEOL?: boolean }[],
  pageWidth: number,
  persistedSplit: number | null,
): { left: ReturnType<typeof groupLines>; main: ReturnType<typeof groupLines>; split: number | null } {
  const found = findItemSplit(items, pageWidth)
  const split = persistedSplit ?? found
  if (split == null) {
    return { left: [], main: groupLines(items), split: found }
  }
  const leftItems = items.filter((item) => item.x < split)
  const rightItems = items.filter((item) => item.x >= split)
  if (persistedSplit != null && (leftItems.length < 3 || isDateHeavy(leftItems) || dateAnchorCount(leftItems) >= 2)) {
    return { left: [], main: groupLines(items), split: persistedSplit }
  }
  return {
    left: groupLines(leftItems),
    main: groupLines(rightItems),
    split: persistedSplit ?? found,
  }
}

export function interpretLines(lines: PdfLine[], pageWidth: number): CVData {
  const page1 = lines.filter((l) => l.page === 1)
  const splitX = findColumnSplit(page1.length ? page1 : lines, pageWidth)
  if (splitX != null) {
    return interpretColumns(
      lines.filter((l) => l.x < splitX),
      lines.filter((l) => l.x >= splitX),
    )
  }
  return interpretColumns([], lines)
}

export function interpretColumns(left: PdfLine[], main: PdfLine[]): CVData {
  const cv = emptyCv()
  const source = main.length ? main : left
  if (left.length) parseSidebar(cv, left)
  parseMain(cv, source)

  const harvested = bestHarvest(left, source, [cv.name])
  const extra = partitionEduWindow(educationWindow([...left, ...source].map((l) => l.text)))
  if (extra.education.length) cv.education = extra.education
  cv.experience = dedupeJobs([...cv.experience, ...harvested, ...extra.jobs])

  if (!cv.summary.trim()) cv.summary = harvestSummary(source, cv)
  if (!cv.summary.trim() && left.length) cv.summary = harvestSummary(left, cv)

  for (const line of [...left, ...main]) {
    assignContact(cv, line.text, [])
  }

  cv.skills = uniqueNamed(cv.skills)
  cv.languages = uniqueLanguages(cv.languages)
  cv.certifications = uniqueCerts([
    ...cv.certifications,
    ...harvestCertifications(source.map((line) => line.text)),
    ...harvestCertifications(left.map((line) => line.text)),
  ])
  cv.experience = cv.experience.filter((e) => e.company || e.title)
  cv.education = cv.education.filter((e) => e.school || e.degree)
  return organizeCv(cv)
}

function parseSidebar(cv: CVData, lines: PdfLine[]) {
  let bucket = 'contact'
  const skills: NamedItem[] = []
  const languages: Language[] = []
  const certs: Certification[] = []
  const contactBits: string[] = []
  const summaryBits: string[] = []

  for (const line of lines) {
    const split = splitSectionLine(line.text)
    if (split) {
      bucket = split.section
      if (split.section === 'summary' && split.rest) summaryBits.push(split.rest)
      continue
    }
    if (bucket === 'contact') assignContact(cv, line.text, contactBits)
    else if (bucket === 'skills' && line.text.length < 48) skills.push({ id: uid(), name: line.text })
    else if (bucket === 'languages') languages.push(parseLanguage(line.text))
    else if (bucket === 'certs') certs.push({ id: uid(), name: line.text, issuer: '', date: '' })
    else if (bucket === 'summary') summaryBits.push(line.text)
  }

  if (!cv.contact.location && contactBits.length) {
    const loc = contactBits.find((b) => /[A-Za-zÀ-ú].*,/.test(b) && !b.includes('@'))
    if (loc) cv.contact.location = loc
  }

  cv.skills = skills
  cv.languages = languages
  cv.certifications = stitchCertifications(certs)
  if (summaryBits.length) cv.summary = joinProse(summaryBits.filter((text) => keepSummaryBody(text, cv)))
}

function assignContact(cv: CVData, text: string, leftovers: string[]) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  if (email) {
    cv.contact.email = email[0]
    return
  }
  if (/github\.com/i.test(text)) {
    if (!cv.contact.website) cv.contact.website = text.replace(/^https?:\/\//, '')
    return
  }
  if (/linkedin\.com/i.test(text)) {
    cv.contact.linkedin = text.replace(/^https?:\/\//, '')
    return
  }
  if (/^www\.|^https?:\/\//i.test(text) || /\.(com|dev|app|io|design|me|net|org)\b/i.test(text)) {
    cv.contact.website = text.replace(/^https?:\/\//, '')
    return
  }
  if (
    !isDateLine(text) &&
    /(\+?\d[\d\s().-]{8,}\d)/.test(text) &&
    text.replace(/\D/g, '').length >= 10
  ) {
    cv.contact.phone = text.replace(/\s*\((mobile|celular|whatsapp)\)\s*/i, '').trim()
    return
  }
  leftovers.push(text)
}

function parseLanguage(text: string): Language {
  const match = text.match(/^(.+?)\s*[—(]\s*(.+?)\)?$/)
  if (match) {
    return { id: uid(), name: match[1].trim(), level: match[2].replace(/\)$/, '').trim() }
  }
  return { id: uid(), name: text, level: '' }
}

function parseMain(cv: CVData, lines: PdfLine[]) {
  const page1 = lines.filter((line) => line.page === 1)
  const biggest = [...(page1.length ? page1 : lines)].sort((a, b) => b.fontSize - a.fontSize)[0]
  if (biggest && biggest.fontSize >= 12) cv.name = biggest.text

  const texts = lines.map((line) => line.text)
  const expAt = indexOfSection(texts, 'experience')
  const eduAt = indexOfSection(texts, 'education')
  const firstDate = texts.findIndex((text) => isDateAnchor(text))

  let headerEnd = texts.length
  for (let i = 0; i < texts.length; i++) {
    const section = sectionOf(texts[i])
    if (section === 'experience' || section === 'education' || section === 'summary') {
      headerEnd = i
      break
    }
    if (isDateAnchor(texts[i]) && i > 0) {
      headerEnd = i
      break
    }
  }

  cv.headline = collectHeadline(lines, cv.name, headerEnd)
  for (const line of lines.slice(0, headerEnd)) {
    if (looksLikeLocation(line.text) && !cv.contact.location) {
      cv.contact.location = line.text
    }
  }

  const fromMain = collectSummary(texts, cv)
  if (fromMain && fromMain.length >= cv.summary.trim().length) cv.summary = fromMain

  const expStart = expAt >= 0 ? expAt + 1 : firstDate >= 0 ? Math.max(0, firstDate - 2) : texts.length
  const expEnd = eduAt > expStart ? eduAt : stopIndex(texts, expStart, ['education', 'certs', 'honors', 'pubs'])
  cv.experience = collectExperience(texts.slice(expStart, expEnd), [cv.name])

  const eduStart = eduAt >= 0 ? eduAt + 1 : texts.length
  const eduEnd = stopIndex(texts, eduStart, ['certs', 'honors', 'pubs', 'skills', 'languages'])
  const partitioned = partitionEduWindow(texts.slice(eduStart, eduEnd).filter((text) => !sectionOf(text)))
  cv.education = partitioned.education
  cv.experience = dedupeJobs([...cv.experience, ...partitioned.jobs])
}

function indexOfSection(lines: string[], kind: string) {
  return lines.findIndex((line) => sectionOf(line) === kind)
}

function stopIndex(lines: string[], from: number, stops: string[]) {
  for (let i = from; i < lines.length; i++) {
    const section = sectionOf(lines[i])
    if (section && stops.includes(section)) return i
  }
  return lines.length
}

function collectHeadline(lines: PdfLine[], name: string, headerEnd: number): string {
  const parts: string[] = []
  for (const line of lines.slice(0, headerEnd)) {
    const text = line.text.trim()
    if (!text || text === name || sectionOf(text)) {
      if (parts.length) break
      continue
    }
    if (looksLikeLocation(text) || isDateLine(text) || isDurationOnly(text)) {
      if (parts.length) break
      continue
    }
    if (/@/.test(text) || /linkedin\.com/i.test(text) || /^https?:\/\//i.test(text)) continue
    if (line.fontSize < 8.5) {
      if (parts.length) break
      continue
    }
    if (!parts.length && !looksLikeHeadlineLine(text)) continue
    if (
      parts.length &&
      !shouldJoinHeadline(parts[parts.length - 1] ?? '', text) &&
      looksLikeProse(text) &&
      !looksLikeHeadlineLine(text)
    ) {
      break
    }
    parts.push(text)
    if (parts.length >= 4) break
  }
  return joinHeadlineParts(parts)
}

function looksLikeHeadlineLine(text: string) {
  if (/[|·•]/.test(text)) return true
  if (/[&/,:—–-]$/.test(text)) return true
  if (looksLikeJobTitle(text) && text.length <= 120) return true
  return !looksLikeProse(text) && text.split(/\s+/).length <= 12
}

function shouldJoinHeadline(prev: string, next: string) {
  if (/[&|·•,/:—–-]$/.test(prev.trim())) return true
  if (/^[a-záàâãéêíóôõúç]/.test(next.trim())) return true
  return next.split(/\s+/).length <= 3 && next.length <= 28
}

function joinHeadlineParts(parts: string[]) {
  return parts
    .reduce((acc, part) => {
      const piece = part.trim()
      if (!acc) return piece
      if (/[&|·•/—–-]$/.test(acc)) return `${acc} ${piece}`
      return `${acc} ${piece}`
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeProse(text: string) {
  const clean = text.trim()
  if (clean.length > 52) return true
  if (/[.!?…]$/.test(clean) && clean.length > 18) return true
  return false
}

function keepIntroLine(text: string, cv: CVData) {
  if (!text || text === cv.name || text === cv.headline) return false
  if (sectionOf(text) || isDateLine(text) || isDurationOnly(text)) return false
  if (looksLikeLocation(text)) return false
  if (/@/.test(text) || /linkedin\.com/i.test(text)) return false
  if (isHeaderish(text) && !looksLikeProse(text) && text.split(/\s+/).length <= 4 && text.length < 36) return false
  return looksLikeProse(text) || text.length > 24
}

function keepSummaryBody(text: string, cv: CVData) {
  if (!text || text === cv.name || text === cv.headline) return false
  if (isDateLine(text) || isDurationOnly(text)) return false
  if (looksLikeLocation(text)) return false
  if (/@/.test(text) || /linkedin\.com/i.test(text)) return false
  if (/^p[áa]gina\s+\d+|page\s+\d+/i.test(text)) return false
  return text.trim().length > 2
}

function collectSummary(texts: string[], cv: CVData) {
  const summaryAt = indexOfSection(texts, 'summary')
  const expAt = indexOfSection(texts, 'experience')
  const eduAt = indexOfSection(texts, 'education')
  const firstDate = texts.findIndex((text) => isDateAnchor(text))
  const labeled =
    summaryAt >= 0 &&
    (expAt < 0 || summaryAt < expAt) &&
    (eduAt < 0 || summaryAt < eduAt)
  const start = labeled ? summaryAt : 0
  const end = expAt >= 0 ? expAt : firstDate >= 0 ? firstDate : eduAt >= 0 ? eduAt : texts.length
  if (end <= start) return ''

  const parts = texts.slice(start, end).map((text) => {
    const split = splitSectionLine(text)
    if (split?.section === 'summary') return split.rest
    if (split && !split.rest) return ''
    return text
  })

  return joinProse(parts.filter((text) => (labeled ? keepSummaryBody(text, cv) : keepIntroLine(text, cv))))
}

function joinProse(parts: string[]) {
  return parts
    .reduce((acc, part) => {
      const piece = part.trim()
      if (!piece) return acc
      if (!acc) return piece
      if (acc.endsWith('-')) return `${acc.slice(0, -1)}${piece}`
      return `${acc} ${piece}`
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function harvestSummary(lines: PdfLine[], cv: CVData) {
  return collectSummary(
    lines.map((line) => line.text),
    cv,
  )
}

function educationWindow(lines: string[]) {
  const start = indexOfSection(lines, 'education')
  if (start === -1) return []
  const end = stopIndex(lines, start + 1, ['certs', 'honors', 'pubs', 'skills', 'languages', 'experience'])
  return lines.slice(start + 1, end).filter((text) => !sectionOf(text))
}

function looksLikeLocation(text: string): boolean {
  return (
    /,/.test(text) &&
    text.length < 80 &&
    !/@/.test(text) &&
    /(brasil|brazil|portugal|remote|remoto|são paulo|sao paulo|rio|lisboa|lisbon|city|area|região|regiao|distrito federal|united|states|kingdom)/i.test(
      text,
    )
  )
}

function looksLikePlace(text: string): boolean {
  return (
    looksLikeLocation(text) ||
    /^(remote|remoto|h[ií]brido|onsite|presencial|s[aã]o paulo|rio de janeiro|brasil|brazil|portugal|lisboa|lisbon)$/i.test(
      text.trim(),
    )
  )
}

function isHeaderish(text: string): boolean {
  const clean = cleanRoleLine(text)
  return (
    clean.length > 0 &&
    clean.length < 90 &&
    !looksLikeProse(clean) &&
    !/[.!?…]$/.test(clean) &&
    !isDurationOnly(text) &&
    !isDurationOnly(clean) &&
    !/^[•●▪◦-]/.test(clean) &&
    !isDateLine(clean) &&
    !looksLikePlace(clean)
  )
}

function isNoiseLine(text: string, skip: Set<string>) {
  const n = normalize(text)
  if (!text || skip.has(n)) return true
  if (/^p[áa]gina\s+\d+\s+de\s+\d+$/i.test(text)) return true
  if (/^page\s+\d+\s+of\s+\d+$/i.test(text)) return true
  if (isDurationOnly(text)) return true
  return false
}

function looksLikeEducationLine(text: string) {
  return looksLikeSchoolName(text) || looksLikeDegreeLine(text)
}

function looksLikeSchoolName(text: string) {
  return /(universidade|university|faculdade|col[eé]gio|college|instituto federal|instituto tecnol[oó]gico|centro universit|high school|ensino m[eé]dio|school of|\bsenac\b|\bsenai\b|\bsenat\b|\betec\b|\bcefet\b|\bunb\b|\busp\b|\bunicamp\b|\bufrj\b|\bifb\b)\b/i.test(
    text,
  )
}

function looksLikeDegreeLine(text: string) {
  return /(bachelor|bacharel|licenciatura|mestre|mestrado|doutor|phd|mba|tecn[oó]logo|t[eé]cnico em|curso superior de tecnologia|gradua[cç][aã]o|p[oó]s-gradua|associate degree|computer science|ci[eê]ncia da computa|an[aá]lise de desenvolvimento|an[aá]lise e desenvolvimento|tecnologia da informa|enfase em programa)/i.test(
    text,
  )
}

function looksLikeJobTitle(text: string) {
  return /\b(engineer|developer|desenvolvedor|analista|gerente|coordenador|consultor|designer|trainee|intern|estagi[aá]ri[oa]|arquiteto|scientist|specialist|especialista|programador|full stack|fullstack|frontend|backend|product owner|scrum master|administrador de banco)\b/i.test(
    text,
  )
}

function looksLikeCompanyNotSchool(text: string) {
  if (looksLikeSchoolName(text)) return false
  return /\b(tecnologia|systems|sistemas|software|labs|studio|consultoria|ltda|s\.a\.|inc\.?|corp)\b/i.test(text)
}

function looksLikeWorkDuty(text: string) {
  const clean = text.replace(/^[-–—•●▪◦]\s*/, '')
  return (
    /(development and maintenance|database administration|customer support|post-deployment|implementation for|client onboarding|backup routines|institutional web|nf-e|nfc-e|desenvolvimento e manuten|atendimento ao cliente|implanta[cç][aã]o|administra[cç][aã]o de banco)/i.test(
      clean,
    ) || /^[•●▪◦]/.test(text.trim())
  )
}

function isYearOnlyDate(text: string) {
  return /^\d{4}(\s*[-–—−‑·]\s*\d{4})?$/.test(text.trim())
}

function isEduJobHeader(text: string) {
  if (!text || isDateLine(text) || isDurationOnly(text) || looksLikePlace(text) || looksLikeLocation(text)) return false
  if (looksLikeSchoolName(text) || looksLikeDegreeLine(text) || looksLikeJobTitle(text)) return true
  return isHeaderish(text)
}

function blockLooksLikeSchool(block: string[]) {
  return block.some(looksLikeSchoolName) || (block.some(looksLikeDegreeLine) && !block.some(looksLikeJobTitle))
}

function blockLooksLikeJob(block: string[]) {
  const monthDated = block.some((line) => isDateLine(line) && hasMonthToken(line))
  const titled = block.some(looksLikeJobTitle)
  const duties = block.some(looksLikeWorkDuty)
  const company = block.some(looksLikeCompanyNotSchool)
  if (blockLooksLikeSchool(block) && !titled && !duties) return false
  return (monthDated && (titled || duties || company)) || (titled && duties) || (company && duties)
}

function splitMixedEduBlock(block: string[]): { job: string[]; edu: string[] } {
  const job: string[] = []
  const edu: string[] = []
  for (const line of block) {
    if (looksLikeSchoolName(line) || looksLikeDegreeLine(line) || (isYearOnlyDate(line) && !hasMonthToken(line))) {
      edu.push(line)
      continue
    }
    if (
      looksLikeJobTitle(line) ||
      looksLikeCompanyNotSchool(line) ||
      looksLikeWorkDuty(line) ||
      looksLikePlace(line) ||
      looksLikeLocation(line) ||
      (isDateLine(line) && hasMonthToken(line))
    ) {
      job.push(line)
      continue
    }
    if (looksLikeProse(line) || job.length) job.push(line)
    else edu.push(line)
  }
  return { job, edu }
}

function sliceDateBlocks(lines: string[]): string[][] {
  const dateIdx = lines
    .map((line, i) => (isDateLine(line) || isYearOnlyDate(line) ? i : -1))
    .filter((i) => i >= 0)
  if (!dateIdx.length) return lines.length ? [lines] : []

  const blocks: string[][] = []
  let consumed = 0
  for (let k = 0; k < dateIdx.length; k++) {
    const dateAt = dateIdx[k]
    let start = dateAt
    let taken = 0
    for (let i = dateAt - 1; i >= consumed && taken < 2; i--) {
      if (!isEduJobHeader(lines[i])) break
      start = i
      taken++
    }
    if (start > consumed && !blocks.length) start = consumed
    const nextDate = dateIdx[k + 1]
    let end = lines.length
    if (nextDate !== undefined) {
      let nextStart = nextDate
      let headerLines = 0
      for (let i = nextDate - 1; i > dateAt && headerLines < 2; i--) {
        if (!isEduJobHeader(lines[i])) break
        nextStart = i
        headerLines++
      }
      end = nextStart
    }
    if (start > consumed && blocks.length) {
      blocks[blocks.length - 1].push(...lines.slice(consumed, start))
    }
    blocks.push(lines.slice(start, end))
    consumed = end
  }
  if (consumed < lines.length && blocks.length) {
    blocks[blocks.length - 1].push(...lines.slice(consumed))
  }
  return blocks.filter((block) => block.some((line) => line.trim()))
}

function partitionEduWindow(lines: string[]): { education: Education[]; jobs: Experience[] } {
  const useful = stitchDateLines(stitchWrappedLines(lines.filter((text) => text && !sectionOf(text))))
  if (!useful.length) return { education: [], jobs: [] }

  const eduLines: string[] = []
  const jobLines: string[] = []
  for (const block of sliceDateBlocks(useful)) {
    const asJob = blockLooksLikeJob(block)
    const asSchool = blockLooksLikeSchool(block)
    if (asJob && !asSchool) {
      jobLines.push(...block)
      continue
    }
    if (asSchool && !asJob) {
      eduLines.push(...block)
      continue
    }
    const mixed = splitMixedEduBlock(block)
    jobLines.push(...mixed.job)
    eduLines.push(...mixed.edu)
  }

  return {
    education: splitEducation(eduLines).filter((ed) => !educationLooksLikeJob(ed)),
    jobs: collectExperience(jobLines, []),
  }
}

function educationLooksLikeJob(ed: Education) {
  if (looksLikeSchoolName(ed.school) || looksLikeDegreeLine(ed.degree) || looksLikeDegreeLine(ed.field)) return false
  return blockLooksLikeJob([ed.school, ed.degree, ed.field, ed.details].filter(Boolean))
}

function splitCompanyPlace(text: string): { company: string; location: string } {
  const parts = text.split(/\s*[·•|]\s*/).map((part) => part.trim()).filter(Boolean)
  if (parts.length < 2) return { company: text.trim(), location: '' }
  const location = parts.slice(1).join(' · ')
  if (looksLikePlace(location) || looksLikeLocation(location) || /brasil|brazil|região|regiao|distrito federal/i.test(location)) {
    return { company: parts[0], location }
  }
  return { company: text.trim(), location: '' }
}

function bestHarvest(left: PdfLine[], main: PdfLine[], skip: string[]): Experience[] {
  const fromMain = collectExperience(
    experienceWindow(main.map((line) => line.text)),
    skip,
  )
  const leftDates = left.filter((line) => isDateAnchor(line.text)).length
  const fromLeft =
    leftDates >= 2
      ? collectExperience(
          experienceWindow(left.map((line) => line.text)),
          skip,
        )
      : []
  return dedupeJobs([...fromMain, ...fromLeft])
}

function experienceWindow(lines: string[]): string[] {
  const expAt = indexOfSection(lines, 'experience')
  const dateAt = lines.findIndex((line) => isDateAnchor(line))
  const from = expAt >= 0 ? expAt + 1 : dateAt >= 0 ? Math.max(0, dateAt - 2) : -1
  if (from < 0) return []
  const cut: string[] = []
  for (let i = from; i < lines.length; i++) {
    const section = sectionOf(lines[i])
    if (section === 'education' || section === 'certs' || section === 'honors' || section === 'pubs') break
    cut.push(lines[i])
  }
  return cut
}

function collectExperience(lines: string[], skip: string[]): Experience[] {
  const ignore = new Set(skip.map(normalize).filter(Boolean))
  const useful: string[] = []
  for (const raw of lines) {
    const line = cleanRoleLine(raw)
    if (!line || isNoiseLine(line, ignore) || ignore.has(normalize(line))) continue
    const section = sectionOf(line)
    if (section === 'education' || section === 'certs' || section === 'honors' || section === 'pubs') break
    if (section) continue
    useful.push(line)
  }
  return splitExperience(stitchDateLines(stitchWrappedLines(useful)))
}

function dedupeJobs(jobs: Experience[]): Experience[] {
  const ranked = sortExperience(jobs)
  const seen = new Map<string, Experience>()
  for (const job of ranked) {
    const key = `${normalize(job.title)}|${normalize(job.company)}|${parseCvDate(job.startDate)}|${parseCvDate(job.endDate)}`
    const existing = seen.get(key)
    if (!existing || job.bullets.length > existing.bullets.length) seen.set(key, job)
  }
  const unique = [...seen.values()]
  const companies = new Set(unique.map((job) => normalize(job.company)).filter(Boolean))
  return unique.filter((job) => job.company || !companies.has(normalize(job.title)))
}

function splitExperience(lines: string[]): Experience[] {
  const dateIdx = lines.map((line, i) => (isDateLine(line) ? i : -1)).filter((i) => i >= 0)
  if (!dateIdx.length) return []

  const entries: Experience[] = []
  let consumed = 0

  for (let k = 0; k < dateIdx.length; k++) {
    const dateAt = dateIdx[k]
    let start = dateAt
    let taken = 0
    for (let i = dateAt - 1; i >= consumed && taken < 2; i--) {
      if (looksLikeProse(lines[i]) || !isHeaderish(lines[i])) break
      start = i
      taken++
    }

    if (start > consumed && entries.length) {
      entries[entries.length - 1].bullets.push(
        ...stitchWrappedLines(lines.slice(consumed, start)).flatMap(splitBullets).filter(Boolean),
      )
    }

    const nextDate = dateIdx[k + 1]
    let end = lines.length
    if (nextDate !== undefined) {
      let nextStart = nextDate
      let headerLines = 0
      const peeledRest = splitDateFromLine(lines[dateAt])?.rest
      const have = dateAt - start + (peeledRest ? 1 : 0)
      const lastReserved = dateAt + (have >= 2 ? 0 : 1)
      for (let i = nextDate - 1; i > lastReserved && headerLines < 2; i--) {
        if (looksLikeProse(lines[i]) || !isHeaderish(lines[i])) break
        nextStart = i
        headerLines++
      }
      end = nextStart
    }

    const parsed = experienceFromBlock(lines.slice(start, end))
    if (parsed) entries.push(parsed)
    consumed = end
  }

  return entries
}

function experienceFromBlock(lines: string[]): Experience | null {
  const dateIndex = lines.findIndex(isDateLine)
  if (dateIndex === -1) return null

  const peeled = splitDateFromLine(lines[dateIndex])
  const before = [...lines.slice(0, dateIndex), peeled?.rest ?? '']
    .map(cleanRoleLine)
    .filter(Boolean)
  const after = lines
    .slice(dateIndex + 1)
    .filter((line) => !looksLikeEducationLine(line) && sectionOf(line) !== 'education')
  const startDate = peeled?.start ?? datesFrom(lines[dateIndex])[0]
  const endDate = peeled?.end ?? datesFrom(lines[dateIndex])[1]

  let company = before.length > 1 ? before[0] : ''
  let title = before.length > 1 ? before[1] : before[0] ?? ''
  let descStart = 0
  let location = ''
  const skip = new Set<number>()

  if (after[0]) {
    const place = splitCompanyPlace(after[0])
    if (place.location) {
      if (!company) company = place.company
      location = place.location
      descStart = 1
    } else if (!company && isHeaderish(after[0]) && !looksLikePlace(after[0]) && !isDurationOnly(after[0])) {
      company = title
      title = cleanRoleLine(after[0])
      descStart = 1
    }
  }

  if (!company && title) {
    const idx = after.findIndex(
      (line, i) =>
        i >= descStart &&
        looksLikeJobTitle(line) &&
        isHeaderish(line) &&
        !looksLikePlace(line) &&
        !isDurationOnly(line) &&
        line.length < 72,
    )
    if (idx >= 0) {
      company = title
      title = cleanRoleLine(after[idx])
      skip.add(idx)
    }
  }

  const loc = after[descStart]
  if (!location && loc && loc.length < 64 && !isDateLine(loc) && !isDurationOnly(loc) && !skip.has(descStart)) {
    const place = splitCompanyPlace(loc)
    if (place.location || looksLikePlace(loc) || looksLikeLocation(loc)) {
      location = place.location || loc
      if (place.location && place.company && !company) company = place.company
      descStart += 1
    }
  }

  if (!location) {
    const locIdx = after.findIndex(
      (line, i) =>
        i >= descStart &&
        !skip.has(i) &&
        line.length < 64 &&
        (looksLikePlace(line) || looksLikeLocation(line)),
    )
    if (locIdx >= 0) {
      location = after[locIdx]
      skip.add(locIdx)
    }
  }

  if (!company && !title) return null

  return {
    id: uid(),
    company: title ? company : '',
    title: title || company,
    location,
    startDate,
    endDate,
    bullets: stitchWrappedLines(
      after
        .slice(descStart)
        .filter((_, i) => !skip.has(i + descStart))
        .flatMap(splitBullets)
        .filter((item) => item && !isDurationOnly(item) && !looksLikeEducationLine(item)),
    ),
  }
}

function splitEducation(lines: string[]): Education[] {
  const entries: Education[] = []
  let school = ''
  let body: string[] = []
  let startDate = ''
  let endDate = ''

  const flush = () => {
    if (!school && !body.length) return
    const peeled = peelEmbeddedDates(body.join(' '))
    const [degree, field] = splitDegree(peeled.rest)
    entries.push({
      id: uid(),
      school: school || peeled.rest,
      degree,
      field,
      startDate: startDate || peeled.start,
      endDate: endDate || peeled.end,
      details: '',
    })
    school = ''
    body = []
    startDate = ''
    endDate = ''
  }

  for (const raw of stitchWrappedLines(lines)) {
    const peeled = peelEmbeddedDates(raw)
    const text = peeled.rest || raw.trim()
    const newSchool = looksLikeSchoolName(text) || (school && body.length && isHeaderish(text) && !looksLikeDegreeLine(text) && text.length < 48)
    if (newSchool && (school || body.length)) {
      flush()
      school = text
      startDate = peeled.start
      endDate = peeled.end
      continue
    }
    if (!school) {
      school = text
      startDate = peeled.start
      endDate = peeled.end
      continue
    }
    if (peeled.start && !peeled.rest) {
      startDate = peeled.start
      endDate = peeled.end
      continue
    }
    body.push(text)
    if (peeled.start) {
      startDate = peeled.start
      endDate = peeled.end
    }
  }
  flush()
  return entries.filter((item) => item.school)
}

function peelEmbeddedDates(text: string): { rest: string; start: string; end: string } {
  const range = extractRange(text)
  if (!range) return { rest: text.trim(), start: '', end: '' }
  return {
    rest: stripMatchedRange(text),
    start: range.start,
    end: range.end,
  }
}

function stitchWrappedLines(lines: string[]): string[] {
  const out: string[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const prev = out[out.length - 1]
    if (prev && shouldJoinWrap(prev, line)) {
      out[out.length - 1] = joinProse([prev, line])
    } else {
      out.push(line)
    }
  }
  return out
}

function shouldJoinWrap(prev: string, next: string) {
  if (sectionOf(next) || looksLikeSchoolName(next)) return false
  if (/^[a-záàâãéêíóôõúç]/.test(next)) return true
  if (/\b(da|de|do|das|dos|em|com|e|and|the|of)$/i.test(normalize(prev))) return true
  if (/[·,:&|-]$/.test(prev)) return true
  return false
}

function harvestCertifications(lines: string[]): Certification[] {
  const start = indexOfSection(lines, 'certs')
  if (start === -1) return []
  const end = stopIndex(lines, start + 1, ['education', 'honors', 'pubs', 'skills', 'languages', 'experience', 'summary'])
  return stitchWrappedLines(lines.slice(start + 1, end).filter((text) => text && !sectionOf(text)))
    .filter((name) => name.length > 2 && !isDateLine(name) && !isDurationOnly(name))
    .map((name) => ({ id: uid(), name, issuer: '', date: '' }))
}

function stitchCertifications(items: Certification[]): Certification[] {
  return harvestNamedList(items.map((item) => item.name)).map((name) => ({
    id: uid(),
    name,
    issuer: '',
    date: '',
  }))
}

function harvestNamedList(names: string[]): string[] {
  return stitchWrappedLines(names.filter(Boolean))
}

function uniqueCerts(items: Certification[]): Certification[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = normalize(item.name)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function splitDegree(text: string): [string, string] {
  if (!text) return ['', '']
  const parts = text.split(',').map((p) => p.trim())
  if (parts.length > 1) return [parts[0], parts.slice(1).join(', ')]
  return [text, '']
}

function splitBullets(text: string): string[] {
  return text
    .split(/\s*[•●▪◦]\s+/)
    .flatMap((part) => part.split(/(?:^|\s)-\s+/))
    .map((part) => part.replace(/^[-–—•]\s*/, '').trim())
    .filter(Boolean)
}

function uniqueNamed(items: NamedItem[]): NamedItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = normalize(item.name)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueLanguages(items: Language[]): Language[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = normalize(item.name)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
