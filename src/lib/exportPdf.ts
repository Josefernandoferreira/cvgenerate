import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { AccentId, PaperId } from '../types'
import { ACCENTS } from '../types'
import { paginateElement } from './paginate'
import { PAPER } from './regions'

const COLOR_PROPS = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'column-rule-color',
  'caret-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-shadow',
  'background-image',
  'background',
  'border',
  'outline',
  'filter',
  'scrollbar-color',
]

let activeVars: Record<string, string> = {}

export async function downloadPdf(
  page: HTMLElement,
  filename: string,
  paper: PaperId = 'a4',
  accent?: AccentId,
) {
  await Promise.race([document.fonts.ready, wait(1200)])
  const spec = PAPER[paper]
  const source = page.querySelector<HTMLElement>('.cv-page')
  if (!source) throw new Error('A prévia ainda não montou. Espere um segundo e tente de novo.')
  const vars = cssVarsFrom(source, accent)

  try {
    const blob = await captureLongSheet(source, spec, paper, vars)
    triggerDownload(blob, filename)
    return
  } catch (err) {
    console.error('Folio PDF capture failed, trying visible pages', err)
  }

  const clips = page.closest('.stage')?.querySelectorAll<HTMLElement>('.paper-clip')
  if (!clips?.length) throw new Error('Não consegui capturar o currículo para o PDF.')
  const blob = await captureVisiblePages(clips, spec, paper, vars)
  triggerDownload(blob, filename)
}

async function captureLongSheet(
  source: HTMLElement,
  spec: (typeof PAPER)[PaperId],
  paper: PaperId,
  vars: Record<string, string>,
) {
  const host = document.createElement('div')
  host.setAttribute('data-folio-export', 'true')
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'z-index:0',
    'background:#fff',
    `width:${spec.widthPx}px`,
  ].join(';')
  applyCssVars(host, vars)

  const sheet = source.cloneNode(true) as HTMLElement
  sheet.className = source.className
  sheet.style.width = `${spec.widthPx}px`
  sheet.style.maxWidth = 'none'
  sheet.style.minHeight = '0'
  sheet.style.height = 'auto'
  sheet.style.overflow = 'visible'
  sheet.style.background = '#fff'
  sheet.style.boxShadow = 'none'
  sheet.style.transform = 'none'
  sheet.style.position = 'relative'
  sheet.style.margin = '0'
  sheet.style.opacity = '1'
  applyCssVars(sheet, vars)
  host.appendChild(sheet)
  document.body.appendChild(host)

  try {
    await wait(40)
    const slices = paginateElement(sheet, spec.heightPx)
    const width = Math.max(sheet.scrollWidth, sheet.offsetWidth, spec.widthPx)
    const height = Math.max(sheet.scrollHeight, sheet.offsetHeight, spec.heightPx)
    const canvas = await snap(sheet, width, height, vars)
    return canvasToPdf(canvas, slices, width, height, spec, paper)
  } finally {
    host.remove()
  }
}

async function captureVisiblePages(
  clips: NodeListOf<HTMLElement>,
  spec: (typeof PAPER)[PaperId],
  paper: PaperId,
  vars: Record<string, string>,
) {
  const pdf = new jsPDF({ unit: 'mm', format: paper, compress: true })
  let first = true
  for (const clip of clips) {
    const canvas = await snap(clip, clip.offsetWidth, clip.offsetHeight, vars)
    if (!first) pdf.addPage()
    first = false
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, spec.widthMm, spec.heightMm)
  }
  return pdf.output('blob')
}

function canvasToPdf(
  canvas: HTMLCanvasElement,
  slices: ReturnType<typeof paginateElement>,
  width: number,
  height: number,
  spec: (typeof PAPER)[PaperId],
  paper: PaperId,
) {
  const pdf = new jsPDF({ unit: 'mm', format: paper, compress: true })
  const scaleY = canvas.height / Math.max(height, 1)
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = canvas.width
  pageCanvas.height = Math.max(1, Math.round(spec.heightPx * (canvas.width / Math.max(width, 1))))
  const ctx = pageCanvas.getContext('2d')
  if (!ctx) throw new Error('Não consegui montar as páginas do PDF.')

  slices.forEach((slice, i) => {
    if (i > 0) pdf.addPage()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    const sy = Math.max(0, slice.startY * scaleY)
    const sh = Math.max(1, (slice.endY - slice.startY) * scaleY)
    const destScale = pageCanvas.height / spec.heightPx
    ctx.drawImage(
      canvas,
      0,
      sy,
      canvas.width,
      sh,
      0,
      slice.topPad * destScale,
      pageCanvas.width,
      (slice.endY - slice.startY) * destScale,
    )
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, spec.widthMm, spec.heightMm)
  })
  return pdf.output('blob')
}

