import { formatDateForLang } from '../src/lib/organize.ts'
import { detectLang, translateCvLocal } from '../src/lib/translateCv.ts'
import { sampleCv } from '../src/sample.ts'

if (detectLang('Desenvolvedor com formação acadêmica e ênfase em backend') !== 'pt') {
  console.error('detect pt failed')
  process.exit(1)
}
if (detectLang('Senior Software Engineer. Front-end: Criação de interfaces de usuário com Next.js') !== 'pt') {
  console.error('mixed pt cv should detect as pt')
  process.exit(1)
}

const wrapped = {
  ...sampleCv,
  experience: [
    {
      ...sampleCv.experience[0],
      title: 'Senior Software Engineer',
      bullets: [
        'Front-end: Criação de interfaces de usuário com Next.js e React, garantindo uma experiência moderna e experiências de usuário eficientes.',
      ],
    },
  ],
}
const wrappedEn = translateCvLocal(wrapped, 'en')
const bullet = wrappedEn.experience[0]?.bullets[0] ?? ''
if (/cria[cç][aã]o|usu[aá]rio|garantindo/i.test(bullet)) {
  console.error('pt bullet was not translated to en', bullet)
  process.exit(1)
}
if (!/user interfaces|creating/i.test(bullet)) {
  console.error('en bullet missing expected terms', bullet)
  process.exit(1)
}
if (detectLang('Senior software engineer with development experience in the cloud') !== 'en') {
  console.error('detect en failed')
  process.exit(1)
}
if (detectLang('Desarrollador con formación académica y un resumen de trayectoria') !== 'es') {
  console.error('detect es failed')
  process.exit(1)
}

if (formatDateForLang('Present', 'pt') !== 'Atual') {
  console.error('present -> atual failed', formatDateForLang('Present', 'pt'))
  process.exit(1)
}
if (formatDateForLang('Atual', 'en') !== 'Present') {
  console.error('atual -> present failed')
  process.exit(1)
}
if (formatDateForLang('fevereiro de 2015', 'es') !== 'Feb 2015') {
  console.error('feb 2015 es failed', formatDateForLang('fevereiro de 2015', 'es'))
  process.exit(1)
}

const es = translateCvLocal(sampleCv, 'es')
if (es.name !== sampleCv.name) {
  console.error('name should stay', es.name)
  process.exit(1)
}
if (es.experience[0]?.company !== sampleCv.experience[0]?.company) {
  console.error('company should stay', es.experience[0]?.company)
  process.exit(1)
}
if (!/actual/i.test(es.experience[0]?.endDate ?? '')) {
  console.error('spanish current date failed', es.experience[0]?.endDate)
  process.exit(1)
}
if (!/nativo/i.test(es.languages.map((item) => item.level).join(' '))) {
  console.error('spanish language level failed', es.languages)
  process.exit(1)
}

const en = translateCvLocal(sampleCv, 'en')
if (!/present/i.test(en.experience[0]?.endDate ?? '')) {
  console.error('english current date failed', en.experience[0]?.endDate)
  process.exit(1)
}

const certCv = {
  ...sampleCv,
  certifications: [
    {
      id: 'c1',
      name: 'Formação PHP',
      issuer: 'Escola de programação',
      date: 'março de 2023',
    },
  ],
}
const esCert = translateCvLocal(certCv, 'es')
if (!/formaci[oó]n php/i.test(esCert.certifications[0]?.name ?? '')) {
  console.error('cert name es failed', esCert.certifications[0])
  process.exit(1)
}
if (!/escuela de programaci[oó]n/i.test(esCert.certifications[0]?.issuer ?? '')) {
  console.error('cert issuer es failed', esCert.certifications[0])
  process.exit(1)
}
if (!/mar 2023/i.test(esCert.certifications[0]?.date ?? '')) {
  console.error('cert date es failed', esCert.certifications[0])
  process.exit(1)
}

console.log('translate local ok', es.experience[0]?.endDate, en.experience[0]?.endDate)
