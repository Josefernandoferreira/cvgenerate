import { formatToday } from '../src/lib/cvLang.ts'

const date = new Date(2026, 8, 21)
if (formatToday('pt', date) !== '21 de setembro de 2026') {
  console.error('pt date failed', formatToday('pt', date))
  process.exit(1)
}
if (formatToday('en', date) !== 'September 21, 2026') {
  console.error('en date failed', formatToday('en', date))
  process.exit(1)
}
if (formatToday('es', date) !== '21 de septiembre de 2026') {
  console.error('es date failed', formatToday('es', date))
  process.exit(1)
}

console.log('closing date ok')
