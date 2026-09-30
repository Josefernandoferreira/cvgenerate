import { findItemSplit, groupLines, interpretColumns, interpretLines, type PdfLine } from '../src/lib/parseLines.ts'

function line(text: string, x: number, y: number, fontSize: number): PdfLine {
  return { text, x, y, fontSize, page: 1 }
}

const lines: PdfLine[] = [
  line('Contact', 36, 740, 11),
  line('ana.mendes@email.com', 36, 722, 9),
  line('+55 11 98888-1122', 36, 708, 9),
  line('linkedin.com/in/anaclara', 36, 694, 9),
  line('São Paulo, Brasil', 36, 680, 9),
  line('Top Skills', 36, 640, 11),
  line('Product design', 36, 622, 9),
  line('Figma', 36, 608, 9),
  line('Design systems', 36, 594, 9),
  line('Languages', 36, 560, 11),
  line('Portuguese (Native or Bilingual)', 36, 542, 9),
  line('English (Full Professional)', 36, 528, 9),
  line('Ana Clara Mendes', 220, 740, 22),
  line('Product Designer · Sistemas de design', 220, 712, 11),
  line('São Paulo, Brazil', 220, 694, 10),
  line('Designer de produto com 8 anos criando interfaces claras para produtos B2B.', 220, 660, 10),
  line('Experience', 220, 620, 12),
  line('Nimbus Pay', 220, 598, 11),
  line('Lead Product Designer', 220, 582, 11),
  line('March 2022 - Present (3 years)', 220, 566, 10),
  line('São Paulo', 220, 550, 10),
  line('Lidero o design system usado por 4 squads.', 220, 534, 10),
  line('Atlas Saúde', 220, 500, 11),
  line('Product Designer', 220, 484, 11),
  line('January 2019 - February 2022 (3 years)', 220, 468, 10),
  line('Remote', 220, 452, 10),
  line('Education', 220, 410, 12),
  line('FAU-USP', 220, 388, 11),
  line('Bachelor, Design', 220, 372, 10),
  line('2012 - 2016', 220, 356, 10),
]

const cv = interpretLines(lines, 595)
const fail: string[] = []
if (cv.name !== 'Ana Clara Mendes') fail.push(`name=${cv.name}`)
if (!cv.headline.includes('Product Designer')) fail.push(`headline=${cv.headline}`)

const wrappedHeadline = interpretLines(
  [
    line('Contact', 36, 740, 11),
    line('jose@email.com', 36, 722, 9),
    line('Jose Fernando', 220, 740, 22),
    line('Senior Full Stack Engineer | Scalable APIs | Exploring AI &', 220, 712, 11),
    line('Automation', 220, 696, 11),
    line('Brasília, Distrito Federal, Brasil', 220, 678, 10),
    line('Experience', 220, 640, 12),
    line('Devcode Systems', 220, 620, 11),
    line('Senior Software Engineer', 220, 604, 11),
    line('Jun 2022 · Present', 220, 588, 10),
  ],
  595,
)
if (
  wrappedHeadline.headline !==
  'Senior Full Stack Engineer | Scalable APIs | Exploring AI & Automation'
) {
  console.error('wrapped headline failed', wrappedHeadline.headline)
  process.exit(1)
}
if (cv.contact.email !== 'ana.mendes@email.com') fail.push(`email=${cv.contact.email}`)
if (!cv.contact.linkedin.includes('anaclara')) fail.push(`linkedin=${cv.contact.linkedin}`)
if (cv.skills.length < 3) fail.push(`skills=${cv.skills.length}`)
if (cv.experience.length !== 2) fail.push(`jobs=${cv.experience.length}`)
if (cv.experience[0]?.company !== 'Nimbus Pay') fail.push(`company=${cv.experience[0]?.company}`)
if (cv.experience[0]?.title !== 'Lead Product Designer') fail.push(`title=${cv.experience[0]?.title}`)
if (!/^(Atual|Present)$/.test(cv.experience[0]?.endDate ?? '')) fail.push(`end=${cv.experience[0]?.endDate}`)
if (cv.education[0]?.school !== 'FAU-USP') fail.push(`school=${cv.education[0]?.school}`)
if (!cv.summary.includes('Designer de produto')) fail.push(`summary=${cv.summary}`)

