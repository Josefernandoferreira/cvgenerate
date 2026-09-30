import { useEffect, useRef, useState, type RefObject } from 'react'
import type { AccentId, CoverLetter, CVData, DocMode, LayoutId, PaperId } from '../types'
import { CvSheet, LetterSheet } from '../layouts'
import { paginateElement, type PageSlice } from '../lib/paginate'
import { PAPER } from '../lib/regions'

type Props = {
  cv: CVData
  letter: CoverLetter
  mode: DocMode
  layout: LayoutId
  accent: AccentId
  paper: PaperId
  pageRef: RefObject<HTMLDivElement | null>
}

export function Preview({ cv, letter, mode, layout, accent, paper, pageRef }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const spec = PAPER[paper]
  const [scale, setScale] = useState(0.72)
  const [slices, setSlices] = useState<PageSlice[]>([{ startY: 0, endY: spec.heightPx, topPad: 0 }])

  useEffect(() => {
    const stage = stageRef.current
    const host = pageRef.current
    if (!stage || !host) return

    let frame = 0
    const fit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const width = stage.clientWidth - 48
        setScale(Math.min(1, Math.max(0.34, width / spec.widthPx)))
        const sheet = host.querySelector<HTMLElement>('.cv-page') ?? host
        const next = paginateElement(sheet, spec.heightPx)
        setSlices((prev) => (sameSlices(prev, next) ? prev : next))
      })
    }

    const run = () => {
      void document.fonts.ready.then(fit)
      fit()
    }

    run()
    const observer = new ResizeObserver(run)
    observer.observe(stage)
    observer.observe(host)
    const sheet = host.querySelector('.cv-page')
    if (sheet) observer.observe(sheet)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [cv, letter, mode, layout, accent, paper, pageRef, spec.widthPx, spec.heightPx])

  const pages = slices.length

  function renderSheet() {
    return mode === 'letter' ? (
      <LetterSheet cv={cv} letter={letter} accent={accent} paper={paper} />
    ) : (
      <CvSheet cv={cv} layout={layout} accent={accent} paper={paper} />
    )
  }

  return (
    <div className="stage" ref={stageRef}>
      <p className="page-count">
        {pages} {pages === 1 ? 'página' : 'páginas'} · {paper === 'letter' ? 'Letter' : 'A4'}
      </p>
      <div className="paper-stack">
        {slices.map((slice, i) => (
          <figure key={`${i}-${slice.startY}-${slice.endY}`} className="paper-sheet" style={{ width: spec.widthPx * scale }}>
            <div className="paper-clip" style={{ width: spec.widthPx * scale, height: spec.heightPx * scale }}>
              <div
                className="paper-sheet-inner"
                style={{
                  width: spec.widthPx,
                  height: spec.heightPx,
                  transform: `scale(${scale})`,
                }}
              >
                <div
                  className="paper-page-body"
                  style={{
                    marginTop: slice.topPad,
                    height: Math.max(1, slice.endY - slice.startY),
                  }}
                >
                  <div style={{ transform: `translateY(${-slice.startY}px)` }}>{renderSheet()}</div>
                </div>
              </div>
            </div>
            <figcaption>
              Página {i + 1} de {pages}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="export-host" ref={pageRef} aria-hidden>
        {renderSheet()}
      </div>
    </div>
  )
}

function sameSlices(a: PageSlice[], b: PageSlice[]) {
  if (a.length !== b.length) return false
  return a.every(
    (slice, i) =>
      Math.abs(slice.startY - b[i].startY) < 0.6 &&
      Math.abs(slice.endY - b[i].endY) < 0.6 &&
      Math.abs(slice.topPad - b[i].topPad) < 0.6,
  )
}
