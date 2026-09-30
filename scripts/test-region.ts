import { adaptCvForRegion } from '../src/lib/regions.ts'
import { sampleCv } from '../src/sample.ts'

const eu = adaptCvForRegion(sampleCv, 'eu')
const us = adaptCvForRegion(sampleCv, 'us')
const br = adaptCvForRegion(eu, 'br')

const levels = (cv: typeof sampleCv) => cv.languages.map((l) => l.level).join(',')
if (!levels(eu).includes('C2') || !levels(eu).includes('C1')) {
  console.error('EU CEFR failed', levels(eu))
  process.exit(1)
}
if (!levels(us).includes('Native') || !levels(us).includes('Fluent')) {
  console.error('US levels failed', levels(us))
  process.exit(1)
}
if (!levels(br).includes('Nativo') || !levels(br).includes('Fluente')) {
  console.error('BR levels failed', levels(br))
  process.exit(1)
}
console.log('region levels ok', { eu: levels(eu), us: levels(us), br: levels(br) })
