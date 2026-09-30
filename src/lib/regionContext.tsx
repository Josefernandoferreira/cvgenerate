import { createContext, useContext, type ReactNode } from 'react'
import type { CvLang, RegionId } from '../types'
import { CV_LANG_LABELS } from './cvLang'
import { REGIONS, type RegionProfile } from './regions'

export type RegionView = RegionProfile & { lang: CvLang }

const RegionContext = createContext<RegionView>({ ...REGIONS.br, lang: 'pt' })

export function RegionProvider({
  region,
  lang = 'pt',
  children,
}: {
  region: RegionId
  lang?: CvLang
  children: ReactNode
}) {
  const base = REGIONS[region]
  const value: RegionView = {
    ...base,
    lang,
    labels: { ...base.labels, ...CV_LANG_LABELS[lang] },
  }
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}

export function useRegion(): RegionView {
  return useContext(RegionContext)
}
