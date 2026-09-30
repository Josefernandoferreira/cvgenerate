import type { AppState, CVData } from '../types'
import { mergeLetter } from './coverLetter'
import { emptyCv } from './empty'
import { organizeCv } from './organize'

const KEY = 'folio-cv-state-v1'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    if (!parsed?.cv) return null
    const lang = parsed.lang ?? 'pt'
    return {
      cv: organizeCv({ ...emptyCv(), ...parsed.cv, contact: { ...emptyCv().contact, ...parsed.cv.contact } }),
      letter: mergeLetter(parsed.letter, lang),
      mode: parsed.mode === 'letter' ? 'letter' : 'cv',
      layout: parsed.layout ?? 'classic',
      accent: parsed.accent ?? 'copper',
      region: parsed.region ?? 'br',
      lang,
    }
  } catch {
    return null
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function mergeCv(partial: Partial<CVData>): CVData {
  const base = emptyCv()
  return {
    ...base,
    ...partial,
    contact: { ...base.contact, ...partial.contact },
    experience: partial.experience ?? [],
    education: partial.education ?? [],
    skills: partial.skills ?? [],
    languages: partial.languages ?? [],
    certifications: partial.certifications ?? [],
  }
}
