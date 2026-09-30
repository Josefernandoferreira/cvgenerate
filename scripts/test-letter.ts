import { draftCoverLetter, emptyLetter, isLetterSparse, letterParagraphs } from '../src/lib/coverLetter.ts'
import { translateCoverLetterLocal } from '../src/lib/translateCv.ts'
import { sampleCv } from '../src/sample.ts'

const letter = draftCoverLetter(sampleCv, 'pt')
if (isLetterSparse(letter)) {
  console.error('draft should not be sparse')
  process.exit(1)
}
if (!/nimbus/i.test(letter.body) || letterParagraphs(letter.body).length < 3) {
  console.error('draft body failed', letter.body)
  process.exit(1)
}

const en = translateCoverLetterLocal(letter, 'en', 'pt')
if (!/dear hiring manager/i.test(en.greeting)) {
  console.error('greeting en failed', en.greeting)
  process.exit(1)
}
if (!/sincerely/i.test(en.signOff)) {
  console.error('signoff en failed', en.signOff)
  process.exit(1)
}

const blank = emptyLetter('es')
if (!/estimado/i.test(blank.greeting)) {
  console.error('empty es greeting failed', blank.greeting)
  process.exit(1)
}

console.log('cover letter ok')