if (fail.length) {
  console.error(fail)
  console.error(JSON.stringify(cv, null, 2))
  process.exit(1)
}
console.log('pdf interpreter ok')

const noHeader: PdfLine[] = [
  line('Ana Clara Mendes', 220, 740, 22),
  line('Product Designer', 220, 712, 11),
  line('Nimbus Pay · Full-time', 220, 600, 11),
  line('Lead Product Designer', 220, 584, 11),
  line('Mar 2022 - Present · 3 yrs 2 mos', 220, 568, 10),
  line('São Paulo', 220, 552, 10),
  line('Atlas Saúde', 220, 520, 11),
  line('Product Designer', 220, 504, 11),
  line('jan. de 2019 - fev. de 2022 (3 anos)', 220, 488, 10),
]
const harvested = interpretLines(noHeader, 595)
if (harvested.experience.length < 2) {
  console.error('linkedin harvest failed', harvested.experience)
  process.exit(1)
}
if (harvested.experience[0]?.company !== 'Nimbus Pay') {
  console.error('company parse failed', harvested.experience[0])
  process.exit(1)
}
if (harvested.experience[1]?.company !== 'Atlas Saúde') {
  console.error('second company parse failed', harvested.experience[1])
  process.exit(1)
}
console.log(
  'linkedin harvest ok',
  harvested.experience.map((j) => `${j.title} @ ${j.company} ${j.startDate}-${j.endDate}`).join(' | '),
)

const wrappedRole = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Experience', 220, 680, 12),
    line('Devcode Systems', 220, 650, 11),
    line('Senior Software Engineer', 220, 634, 11),
    line('Jun 2022 · Present', 220, 618, 10),
    line('Brasília, Distrito Federal, Brasil', 220, 602, 10),
    line('Front-end: Criação de interfaces de usuário com Next.js e React, garantindo uma experiência moderna', 220, 586, 10),
    line('e experiências de usuário eficientes.', 220, 570, 10),
    line('Back-end: APIs REST com Laravel', 220, 554, 10),
  ],
  595,
)
const wrapJob = wrappedRole.experience[0]
if (!wrapJob) {
  console.error('wrapped role missing', wrappedRole.experience)
  process.exit(1)
}
if (wrapJob.bullets.length !== 2) {
  console.error('wrapped continuation should not be a new bullet', wrapJob.bullets)
  process.exit(1)
}
if (!wrapJob.bullets[0].includes('experiência moderna e experiências de usuário eficientes')) {
  console.error('wrapped bullet was not joined', wrapJob.bullets)
  process.exit(1)
}
if (wrapJob.bullets[1] !== 'Back-end: APIs REST com Laravel') {
  console.error('next bullet should stay separate', wrapJob.bullets)
  process.exit(1)
}
console.log('wrapped bullet ok', wrapJob.bullets.join(' | '))

const splitDates = interpretLines(
  [
    line('Ana Clara Mendes', 220, 740, 22),
    line('Nimbus Pay', 220, 600, 11),
    line('Lead Product Designer', 220, 584, 11),
    line('March 2022', 220, 568, 10),
    line('Present (3 years)', 220, 552, 10),
    line('Atlas Saúde', 220, 520, 11),
    line('Product Designer', 220, 504, 11),
    line('January 2019', 220, 488, 10),
    line('February 2022', 220, 472, 10),
  ],
  595,
)
if (splitDates.experience.length < 2) {
  console.error('split date harvest failed', splitDates.experience)
  process.exit(1)
}

