import type { CVData } from '../types'
import { useRegion } from '../lib/regionContext'
import { sortEducation } from '../lib/organize'
import { ContactRow, ExperienceList, SummaryBlock, hasItems, joinMeta, show } from './shared'

export function Minimal({ cv }: { cv: CVData }) {
  const { labels, showObjective } = useRegion()

  return (
    <article className="cv cv-minimal">
      <header>
        <h1>{cv.name || labels.nameFallback}</h1>
        {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}
        <ContactRow cv={cv} />
      </header>

      {showObjective && show(cv.objective) && (
        <section>
          <h2>{labels.objective}</h2>
          <p className="cv-lead">{cv.objective}</p>
        </section>
      )}
      <SummaryBlock text={cv.summary} title={labels.summary} leadClass="cv-lead" />

      {hasItems(cv.experience) && (
        <section>
          <h2>{labels.experience}</h2>
          <ExperienceList items={cv.experience} />
        </section>
      )}

      {hasItems(cv.education) && (
        <section>
          <h2>{labels.education}</h2>
          {sortEducation(cv.education).map((ed) => (
            <div key={ed.id} className="cv-entry">
              <div className="cv-entry-top">
                <strong>{joinMeta([ed.school, ed.degree, ed.field])}</strong>
                <span>{joinMeta([ed.startDate, ed.endDate])}</span>
              </div>
              {show(ed.details) && <p className="cv-prose">{ed.details}</p>}
            </div>
          ))}
        </section>
      )}

      {(hasItems(cv.skills) || hasItems(cv.languages) || hasItems(cv.certifications)) && (
        <section className="cv-minimal-foot">
          {hasItems(cv.skills) && (
            <p>
              <span>{labels.skills}</span>
              {cv.skills.map((s) => s.name).filter(Boolean).join(', ')}
            </p>
          )}
          {hasItems(cv.languages) && (
            <p>
              <span>{labels.languages}</span>
              {cv.languages
                .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
                .join(', ')}
            </p>
          )}
          {hasItems(cv.certifications) && (
            <p>
              <span>{labels.certifications}</span>
              {cv.certifications.map((c) => c.name).join(', ')}
            </p>
          )}
        </section>
      )}
    </article>
  )
}
