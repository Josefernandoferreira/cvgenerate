import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const pdf = await pdfjs.getDocument({
  data: new Uint8Array(readFileSync(join(root, 'public', 'sample-linkedin.pdf'))),
}).promise
let text = ''
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i)
  const content = await page.getTextContent()
  text += content.items.map((item) => ('str' in item ? item.str : '')).join('\n') + '\n'
}
const needed = ['Ana Clara Mendes', 'Nimbus Pay', 'Experience', 'FAU-USP', 'ana.mendes@email.com']
const missing = needed.filter((item) => !text.includes(item))
if (missing.length) {
  console.error('PDF text missing', missing)
  console.log(text)
  process.exit(1)
}

const zip = await JSZip.loadAsync(readFileSync(join(root, 'public', 'sample-linkedin.zip')))
if (!zip.file('Positions.csv')) {
  console.error('ZIP missing Positions.csv')
  process.exit(1)
}
console.log('sample files ok')
console.log('pdf chars', text.replace(/\s/g, '').length)
