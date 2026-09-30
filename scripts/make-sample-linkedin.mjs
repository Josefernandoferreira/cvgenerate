import { jsPDF } from 'jspdf'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(11)
pdf.text('Contact', 36, 48)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(9)
pdf.text('ana.mendes@email.com', 36, 66)
pdf.text('+55 11 98888-1122', 36, 80)
pdf.text('linkedin.com/in/anaclara', 36, 94)
pdf.text('São Paulo, Brasil', 36, 108)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(11)
pdf.text('Top Skills', 36, 140)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(9)
pdf.text('Product design', 36, 158)
pdf.text('Figma', 36, 172)
pdf.text('Design systems', 36, 186)
pdf.text('Languages', 36, 220)
pdf.setFontSize(9)
pdf.text('Portuguese (Native)', 36, 238)
pdf.text('English (Full Professional)', 36, 252)

pdf.setFont('helvetica', 'bold')
pdf.setFontSize(22)
pdf.text('Ana Clara Mendes', 220, 56)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(11)
pdf.text('Product Designer · Sistemas de design', 220, 78)
pdf.setFontSize(10)
pdf.text('São Paulo, Brazil', 220, 96)
pdf.text(
  'Designer de produto com 8 anos criando interfaces claras para produtos B2B.',
  220,
  124,
  { maxWidth: 340 },
)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(12)
pdf.text('Experience', 220, 170)
pdf.setFontSize(11)
pdf.text('Nimbus Pay', 220, 192)
pdf.setFont('helvetica', 'normal')
pdf.text('Lead Product Designer', 220, 208)
pdf.text('March 2022 - Present (3 years)', 220, 224)
pdf.text('São Paulo', 220, 240)
pdf.text('Lidero o design system usado por 4 squads.', 220, 256)
pdf.setFont('helvetica', 'bold')
pdf.text('Atlas Saúde', 220, 284)
pdf.setFont('helvetica', 'normal')
pdf.text('Product Designer', 220, 300)
pdf.text('January 2019 - February 2022 (3 years)', 220, 316)
pdf.text('Remote', 220, 332)
pdf.setFont('helvetica', 'bold')
pdf.text('Education', 220, 368)
pdf.text('FAU-USP', 220, 390)
pdf.setFont('helvetica', 'normal')
pdf.text('Bachelor, Design', 220, 406)
pdf.text('2012 - 2016', 220, 422)

writeFileSync(join(out, 'sample-linkedin.pdf'), Buffer.from(pdf.output('arraybuffer')))

const zip = new JSZip()
zip.file(
  'Profile.csv',
  'First Name,Last Name,Headline,Summary,Geo Location,Websites\nAna,Mendes,Product Designer,Designer de produto.,"São Paulo, Brasil",PERSONAL:https://anamendes.design',
)
zip.file(
  'Positions.csv',
  'Company Name,Title,Description,Location,Started On,Finished On\nNimbus Pay,Lead Product Designer,Lidero o design system,São Paulo,Mar 2022,\nAtlas Saúde,Product Designer,App de agendamento,Remoto,Jan 2019,Fev 2022',
)
zip.file('Education.csv', 'School Name,Start Date,End Date,Notes,Degree Name,Activities\nFAU-USP,2012,2016,Design,Bacharelado,')
zip.file('Skills.csv', 'Name\nProduct design\nFigma\nDesign systems')
zip.file('Languages.csv', 'Name,Proficiency\nPortuguês,Nativo\nInglês,Fluente')
zip.file('Email Addresses.csv', 'Email Address,Primary\nana.mendes@email.com,Yes')
const zipBuf = await zip.generateAsync({ type: 'nodebuffer' })
writeFileSync(join(out, 'sample-linkedin.zip'), zipBuf)
console.log('wrote sample-linkedin.pdf and sample-linkedin.zip')
