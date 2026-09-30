import type { CVData } from '../types'
import { uid } from './id'

export function emptyCv(): CVData {
  return {
    name: '',
    headline: '',
    summary: '',
    objective: '',
    nationality: '',
    workAuth: '',
    photo: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
  }
}

export function emptyExperience() {
  return {
    id: uid(),
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [''],
  }
}

export function emptyEducation() {
  return {
    id: uid(),
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    details: '',
  }
}

export function emptySkill() {
  return { id: uid(), name: '' }
}

export function emptyLanguage() {
  return { id: uid(), name: '', level: '' }
}

export function emptyCertification() {
  return { id: uid(), name: '', issuer: '', date: '' }
}