const gutter = interpretLines(
  [
    line('Contact', 36, 740, 11),
    line('ana.mendes@email.com', 36, 722, 9),
    line('Top Skills', 36, 640, 11),
    line('Figma', 36, 622, 9),
    line('Ana Clara Mendes', 220, 740, 22),
    line('Experience', 220, 620, 12),
    line('Nimbus Pay', 220, 598, 11),
    line('March 2022 - Present (3 years)', 420, 598, 10),
    line('Lead Product Designer', 220, 582, 11),
    line('Atlas Saúde', 220, 500, 11),
    line('January 2019 - February 2022', 420, 500, 10),
    line('Product Designer', 220, 484, 11),
  ],
  595,
)
if (gutter.experience.length < 2 || gutter.experience[0]?.company !== 'Nimbus Pay') {
  console.error('date gutter harvest failed', gutter.experience)
  process.exit(1)
}

const spaced = interpretLines(
  [
    line('Ana Clara Mendes', 220, 740, 22),
    line('E x p e r i e n c e', 220, 620, 12),
    line('Nimbus Pay', 220, 598, 11),
    line('Lead Product Designer', 220, 582, 11),
    line('March 2022 - Present (3 years)', 220, 566, 10),
  ],
  595,
)
if (spaced.experience.length < 1) {
  console.error('spaced header failed', spaced.experience)
  process.exit(1)
}

console.log('linkedin variants ok')

const glyphs = 'Experience'.split('').map((ch, i) => ({
  text: ch,
  x: 220 + i * 6.2,
  y: 620,
  fontSize: 12,
  page: 1,
  width: 6,
}))
const glued = groupLines(glyphs)
if (glued[0]?.text !== 'Experience') {
  console.error('glyph grouping failed', glued)
  process.exit(1)
}

const gutterItems = [
  { text: 'Contact', x: 36, y: 740, fontSize: 11, page: 1 },
  { text: 'ana@email.com', x: 36, y: 722, fontSize: 9, page: 1 },
  { text: 'Top Skills', x: 36, y: 640, fontSize: 11, page: 1 },
  { text: 'Figma', x: 36, y: 622, fontSize: 9, page: 1 },
  { text: 'Languages', x: 36, y: 560, fontSize: 11, page: 1 },
  { text: 'Portuguese', x: 36, y: 542, fontSize: 9, page: 1 },
  { text: 'Ana Clara Mendes', x: 220, y: 740, fontSize: 22, page: 1 },
  { text: 'Experience', x: 220, y: 620, fontSize: 12, page: 1 },
  { text: 'Nimbus Pay', x: 220, y: 598, fontSize: 11, page: 1, width: 70 },
  { text: 'March 2022 - Present', x: 420, y: 598, fontSize: 10, page: 1, width: 110 },
  { text: 'Lead Product Designer', x: 220, y: 582, fontSize: 11, page: 1 },
  { text: 'Atlas Saúde', x: 220, y: 500, fontSize: 11, page: 1, width: 70 },
  { text: 'January 2019 - February 2022', x: 420, y: 500, fontSize: 10, page: 1, width: 140 },
  { text: 'Product Designer', x: 220, y: 484, fontSize: 11, page: 1 },
]
const splitX = findItemSplit(gutterItems, 595)
if (splitX == null || splitX > 200) {
  console.error('sidebar split should stay left of the date gutter', splitX)
  process.exit(1)
}
const fromItems = interpretColumns(
  groupLines(gutterItems.filter((item) => item.x < splitX)),
  groupLines(gutterItems.filter((item) => item.x >= splitX)),
)
if (fromItems.experience.length < 2 || fromItems.experience[0]?.company !== 'Nimbus Pay') {
  console.error('item gutter parse failed', splitX, fromItems.experience)
  process.exit(1)
}
console.log('item grouping ok')

