import type { AccentId, CVData, LayoutId, PaperId } from '../types'
import { ACCENTS } from '../types'
import { ClosingBlock } from './shared'
import { Classic } from './Classic'
import { Editorial } from './Editorial'
import { Minimal } from './Minimal'
import { Modern } from './Modern'
import { Sidebar } from './Sidebar'

const MAP = {
  classic: Classic,
  modern: Modern,
  sidebar: Sidebar,
  minimal: Minimal,
  editorial: Editorial,
}

export function CvSheet({
  cv,
  layout,
  accent,
  paper = 'a4',
}: {
  cv: CVData
  layout: LayoutId
  accent: AccentId
  paper?: PaperId
}) {
  const View = MAP[layout]
  return (
    <div
      className={`cv-page layout-${layout} paper-${paper}`}
      style={{ ['--cv-accent' as string]: ACCENTS[accent] }}
    >
      <View cv={cv} />
      <ClosingBlock name={cv.name} />
    </div>
  )
}

export { LetterSheet } from './Letter'