async function snap(el: HTMLElement, width: number, height: number, vars: Record<string, string>) {
  const restoreParent = installComputedStyleShim(window)
  const previousVars = activeVars
  activeVars = vars
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: Math.max(width, 1),
      height: Math.max(height, 1),
      windowWidth: Math.max(width, 1),
      windowHeight: Math.max(height, 1),
      scrollX: 0,
      scrollY: 0,
      onclone(doc, node) {
        const view = doc.defaultView
        if (view) installComputedStyleShim(view)
        applyCssVars(doc.documentElement, vars)
        applyCssVars(node, vars)
        const accent = vars['--cv-accent']
        if (accent) {
          const paint = doc.createElement('style')
          paint.textContent = `:root,.cv-page{--cv-accent:${accent}!important}`
          doc.head.appendChild(paint)
        }
        stripModernColors(doc, node)
      },
    })
    if (!canvas.width || !canvas.height) throw new Error('A captura da página veio vazia.')
    return canvas
  } finally {
    restoreParent()
    activeVars = previousVars
  }
}

function installComputedStyleShim(win: Window) {
  const native = win.getComputedStyle.bind(win)
  win.getComputedStyle = ((elt: Element, pseudo?: string | null) =>
    wrapComputedStyle(native(elt, pseudo ?? null))) as typeof win.getComputedStyle
  return () => {
    win.getComputedStyle = native
  }
}

function wrapComputedStyle(style: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (name: string) => flattenCssValue(target.getPropertyValue(name))
      }
      const value = Reflect.get(target, prop, target)
      if (typeof value === 'function') return value.bind(target)
      if (typeof value === 'string') return flattenCssValue(value)
      return value
    },
  }) as CSSStyleDeclaration
}

function cssVarsFrom(el: HTMLElement, accent?: AccentId): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const prop of Array.from(el.style)) {
    if (!prop.startsWith('--')) continue
    const value = el.style.getPropertyValue(prop).trim()
    if (value) vars[prop] = value
  }
  const computed = getComputedStyle(el).getPropertyValue('--cv-accent').trim()
  if (computed) vars['--cv-accent'] = computed
  if (accent) vars['--cv-accent'] = ACCENTS[accent]
  return vars
}

function applyCssVars(el: HTMLElement, vars: Record<string, string>) {
  for (const [name, value] of Object.entries(vars)) {
    if (value) el.style.setProperty(name, value)
  }
}

function stripModernColors(doc: Document, root: HTMLElement) {
  const accent = root.style.getPropertyValue('--cv-accent').trim()
    || doc.documentElement.style.getPropertyValue('--cv-accent').trim()
  const guard = doc.createElement('style')
  guard.textContent = '*{scrollbar-color:auto!important;scrollbar-width:auto!important}'
  doc.head.appendChild(guard)

  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    rewriteRules(rules, accent)
  }

  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')]
  for (const node of nodes) {
    if (accent) node.style.setProperty('--cv-accent', accent)
    node.style.scrollbarColor = 'auto'
    node.style.scrollbarWidth = 'auto'
    node.style.boxShadow = 'none'
    const view = doc.defaultView
    if (!view) continue
    const computed = view.getComputedStyle(node)
    node.style.color = flattenCssValue(computed.color)
    node.style.backgroundColor = flattenCssValue(computed.backgroundColor)
    node.style.borderTopColor = flattenCssValue(computed.borderTopColor)
    node.style.borderRightColor = flattenCssValue(computed.borderRightColor)
    node.style.borderBottomColor = flattenCssValue(computed.borderBottomColor)
    node.style.borderLeftColor = flattenCssValue(computed.borderLeftColor)
    node.style.outlineColor = flattenCssValue(computed.outlineColor)
    node.style.textDecorationColor = flattenCssValue(computed.textDecorationColor)
    if (computed.fill && computed.fill !== 'none') node.style.fill = flattenCssValue(computed.fill)
    if (computed.stroke && computed.stroke !== 'none') node.style.stroke = flattenCssValue(computed.stroke)
  }
}

function rewriteRules(rules: CSSRuleList, accent = '') {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      for (const prop of COLOR_PROPS) {
        const value = rule.style.getPropertyValue(prop)
        if (!value) continue
        const next = bakeAccent(rgbify(value), accent)
        if (next !== value) rule.style.setProperty(prop, next, rule.style.getPropertyPriority(prop))
      }
      for (const prop of Array.from(rule.style)) {
        if (!prop.startsWith('--')) continue
        const value = rule.style.getPropertyValue(prop)
        if (value && hasModernColor(value)) {
          rule.style.setProperty(prop, rgbify(value), rule.style.getPropertyPriority(prop))
        }
      }
    } else if (rule instanceof CSSGroupingRule) {
      try {
        rewriteRules(rule.cssRules, accent)
      } catch {
        /* ignore */
      }
    }
  }
}