const dotted = interpretLines(
  [
    line('Ada Lovelace', 220, 740, 22),
    line('Experience', 220, 620, 12),
    line('Senior Software Engineer', 220, 600, 11),
    line('Jun 2022 · Present', 220, 584, 10),
    line('Devcode Systems · (8 meses)', 220, 568, 10),
    line('Software Engineer', 220, 540, 11),
    line('Jan 2021 · May 2022', 220, 524, 10),
    line('Orbit Labs · (1 ano 1 mês)', 220, 508, 10),
    line('(1 ano)', 220, 490, 9),
    line('(6 meses)', 220, 474, 9),
    line('(9 meses)', 220, 458, 9),
  ],
  595,
)
if (dotted.experience.length < 2) {
  console.error('middot jobs failed', dotted.experience)
  process.exit(1)
}
if (dotted.experience[0]?.title !== 'Senior Software Engineer') {
  console.error('middot title failed', dotted.experience[0])
  process.exit(1)
}
if (!/devcode/i.test(dotted.experience[0]?.company ?? '')) {
  console.error('middot company failed', dotted.experience[0])
  process.exit(1)
}
if (dotted.experience.some((job) => job.bullets.some((item) => /^\(\d/.test(item)))) {
  console.error('duration leaked into bullets', dotted.experience)
  process.exit(1)
}
console.log(
  'linkedin middot ok',
  dotted.experience.map((j) => `${j.title} @ ${j.company} ${j.startDate}-${j.endDate}`).join(' | '),
)

const titleDateSplit = [
  { text: 'Contact', x: 36, y: 740, fontSize: 11, page: 1 },
  { text: 'ada@email.com', x: 36, y: 722, fontSize: 9, page: 1 },
  { text: 'Top Skills', x: 36, y: 640, fontSize: 11, page: 1 },
  { text: 'Java', x: 36, y: 622, fontSize: 9, page: 1 },
  { text: 'Ada Lovelace', x: 220, y: 740, fontSize: 22, page: 1 },
  { text: 'Experience', x: 220, y: 620, fontSize: 12, page: 1 },
  { text: 'Senior Software Engineer', x: 220, y: 598, fontSize: 11, page: 1, width: 140 },
  { text: 'Jun 2022 · Present', x: 430, y: 598, fontSize: 10, page: 1, width: 90 },
  { text: 'Devcode Systems', x: 220, y: 582, fontSize: 11, page: 1, width: 90 },
  { text: '(8 meses)', x: 430, y: 582, fontSize: 9, page: 1, width: 50 },
  { text: 'Software Engineer', x: 220, y: 540, fontSize: 11, page: 1, width: 110 },
  { text: 'Jan 2021 · May 2022', x: 430, y: 540, fontSize: 10, page: 1, width: 100 },
  { text: 'Orbit Labs', x: 220, y: 524, fontSize: 11, page: 1, width: 70 },
  { text: '(1 ano 1 mês)', x: 430, y: 524, fontSize: 9, page: 1, width: 70 },
]
const splitDot = findItemSplit(titleDateSplit, 595)
if (splitDot != null && splitDot > 300) {
  console.error('should not split titles away from middot dates', splitDot)
  process.exit(1)
}
const recovered = interpretColumns(
  splitDot == null ? [] : groupLines(titleDateSplit.filter((item) => item.x < splitDot)),
  groupLines(splitDot == null ? titleDateSplit : titleDateSplit.filter((item) => item.x >= splitDot)),
)
if (recovered.experience.length < 2) {
  console.error('title/date column recover failed', splitDot, recovered.experience)
  process.exit(1)
}
console.log(
  'column recover ok',
  recovered.experience.map((j) => `${j.title} @ ${j.company} ${j.startDate}-${j.endDate}`).join(' | '),
)

function pageLine(text: string, x: number, y: number, fontSize: number, page: number): PdfLine {
  return { text, x, y, fontSize, page }
}

const multipage = interpretLines(
  [
    pageLine('Contact', 36, 740, 11, 1),
    pageLine('ada@email.com', 36, 722, 9, 1),
    pageLine('Top Skills', 36, 640, 11, 1),
    pageLine('Java', 36, 622, 9, 1),
    pageLine('Ada Lovelace', 220, 740, 22, 1),
    pageLine('Senior Software Engineer', 220, 712, 11, 1),
    pageLine('São Paulo, Brazil', 220, 694, 10, 1),
    pageLine('Engenheiro de software com foco em', 220, 670, 10, 1),
    pageLine('sistemas distribuídos e pagamentos digitais.', 220, 656, 10, 1),
    pageLine('Experience', 220, 620, 12, 1),
    pageLine('Devcode Systems', 220, 598, 11, 1),
    pageLine('Senior Software Engineer', 220, 582, 11, 1),
    pageLine('Jun 2022 · Present', 220, 566, 10, 1),
    pageLine('Orbit Labs', 220, 740, 11, 2),
    pageLine('Software Engineer', 220, 724, 11, 2),
    pageLine('Jan 2021 · May 2022', 220, 708, 10, 2),
    pageLine('Education', 220, 520, 12, 2),
    pageLine('UNICAMP', 220, 500, 11, 2),
    pageLine('Bachelor, Computer Science', 220, 484, 10, 2),
    pageLine('2014 - 2018', 220, 468, 10, 2),
  ],
  595,
)
if (!multipage.summary.includes('sistemas distribuídos')) {
  console.error('intro missing', multipage.summary)
  process.exit(1)
}
if (multipage.experience.length < 2) {
  console.error('page 2 jobs missing', multipage.experience)
  process.exit(1)
}
if (multipage.education[0]?.school !== 'UNICAMP') {
  console.error('page 2 education missing', multipage.education)
  process.exit(1)
}
console.log(
  'multipage ok',
  multipage.summary.slice(0, 48),
  '|',
  multipage.experience.map((j) => j.company).join(', '),
  '|',
  multipage.education[0]?.school,
)

const ordered = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Exploring AI & Automation', 220, 712, 11),
    line('Experience', 220, 680, 12),
    line('Senior Software Engineer', 220, 660, 11),
    line('Abr 2025 · Present', 220, 644, 10),
    line('First Decision · Brasília, Distrito Federal, Brasil', 220, 628, 10),
    line('I work on strategic government projects.', 220, 612, 10),
    line('Senior Software Engineer', 220, 580, 11),
    line('Set 2023 · Set 2024', 220, 564, 10),
    line('TTY · Brasília, Distrito Federal, Brasil', 220, 548, 10),
    line('Developed enterprise systems for TRF-1.', 220, 532, 10),
    line('Mid-Level Full Stack Developer', 220, 500, 11),
    line('Jan 2023 · Dez 2023', 220, 484, 10),
    line('Curso Beta · Rio de Janeiro, Brasil', 220, 468, 10),
    line('Full Stack Developer working mainly on backend.', 220, 452, 10),
    line('Página 1 de 3', 220, 420, 8),
    line('Formação', 220, 390, 12),
    line('Universidade Católica de Brasília', 220, 370, 11),
    line('Análise de Desenvolvimento de Sistemas', 220, 354, 10),
    line('2015 - 2019', 220, 338, 10),
  ],
  595,
)
if (ordered.experience.length < 3) {
  console.error('expected 3+ jobs', ordered.experience)
  process.exit(1)
}
if (!/first decision/i.test(ordered.experience[0]?.company ?? '')) {
  console.error('newest job should be first', ordered.experience.map((j) => j.company))
  process.exit(1)
}
if (ordered.experience.some((job) => job.bullets.some((item) => /formacao|universidade catolica/i.test(item.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))))) {
  console.error('education leaked into jobs', ordered.experience)
  process.exit(1)
}
if (!/catolica|católica/i.test(ordered.education[0]?.school ?? '')) {
  console.error('education missing', ordered.education)
  process.exit(1)
}
console.log(
  'ordered jobs ok',
  ordered.experience.map((j) => `${j.title} @ ${j.company}`).join(' | '),
)

