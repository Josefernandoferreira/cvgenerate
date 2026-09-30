import type { CvLang } from '../types'

const GOOGLE_LANG: Record<CvLang, string> = {
  pt: 'pt',
  en: 'en',
  es: 'es',
}

export async function translateWithGoogle(
  texts: string[],
  source: CvLang,
  target: CvLang,
): Promise<string[]> {
  if (!texts.length || source === target) return texts
  const batches = pack(texts, 40, 4500)
  const out: string[] = []
  for (const batch of batches) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: batch,
        source: GOOGLE_LANG[source],
        target: GOOGLE_LANG[target],
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Google Translate failed', response.status, err)
      out.push(...batch.map(() => ''))
      continue
    }
    const data = (await response.json()) as { translations?: string[] }
    const translations = data.translations ?? []
    batch.forEach((_, i) => out.push(typeof translations[i] === 'string' ? translations[i] : ''))
  }
  return out
}

function pack(texts: string[], maxItems: number, maxChars: number) {
  const batches: string[][] = []
  let current: string[] = []
  let size = 0
  for (const text of texts) {
    const next = text.length
    if (current.length && (current.length >= maxItems || size + next > maxChars)) {
      batches.push(current)
      current = []
      size = 0
    }
    current.push(text)
    size += next
  }
  if (current.length) batches.push(current)
  return batches
}
