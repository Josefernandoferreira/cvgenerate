import JSZip from 'jszip'
import type { CVData } from '../types'
import { parseCsv, pick } from './csv'
import { emptyCv } from './empty'
import { uid } from './id'
import { organizeCv, stitchBulletLines } from './organize'

export async function parseLinkedInZip(file: File): Promise<CVData> {
  const zip = await JSZip.loadAsync(file)
  const files = Object.keys(zip.files)
  const cv = emptyCv()

  const profile = await readCsv(zip, files, ['profile.csv'])
  const positions = await readCsv(zip, files, ['positions.csv'])
  const education = await readCsv(zip, files, ['education.csv'])
  const skills = await readCsv(zip, files, ['skills.csv'])
  const languages = await readCsv(zip, files, ['languages.csv'])
  const certs = await readCsv(zip, files, ['certifications.csv'])
  const emails = await readCsv(zip, files, ['email addresses.csv', 'emails.csv'])
  const phones = await readCsv(zip, files, ['phone numbers.csv', 'phonenumbers.csv'])

  if (profile[0]) {
    const row = profile[0]
    const first = pick(row, 'First Name', 'Nome', 'FirstName')
    const last = pick(row, 'Last Name', 'Sobrenome', 'LastName')
    cv.name = [first, last].filter(Boolean).join(' ')
    cv.headline = pick(row, 'Headline', 'Headline', 'Cargo')
    cv.summary = pick(row, 'Summary', 'Resumo', 'About', 'Sobre', 'About Me')
    cv.contact.location =
      pick(row, 'Geo Location', 'Location', 'Address', 'Localidade') ||
      pick(row, 'Zip Code')
    const websites = pick(row, 'Websites', 'Website')
    if (websites) {
      const urls = websites
        .split(/,|\s+/)
        .map((part) => part.replace(/^[A-Z]+:/i, '').trim())
        .filter((part) => /^https?:\/\//i.test(part) || /\./.test(part))
      const site = urls.find((u) => !/linkedin\.com/i.test(u))
      const li = urls.find((u) => /linkedin\.com/i.test(u))
      if (site) cv.contact.website = site.replace(/^https?:\/\//, '')
      if (li) cv.contact.linkedin = li.replace(/^https?:\/\//, '')
    }
  }

  if (emails[0]) {
    const primary =
      emails.find((row) => /true|yes|sim|primary/i.test(pick(row, 'Primary', 'Confirmed'))) ??
      emails[0]
    cv.contact.email = pick(primary, 'Email Address', 'Email', 'E-mail')
  }

  if (phones[0]) {
    cv.contact.phone = pick(phones[0], 'Number', 'Phone Number', 'Phone', 'Telefone')
  }

  cv.experience = positions.map((row) => {
    const description = pick(row, 'Description', 'Descrição', 'Descricao')
    return {
      id: uid(),
      company: pick(row, 'Company Name', 'Company', 'Empresa'),
      title: pick(row, 'Title', 'Cargo'),
      location: pick(row, 'Location', 'Localidade'),
      startDate: pick(row, 'Started On', 'Start Date', 'Início', 'Inicio'),
      endDate: pick(row, 'Finished On', 'End Date', 'Término', 'Termino') || 'Atual',
      bullets: bulletsFrom(description),
    }
  })

  cv.education = education.map((row) => ({
    id: uid(),
    school: pick(row, 'School Name', 'School', 'Instituição', 'Instituicao'),
    degree: pick(row, 'Degree Name', 'Degree', 'Diploma'),
    field: pick(row, 'Notes', 'Field Of Study', 'Área', 'Area'),
    startDate: pick(row, 'Start Date', 'Started On', 'Início', 'Inicio'),
    endDate: pick(row, 'End Date', 'Finished On', 'Término', 'Termino'),
    details: pick(row, 'Activities', 'Atividades'),
  }))

  cv.skills = skills
    .map((row) => pick(row, 'Name', 'Skill', 'Competência', 'Competencia'))
    .filter(Boolean)
    .map((name) => ({ id: uid(), name }))

  cv.languages = languages.map((row) => ({
    id: uid(),
    name: pick(row, 'Name', 'Language', 'Idioma'),
    level: pick(row, 'Proficiency', 'Nível', 'Nivel'),
  }))

  cv.certifications = certs.map((row) => ({
    id: uid(),
    name: pick(row, 'Name', 'Certification'),
    issuer: pick(row, 'Authority', 'Issuer', 'Emissor'),
    date: pick(row, 'Started On', 'Start Date'),
  }))

  if (!cv.name && !cv.experience.length && !cv.skills.length) {
    throw new Error(
      'Não reconheci os arquivos do LinkedIn neste ZIP. Exporte em Configurações → Dados → Obter uma cópia (perfil).',
    )
  }

  return organizeCv(cv)
}

async function readCsv(
  zip: JSZip,
  files: string[],
  patterns: string[],
): Promise<Record<string, string>[]> {
  const match = files.find((name) => {
    const lower = name.replace(/\\/g, '/').toLowerCase()
    const base = lower.split('/').pop() ?? lower
    return patterns.some((p) => base === p || base.endsWith(p))
  })
  if (!match || zip.files[match].dir) return []
  const text = await zip.files[match].async('string')
  return parseCsv(text)
}

function bulletsFrom(text: string): string[] {
  if (!text) return []
  return stitchBulletLines(
    text
      .split(/\r?\n|(?:\s*[•●▪]\s+)/)
      .map((part) => part.replace(/^[-–—•]\s*/, '').trim())
      .filter(Boolean),
  )
}
