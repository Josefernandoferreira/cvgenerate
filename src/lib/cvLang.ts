import type { CvLang } from '../types'
import type { Labels } from './regions'

export const CV_LANGS: { id: CvLang; name: string; native: string }[] = [
  { id: 'pt', name: 'Português', native: 'PT' },
  { id: 'en', name: 'English', native: 'EN' },
  { id: 'es', name: 'Español', native: 'ES' },
]

export const CV_LANG_LABELS: Record<CvLang, Labels> = {
  pt: {
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
  en: {
    document: 'Resume',
    nameFallback: 'Your name',
    contact: 'Contact',
    summary: 'Summary',
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
    seals: 'Certifications',
    closing:
      'I am aware of the great responsibility I take on and am available for relocation or travel.',
  },
  es: {
    document: 'Currículum',
    nameFallback: 'Tu nombre',
    contact: 'Contacto',
    summary: 'Resumen',
    objective: 'Objetivo',
    profile: 'Perfil',
    experience: 'Experiencia',
    education: 'Formación académica',
    skills: 'Competencias',
    languages: 'Idiomas',
    certifications: 'Certificaciones',
    nationality: 'Nacionalidad',
    workAuth: 'Permiso de trabajo',
    path: 'Trayectoria',
    study: 'Estudios',
    craft: 'Oficio',
    tongues: 'Idiomas',
    seals: 'Certificados',
    closing:
      'Soy consciente de la gran responsabilidad que asumo y estoy disponible para mudanzas o viajes.',
  },
}

export function langName(id: CvLang) {
  return CV_LANGS.find((item) => item.id === id)?.name ?? id
}

export function labelsForLang(lang: CvLang): Labels {
  return CV_LANG_LABELS[lang]
}

const MONTHS_LONG: Record<CvLang, string[]> = {
  pt: [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
}

export function formatToday(lang: CvLang, date = new Date()): string {
  const day = date.getDate()
  const month = MONTHS_LONG[lang][date.getMonth()]
  const year = date.getFullYear()
  if (lang === 'en') return `${month} ${day}, ${year}`
  return `${day} de ${month} de ${year}`
}
