import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import type { CVData } from '../types'
import { interpretColumns, partitionPage, type PdfLine } from './parseLines'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export async function parseLinkedInPdf(file: File): Promise<CVData> {
  const buffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buffer }).promise
  const left: PdfLine[] = []
  const main: PdfLine[] = []
  let persistedSplit: number | null = null

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    const items = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => ({
        text: item.str.replace(/\s+/g, ' ').trim(),
        x: item.transform[4],
        y: item.transform[5],
        fontSize: Math.abs(item.transform[3] || item.height || 0),
        page: i,
        width: item.width,
        hasEOL: item.hasEOL,
      }))
      .filter((item) => item.text)

    const partitioned = partitionPage(items, viewport.width, persistedSplit)
    if (i === 1) persistedSplit = partitioned.split
    left.push(...partitioned.left)
    main.push(...partitioned.main)
  }

  const textBlob = [...left, ...main].map((l) => l.text).join('\n')
  if (textBlob.replace(/\s/g, '').length < 40) {
    throw new Error(
      'Não encontrei texto neste PDF. Exporte de novo pelo LinkedIn: Recursos → Salvar em PDF.',
    )
  }

  return interpretColumns(left, main)
}
