import type { CVData } from '../types'
import { parseLinkedInPdf } from './parsePdf'
import { parseLinkedInZip } from './parseZip'

export function isSparseCv(cv: CVData): boolean {
  return (
    !cv.name.trim() &&
    !cv.headline.trim() &&
    !cv.experience.some((item) => item.title || item.company) &&
    !cv.education.some((item) => item.school) &&
    !cv.summary.trim()
  )
}

export async function importCvFile(file: File): Promise<CVData> {
  const kind = await sniff(file)
  if (kind === 'pdf') return parseLinkedInPdf(file)
  if (kind === 'zip') return parseLinkedInZip(file)
  if (kind === 'json') {
    const parsed = JSON.parse(await file.text()) as CVData
    if (!parsed || typeof parsed !== 'object' || !('name' in parsed)) {
      throw new Error('JSON inválido. Use um arquivo exportado por este app.')
    }
    return parsed
  }
  throw new Error('Envie o PDF do LinkedIn (Recursos → Salvar em PDF) ou o ZIP da exportação de dados.')
}

async function sniff(file: File): Promise<'pdf' | 'zip' | 'json' | 'unknown'> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.zip')) return 'zip'
  if (name.endsWith('.json')) return 'json'

  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const ascii = String.fromCharCode(...head)
  if (ascii.startsWith('%PDF')) return 'pdf'
  if (head[0] === 0x50 && head[1] === 0x4b) return 'zip'
  if (ascii.trimStart().startsWith('{') || ascii.trimStart().startsWith('[')) return 'json'
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.includes('zip')) return 'zip'
  if (file.type.includes('json')) return 'json'
  return 'unknown'
}
