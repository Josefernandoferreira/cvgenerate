import { extractRange, groupExperience, parseCvDate, sortExperience, stitchDateLines } from '../src/lib/organize.ts'
import { sampleCv } from '../src/sample.ts'

const cases = [
  ['Jan 2020 - Present · 4 yrs 2 mos', 'Jan 2020', 'Present'],
  ['jan. de 2020 - o momento (4 anos 2 meses)', 'Jan 2020', 'Atual'],
  ['March 2022 - Present (3 years)', 'Mar 2022', 'Present'],
  ['2019 - 2021', '2019', '2021'],
  ['janeiro de 2019 a dezembro de 2021', 'Jan 2019', 'Dez 2021'],
  ['Jun 2022 · Present', 'Jun 2022', 'Present'],
  ['Jun 2022 · Present · 8 mos', 'Jun 2022', 'Present'],
  ['jun. de 2022 · o momento (8 meses)', 'Jun 2022', 'Atual'],
  ['Jan 2021 · May 2022', 'Jan 2021', 'May 2022'],
] as const

for (const [input, start, end] of cases) {
  const range = extractRange(input)
  if (!range || range.start !== start || range.end !== end) {
    console.error('range failed', input, range, { start, end })
    process.exit(1)
  }
}

const messy = sampleCv.experience.map((job, i) =>
  i === 0
    ? { ...job, startDate: 'Mar 2022 - Present · 3 yrs', endDate: '' }
    : job,
)
const sorted = sortExperience([...messy].reverse())
if (sorted[0]?.title !== 'Lead Product Designer' || sorted[0].endDate !== 'Present') {
  console.error('normalize+sort failed', sorted[0])
  process.exit(1)
}

const groups = groupExperience(messy)
if (groups[0]?.company !== 'Nimbus Pay' || groups[0].roles.length !== 2) {
  console.error('expected Nimbus grouped', groups)
  process.exit(1)
}
if (parseCvDate('Mar 2022') <= parseCvDate('Jan 2020')) {
  console.error('date parse failed')
  process.exit(1)
}
const stitched = stitchDateLines(['March 2022', 'Present (3 years)', 'Nimbus Pay'])
if (!extractRange(stitched[0]) || stitched[0] !== 'March 2022 - Present (3 years)') {
  console.error('stitch failed', stitched)
  process.exit(1)
}

const wrappedBullets = sortExperience([
  {
    id: 'wrap-1',
    title: 'Software Engineer',
    company: 'Devcode',
    location: 'Brasília',
    startDate: 'Jun 2022',
    endDate: 'Present',
    bullets: [
      'Front-end: Criação de interfaces de usuário com Next.js e React, garantindo uma experiência moderna',
      'e experiências de usuário eficientes.',
      'Back-end: APIs REST com Laravel',
    ],
  },
])
if (wrappedBullets[0]?.bullets.length !== 2) {
  console.error('wrapped bullet should stay one item', wrappedBullets[0]?.bullets)
  process.exit(1)
}
if (!wrappedBullets[0].bullets[0].includes('experiência moderna e experiências de usuário eficientes')) {
  console.error('wrapped bullet was not joined', wrappedBullets[0].bullets)
  process.exit(1)
}
if (wrappedBullets[0].bullets[1] !== 'Back-end: APIs REST com Laravel') {
  console.error('next bullet should stay separate', wrappedBullets[0].bullets)
  process.exit(1)
}

console.log('organize ok', groups.map((g) => `${g.company}: ${g.roles.map((r) => `${r.title} ${r.startDate}-${r.endDate}`).join(' | ')}`).join(' || '))