function bakeAccent(value: string, accent: string) {
  if (!accent) return value
  return value.replace(/var\(\s*--cv-accent(?:\s*,\s*[^)]+)?\)/gi, accent)
}

function hasModernColor(value: string) {
  return /color-mix\(|oklch\(|oklab\(|\blch\(|\blab\(|color\(/i.test(value)
}

function flattenCssValue(value: string) {
  const baked = bakeAccent(value, activeVars['--cv-accent'] ?? '')
  if (!baked || !hasModernColor(baked)) return baked
  return replaceColorFunctions(baked, toRgb)
}

function rgbify(value: string) {
  return flattenCssValue(value)
}

function replaceColorFunctions(input: string, convert: (token: string) => string) {
  const names = ['color-mix', 'oklch', 'oklab', 'lch', 'lab', 'color']
  let out = input
  for (const name of names) {
    const key = `${name}(`
    let i = 0
    while (i < out.length) {
      const at = out.toLowerCase().indexOf(key, i)
      if (at < 0) break
      if (at > 0 && /[a-z-]/i.test(out[at - 1] ?? '')) {
        i = at + 1
        continue
      }
      let depth = 0
      let end = at + name.length
      for (; end < out.length; end += 1) {
        if (out[end] === '(') depth += 1
        else if (out[end] === ')') {
          depth -= 1
          if (depth === 0) {
            end += 1
            break
          }
        }
      }
      const token = out.slice(at, end)
      const next = convert(token)
      out = `${out.slice(0, at)}${next}${out.slice(end)}`
      i = at + next.length
    }
  }
  return out
}

let probe: CanvasRenderingContext2D | null = null

function toRgb(token: string) {
  const value = token.trim()
  if (!value || value === 'none' || value === 'transparent') return value
  if (/^rgba?\(/i.test(value) || /^hsla?\(/i.test(value) || /^#([0-9a-f]{3,8})$/i.test(value)) {
    return value
  }

  try {
    if (!probe) probe = document.createElement('canvas').getContext('2d')
    if (probe) {
      probe.fillStyle = '#161513'
      probe.fillStyle = value
      const parsed = String(probe.fillStyle)
      if (parsed && !hasModernColor(parsed)) return parsed
      const fromCanvas = modernColorToRgb(parsed)
      if (fromCanvas) return fromCanvas
    }
  } catch {
    /* ignore */
  }

  return modernColorToRgb(value) ?? '#161513'
}

function modernColorToRgb(value: string) {
  const colorFn = value.match(/color\(\s*([a-z0-9-]+)\s+([^)]+)\)/i)
  if (colorFn) return cssColorToRgb(colorFn[1], colorFn[2])
  return null
}

function cssColorToRgb(space: string, raw: string) {
  let body = raw.trim()
  let alpha = 1
  const slash = body.lastIndexOf('/')
  if (slash >= 0) {
    alpha = parseAlpha(body.slice(slash + 1).trim())
    body = body.slice(0, slash).trim()
  }
  const parts = body.split(/[\s,]+/).filter(Boolean)
  if (parts.length < 3) return null
  let r = parseChannel(parts[0])
  let g = parseChannel(parts[1])
  let b = parseChannel(parts[2])
  if (space.toLowerCase() === 'srgb-linear') {
    r = linearToSrgb(r)
    g = linearToSrgb(g)
    b = linearToSrgb(b)
  }
  const R = Math.round(clamp01(r) * 255)
  const G = Math.round(clamp01(g) * 255)
  const B = Math.round(clamp01(b) * 255)
  return alpha < 1 ? `rgba(${R}, ${G}, ${B}, ${alpha})` : `rgb(${R}, ${G}, ${B})`
}

function parseChannel(n: string) {
  if (n.endsWith('%')) return clamp01(Number.parseFloat(n) / 100)
  const v = Number.parseFloat(n)
  return Number.isFinite(v) ? clamp01(v) : 0
}

function parseAlpha(n: string) {
  if (n.endsWith('%')) return clamp01(Number.parseFloat(n) / 100)
  const v = Number.parseFloat(n)
  return Number.isFinite(v) ? clamp01(v) : 1
}

function linearToSrgb(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

export function filenameFrom(name: string, suffix = 'cv') {
  const slug = (name || 'documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'documento'}-${suffix}.pdf`
}