const labeledResumo = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Senior Software Engineer', 220, 712, 11),
    line('Brasília, Distrito Federal, Brasil', 220, 694, 10),
    line('Resumo', 220, 670, 12),
    line('Sou desenvolvedor full stack com experiência em', 220, 652, 10),
    line('produtos digitais e', 220, 638, 10),
    line('automação de processos.', 220, 624, 10),
    line('Experience', 220, 590, 12),
    line('First Decision', 220, 568, 11),
    line('Senior Software Engineer', 220, 552, 11),
    line('Apr 2025 · Present', 220, 536, 10),
  ],
  595,
)
if (!/Sou desenvolvedor full stack/.test(labeledResumo.summary)) {
  console.error('labeled Resumo heading missing body', labeledResumo.summary)
  process.exit(1)
}
if (!/automação de processos/.test(labeledResumo.summary)) {
  console.error('wrapped Resumo lines dropped', labeledResumo.summary)
  process.exit(1)
}
if (/^Resumo\b/i.test(labeledResumo.summary)) {
  console.error('Resumo heading leaked into body', labeledResumo.summary)
  process.exit(1)
}
console.log('labeled Resumo ok', labeledResumo.summary)

const sameLineResumo = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Engineer', 220, 712, 11),
    line('Resumo Sou engenheiro de software focado em pagamentos digitais e APIs.', 220, 680, 10),
    line('Experience', 220, 640, 12),
    line('Orbit Labs', 220, 620, 11),
    line('Software Engineer', 220, 604, 11),
    line('Jan 2021 · May 2022', 220, 588, 10),
  ],
  595,
)
if (!/Sou engenheiro de software focado em pagamentos/.test(sameLineResumo.summary)) {
  console.error('same-line Resumo failed', sameLineResumo.summary)
  process.exit(1)
}
console.log('same-line Resumo ok', sameLineResumo.summary)

