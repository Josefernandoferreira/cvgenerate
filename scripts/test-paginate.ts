import { slicePages, type LineBand } from '../src/lib/paginate.ts'

function assert(ok: boolean, message: string) {
  if (!ok) {
    console.error(message)
    process.exit(1)
  }
}

const page = 1123
const lines: LineBand[] = [
  { top: 40, bottom: 58 },
  { top: 70, bottom: 88 },
  { top: 1098, bottom: 1118 },
  { top: 1130, bottom: 1148 },
  { top: 1160, bottom: 1178 },
  { top: 2100, bottom: 2120 },
]

const slices = slicePages(2200, page, lines)
assert(slices.length === 2, `expected 2 pages, got ${slices.length}`)
assert(
  slices[0].endY <= 1098,
  `page 1 should end before the line that would be clipped, got ${slices[0].endY}`,
)
assert(
  slices[1].startY <= 1098 + 2,
  `page 2 should start at the uncut line, got ${slices[1].startY}`,
)
assert(
  !slices.some((slice, i) => {
    if (i === slices.length - 1) return false
    return lines.some((line) => line.top < slice.endY && line.bottom > slice.endY)
  }),
  'a line was still split across pages',
)

const leftover = slicePages(800, page, [{ top: 20, bottom: 40 }])
assert(leftover.length === 1, `short document should be 1 page, got ${leftover.length}`)
assert(leftover[0].endY === 800, `short document endY ${leftover[0].endY}`)

const midWord: LineBand[] = [
  { top: 40, bottom: 58 },
  { top: 1080, bottom: 1110 },
  { top: 1124, bottom: 1142 },
]
const snapped = slicePages(1600, page, midWord)
assert(snapped[0].endY <= 1080, `clipped line should move to the next page, end=${snapped[0].endY}`)
assert(
  !midWord.some((line) => line.top < snapped[0].endY && line.bottom > snapped[0].endY),
  'first page still cuts a line in half',
)

console.log(
  'paginate ok',
  slices.map((slice) => `${Math.round(slice.startY)}-${Math.round(slice.endY)}`).join(' | '),
)
