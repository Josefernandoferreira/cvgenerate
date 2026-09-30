export type LayoutId = 'classic' | 'modern' | 'sidebar' | 'minimal' | 'editorial'

export type AccentId = 'copper' | 'forest' | 'navy' | 'burgundy' | 'ink' | 'teal'

export type RegionId = 'br' | 'eu' | 'us'

export type CvLang = 'pt' | 'en' | 'es'

export type PaperId = 'a4' | 'letter'

export type DocMode = 'cv' | 'letter'

export interface Contact {
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
}

export interface Experience {
  id: string
  company: string
  title: string
  location: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  details: string
}

export interface NamedItem {
  id: string
  name: string
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

export interface CVData {
  name: string
  headline: string
  summary: string
  objective: string
  nationality: string
  workAuth: string
  photo: string
  contact: Contact
  experience: Experience[]
  education: Education[]
  skills: NamedItem[]
  languages: Language[]
  certifications: Certification[]
}

export interface CoverLetter {
  company: string
  role: string
  recipient: string
  greeting: string
  body: string
  signOff: string
  date: string
}

export interface AppState {
  cv: CVData
  letter: CoverLetter
  mode: DocMode
  layout: LayoutId
  accent: AccentId
  region: RegionId
  lang: CvLang
}

export const ACCENTS: Record<AccentId, string> = {
  copper: '#c45c26',
  forest: '#2f5d4a',
  navy: '#1e3a5f',
  burgundy: '#7a2e3a',
  ink: '#1a1814',
  teal: '#0d5c63',
}

export const LAYOUTS: { id: LayoutId; name: string; blurb: string }[] = [
  { id: 'classic', name: 'Clássico', blurb: 'Uma coluna, ATS-friendly' },
  { id: 'modern', name: 'Moderno', blurb: 'Duas colunas com destaque' },
  { id: 'sidebar', name: 'Sidebar', blurb: 'Faixa lateral com contato' },
  { id: 'minimal', name: 'Minimal', blurb: 'Espaço e tipografia leve' },
  { id: 'editorial', name: 'Editorial', blurb: 'Capa de revista, elegante' },
]
