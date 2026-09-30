import type { AccentId, CVData, LayoutId, PaperId, RegionId } from '../types'
import { organizeCv } from './organize'

export type SectionId =
  | 'objective'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'

export interface Labels {
  document: string
  nameFallback: string
  contact: string
  summary: string
  objective: string
  profile: string
  experience: string
  education: string
  skills: string
  languages: string
  certifications: string
  nationality: string
  workAuth: string
  path: string
  study: string
  craft: string
  tongues: string
  seals: string
  closing: string
}

export interface RegionProfile {
  id: RegionId
  flag: string
  name: string
  formal: string
  paper: PaperId
  showPhoto: boolean
  showObjective: boolean
  showWorkAuth: boolean
  preferredLayout: LayoutId
  preferredAccent: AccentId
  sections: SectionId[]
  labels: Labels
  tips: string[]
}

export const PAPER: Record<PaperId, { widthMm: number; heightMm: number; widthPx: number; heightPx: number }> = {
  a4: { widthMm: 210, heightMm: 297, widthPx: 794, heightPx: 1123 },
  letter: { widthMm: 215.9, heightMm: 279.4, widthPx: 816, heightPx: 1056 },
}

export const REGIONS: Record<RegionId, RegionProfile> = {
  br: {
    id: 'br',
    flag: 'BR',
    name: 'Brasil',
    formal: 'Currículo',
    paper: 'a4',
    showPhoto: true,
    showObjective: true,
    showWorkAuth: false,
    preferredLayout: 'modern',
    preferredAccent: 'copper',
    sections: ['objective', 'summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
    labels: {
      document: 'Currículo',
      nameFallback: 'Seu nome',
      contact: 'Contato',
      summary: 'Resumo',
      objective: 'Objetivo',
      profile: 'Perfil',
      experience: 'Experiência',
      education: 'Formação acadêmica',
      skills: 'Competências',
      languages: 'Idiomas',
      certifications: 'Certificações',
      nationality: 'Nacionalidade',
      workAuth: 'Visto',
      path: 'Percurso',
      study: 'Estudo',
      craft: 'Ofício',
      tongues: 'Línguas',
      seals: 'Selos',
      closing:
        'Estou ciente da grande responsabilidade em que me aplico e estou disponível para mudanças ou viagens.',
    },
    tips: [
      'Foto é comum no Brasil, mas não é obrigatória.',
      'Um objetivo de 1–2 linhas ajuda em vagas locais.',
      'Duas páginas são aceitáveis se a experiência pedir.',
      'Não coloque CPF, RG, endereço completo ou estado civil.',
    ],
  },
  eu: {
    id: 'eu',
    flag: 'EU',
    name: 'Europa',
    formal: 'Curriculum Vitae',
    paper: 'a4',
    showPhoto: true,
    showObjective: false,
    showWorkAuth: true,
    preferredLayout: 'classic',
    preferredAccent: 'navy',
    sections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
    labels: {
      document: 'Curriculum Vitae',
      nameFallback: 'Your name',
      contact: 'Contact',
      summary: 'Profile',
      objective: 'Objective',
      profile: 'Profile',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      languages: 'Languages',
      certifications: 'Certifications',
      nationality: 'Nationality',
      workAuth: 'Work authorization',
      path: 'Experience',
      study: 'Education',
      craft: 'Skills',
      tongues: 'Languages',
      seals: 'Certificates',
      closing:
        'I am aware of the great responsibility I take on and am available for relocation or travel.',
    },
    tips: [
      'Papel A4. Duas páginas são o padrão, não uma.',
      'Idiomas no CEFR: A1–A2, B1–B2, C1–C2.',
      'Foto é comum na Alemanha, França, Itália e Espanha. No Reino Unido e nos Países Baixos, omita.',
      'Nacionalidade ou autorização de trabalho só se facilitar a contratação (ex.: cidadania UE).',
    ],
  },
  us: {
    id: 'us',
    flag: 'US',
    name: 'EUA',
    formal: 'Resume',
    paper: 'letter',
    showPhoto: false,
    showObjective: false,
    showWorkAuth: false,
    preferredLayout: 'classic',
    preferredAccent: 'ink',
    sections: ['summary', 'skills', 'experience', 'education', 'certifications', 'languages'],
    labels: {
      document: 'Resume',
      nameFallback: 'Your name',
      contact: 'Contact',
      summary: 'Summary',
      objective: 'Objective',
      profile: 'Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      languages: 'Languages',
      certifications: 'Certifications',
      nationality: 'Nationality',
      workAuth: 'Work authorization',
      path: 'Experience',
      study: 'Education',
      craft: 'Skills',
      tongues: 'Languages',
      seals: 'Certifications',
      closing:
        'I am aware of the great responsibility I take on and am available for relocation or travel.',
    },
    tips: [
      'Resume de uma página em formato Letter. Duas só em carreira longa.',
      'Sem foto, idade, estado civil, nacionalidade ou endereço residencial.',
      'Cada bullet começa com verbo e, se possível, um número.',
      'Layout clássico lê melhor em ATS. Evite colunas pesadas.',
    ],
  },
}

export const REGION_LIST = Object.values(REGIONS)

export function adaptCvForRegion(cv: CVData, region: RegionId): CVData {
  return organizeCv({
    ...cv,
    languages: cv.languages.map((item) => ({
      ...item,
      level: mapLevel(item.level, region),
    })),
  })
}

function mapLevel(level: string, region: RegionId): string {
  const raw = level.trim()
  if (!raw) return raw
  const key = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/—/g, '-')

  const cefr = key.match(/\b([abc][12])\b/)
  const token = cefr?.[1]?.toUpperCase() ?? classifyLevel(key)

  if (region === 'eu') {
    const labels: Record<string, string> = {
      C2: 'C2',
      C1: 'C1',
      B2: 'B2',
      B1: 'B1',
      A2: 'A2',
      A1: 'A1',
    }
    return token ? labels[token] ?? raw : raw
  }
  if (region === 'us') {
    const labels: Record<string, string> = {
      C2: 'Native',
      C1: 'Fluent',
      B2: 'Professional',
      B1: 'Intermediate',
      A2: 'Basic',
      A1: 'Basic',
    }
    return token ? labels[token] ?? raw : raw
  }
  const labels: Record<string, string> = {
    C2: 'Nativo',
    C1: 'Fluente',
    B2: 'Avançado',
    B1: 'Intermediário',
    A2: 'Básico',
    A1: 'Básico',
  }
  return token ? labels[token] ?? raw : raw
}

function classifyLevel(key: string): string {
  if (/(nativo|native|bilingual|c2)/.test(key)) return 'C2'
  if (/(fluente|fluent|full professional|c1)/.test(key)) return 'C1'
  if (/(avancado|advanced|professional working|b2)/.test(key)) return 'B2'
  if (/(intermediario|intermediate|limited working|b1)/.test(key)) return 'B1'
  if (/(basico|basic|elemental|a2|a1)/.test(key)) return 'A2'
  return ''
}
