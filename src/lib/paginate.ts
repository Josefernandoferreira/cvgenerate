export type LineBand = {
  top: number
  bottom: number
}

export type PageSlice = {
  startY: number
  endY: number
  topPad: number
}

const EPSILON = 1.35

export function mergeBands(bands: LineBand[], tol = 2.2): LineBand[] {
  if (!bands.length) return []
  const sorted = [...bands].sort((a, b) => a.top - b.top || a.bottom - b.bottom)
  const out: LineBand[] = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]
    const last = out[out.length - 1]
    if (cur.top <= last.bottom + tol) {
      last.top = Math.min(last.top, cur.top)
      last.bottom = Math.max(last.bottom, cur.bottom)
    } else {
      out.push({ ...cur })
    }
  }
  return out
}

export function slicePages(
  contentHeight: number,
  pageHeight: number,
  bands: LineBand[],
  options?: {
    bottomPad?: number
    continuationPad?: number
    keepTogether?: LineBand[]
  },
): PageSlice[] {
  const height = Math.max(contentHeight, 1)
  const page = Math.max(pageHeight, 1)
  const bottomPad = options?.bottomPad ?? 28
  const continuationPad = options?.continuationPad ?? 22
  const lines = mergeBands(bands.filter((band) => band.bottom > band.top + 0.4))
  const keep = mergeBands(options?.keepTogether ?? [])

  const slices: PageSlice[] = []
  let start = 0
  let guard = 0
  while (start < height - 0.5 && guard < 40) {
    guard += 1
    const topPad = slices.length === 0 ? 0 : continuationPad
    const usable = Math.max(page - topPad - bottomPad, page * 0.62)
    const fullUsable = page - topPad
    const lastInk = lines.reduce((max, line) => Math.max(max, line.bottom), start)
    if (Math.min(height, lastInk) <= start + fullUsable + EPSILON) {
      slices.push({ startY: start, endY: height, topPad })
      break
    }
    const limit = start + usable

    let end = findSafeEnd(start, limit, lines)
    end = applyKeepTogether(start, end, usable, keep)
    if (end <= start + 10) end = Math.min(height, start + usable)
    end = Math.min(height, Math.max(end, start + 1))
    slices.push({ startY: start, endY: end, topPad })
    start = end
  }

  return slices.length ? slices : [{ startY: 0, endY: height, topPad: 0 }]
}

function findSafeEnd(start: number, limit: number, lines: LineBand[]): number {
  const clipped = lines.filter(
    (line) => line.top >= start - EPSILON && line.top < limit - EPSILON && line.bottom > limit - EPSILON,
  )
  if (!clipped.length) return limit
  return Math.min(...clipped.map((line) => line.top)) - EPSILON
}

function applyKeepTogether(start: number, end: number, usable: number, keep: LineBand[]): number {
  let cut = end
  for (const box of keep) {
    if (box.top < start + 28 || box.top >= cut || box.bottom <= cut) continue
    const height = box.bottom - box.top
    if (height <= usable && box.top > start + usable * 0.3) {
      cut = Math.min(cut, box.top)
    }
  }
  return cut > start + 24 ? cut : end
}

export function collectTextBands(root: HTMLElement): LineBand[] {
  const origin = root.getBoundingClientRect()
  const bands: LineBand[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Node | null = walker.nextNode()
  while (node) {
    if (node.textContent?.replace(/\s+/g, '')) {
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.height < 1 || rect.width < 0.4) continue
        bands.push({
          top: rect.top - origin.top,
          bottom: rect.bottom - origin.top,
        })
      }
    }
    node = walker.nextNode()
  }

  for (const el of root.querySelectorAll<HTMLElement>('img, svg, canvas, .cv-photo, hr')) {
    const rect = el.getBoundingClientRect()
    if (rect.height < 1) continue
    bands.push({
      top: rect.top - origin.top,
      bottom: rect.bottom - origin.top,
    })
  }

  return mergeBands(bands)
}

export function collectKeepTogether(root: HTMLElement, pageHeight: number): LineBand[] {
  const origin = root.getBoundingClientRect()
  const max = pageHeight * 0.88
  return [...root.querySelectorAll<HTMLElement>('h1, h2, .cv-label, .cv-role, .cv-entry, .cv-company-head, .cv-closing, li')]
    .map((el) => {
      const rect = el.getBoundingClientRect()
      return { top: rect.top - origin.top, bottom: rect.bottom - origin.top }
    })
    .filter((band) => band.bottom - band.top > 8 && band.bottom - band.top <= max)
}

export function paginateElement(root: HTMLElement, pageHeight: number): PageSlice[] {
  return slicePages(Math.max(root.scrollHeight, root.offsetHeight, pageHeight), pageHeight, collectTextBands(root), {
    keepTogether: collectKeepTogether(root, pageHeight),
  })
}
