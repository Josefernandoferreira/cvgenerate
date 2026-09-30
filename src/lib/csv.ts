export function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows = splitCsvRows(src)
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cols) => {
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = (cols[i] ?? '').trim()
    })
    return row
  })
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if (ch === '\n' && !inQuotes) {
      row.push(cell)
      if (row.some((c) => c.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += ch
  }

  if (cell || row.length) {
    row.push(cell)
    if (row.some((c) => c.trim())) rows.push(row)
  }

  return rows
}

export function pick(row: Record<string, string>, ...names: string[]): string {
  const keys = Object.keys(row)
  for (const name of names) {
    const hit = keys.find((k) => k.toLowerCase() === name.toLowerCase())
    if (hit && row[hit]) return row[hit]
  }
  return ''
}