const sidebarResumo = interpretColumns(
  [
    line('Contact', 36, 740, 11),
    line('ada@email.com', 36, 722, 9),
    line('Resumo', 36, 680, 11),
    line('Produto e engenharia com 10 anos liderando times de plataforma.', 36, 662, 9),
    line('Top Skills', 36, 620, 11),
    line('Java', 36, 602, 9),
  ],
  [
    line('Ada Lovelace', 220, 740, 22),
    line('Senior Software Engineer', 220, 712, 11),
    line('Experience', 220, 620, 12),
    line('Devcode Systems', 220, 598, 11),
    line('Senior Software Engineer', 220, 582, 11),
    line('Jun 2022 · Present', 220, 566, 10),
  ],
)
if (!/10 anos liderando times de plataforma/.test(sidebarResumo.summary)) {
  console.error('sidebar Resumo missing', sidebarResumo.summary)
  process.exit(1)
}
console.log('sidebar Resumo ok', sidebarResumo.summary)

const tecff = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Experience', 220, 700, 12),
    line('First Decision', 220, 680, 11),
    line('Senior Software Engineer', 220, 664, 11),
    line('Abr 2025 · Present', 220, 648, 10),
    line('Formação', 220, 520, 12),
    line('TecFF Tecnologia em Software', 220, 500, 11),
    line('Jun 2016 · Jul 2017', 220, 484, 10),
    line('Development and maintenance of institutional web systems', 220, 468, 10),
    line('Database Trainee', 220, 452, 11),
    line('Early career experience focused on database management and ERP systems.', 220, 436, 10),
    line('Brasília e Região, Brasil', 220, 420, 10),
    line('PostgreSQL database administration and backup routines', 220, 404, 10),
    line('Customer support and post-deployment monitoring', 220, 388, 10),
    line('ERP implementation for invoicing systems (NF-e / NFC-e)', 220, 372, 10),
    line('Participation in workshops and client onboarding', 220, 356, 10),
    line('Universidade Católica de Brasília', 220, 320, 11),
    line('Análise de Desenvolvimento de Sistemas', 220, 304, 10),
    line('2015 - 2019', 220, 288, 10),
  ],
  595,
)
if (tecff.education.some((ed) => /tecff/i.test(`${ed.school} ${ed.degree} ${ed.details}`))) {
  console.error('TecFF leaked into education', tecff.education)
  process.exit(1)
}
const tecffJob = tecff.experience.find((job) => /tecff/i.test(job.company) || /tecff/i.test(job.title))
if (!tecffJob) {
  console.error('TecFF job missing', tecff.experience)
  process.exit(1)
}
if (!/tecff/i.test(tecffJob.company)) {
  console.error('TecFF should be the company', tecffJob)
  process.exit(1)
}
if (!/trainee/i.test(tecffJob.title)) {
  console.error('TecFF title should be Database Trainee', tecffJob)
  process.exit(1)
}
if (!tecffJob.bullets.some((item) => /postgresql/i.test(item))) {
  console.error('TecFF bullets missing', tecffJob)
  process.exit(1)
}
if (!/catolica|católica/i.test(tecff.education[0]?.school ?? '')) {
  console.error('real school missing after TecFF rescue', tecff.education)
  process.exit(1)
}
console.log(
  'TecFF job ok',
  `${tecffJob.title} @ ${tecffJob.company}`,
  '| school',
  tecff.education[0]?.school,
)

