import { readFileSync } from 'node:fs'
import { parseLinkedInZip } from '../src/lib/parseZip.ts'

const file = new File([readFileSync('public/sample-linkedin.zip')], 'sample-linkedin.zip', {
  type: 'application/zip',
})
const cv = await parseLinkedInZip(file)
const checks = {
  name: cv.name === 'Ana Mendes',
  email: cv.contact.email === 'ana.mendes@email.com',
  jobs: cv.experience.length === 2,
  title: cv.experience[0]?.title === 'Lead Product Designer',
  school: cv.education[0]?.school === 'FAU-USP',
  skills: cv.skills.length === 3,
}
if (Object.values(checks).some((ok) => !ok)) {
  console.error(checks, cv)
  process.exit(1)
}
console.log('zip parser ok', cv.name, cv.experience.map((j) => j.title).join(', '))