const academic = interpretLines(
  [
    line('Jose Fernando', 220, 740, 22),
    line('Experience', 220, 700, 12),
    line('First Decision', 220, 680, 11),
    line('Senior Software Engineer', 220, 664, 11),
    line('Abr 2025 · Present', 220, 648, 10),
    line('Formação acadêmica', 220, 500, 12),
    line('Universidade Católica de Brasília', 220, 480, 11),
    line('Análise de Desenvolvimento de Sistemas, Tecnologia da', 220, 464, 10),
    line('Informação · (fevereiro de 2015 - novembro de 2019)', 220, 448, 10),
    line('Senac DF', 220, 420, 11),
    line('Técnico em Informática - (Ênfase em Programação), Tecnologia da', 220, 404, 10),
    line('Informação · (maio de 2013 - fevereiro de 2015)', 220, 388, 10),
    line('Certifications', 220, 350, 12),
    line('Curso de Padrões e técnicas', 220, 332, 10),
    line('avançadas com Git e Github', 220, 316, 10),
    line('Formação: Acessibilidade Web', 220, 300, 10),
    line('Formação PHP', 220, 284, 10),
    line('Vue 3: Avançando no Framework', 220, 268, 10),
    line('Curso de Domain Driven Design', 220, 252, 10),
  ],
  595,
)
const schools = academic.education.map((ed) => ed.school).join(' | ')
if (!/catolica|católica/i.test(schools) || !/senac/i.test(schools)) {
  console.error('academic schools missing', academic.education)
  process.exit(1)
}
if (!academic.education.some((ed) => /an[aá]lise de desenvolvimento/i.test(`${ed.degree} ${ed.field}`))) {
  console.error('UCB degree missing', academic.education)
  process.exit(1)
}
if (!academic.education.some((ed) => /t[eé]cnico em inform[aá]tica/i.test(`${ed.degree} ${ed.field}`))) {
  console.error('Senac degree missing', academic.education)
  process.exit(1)
}
if (academic.education.some((ed) => /php|acessibilidade|github|vue|domain driven/i.test(`${ed.school} ${ed.degree}`))) {
  console.error('certs leaked into education', academic.education)
  process.exit(1)
}
const certNames = academic.certifications.map((item) => item.name).join(' | ')
if (!/git e github/i.test(certNames) || !/acessibilidade/i.test(certNames) || !/forma[cç][aã]o php/i.test(certNames)) {
  console.error('certifications missing', academic.certifications)
  process.exit(1)
}
if (!/vue 3/i.test(certNames) || !/domain driven/i.test(certNames)) {
  console.error('certifications incomplete', academic.certifications)
  process.exit(1)
}
if (academic.certifications.length < 5) {
  console.error('expected 5 certifications', academic.certifications)
  process.exit(1)
}
console.log('academic + certs ok', schools, '||', certNames)
