import type { CVData } from '../types'
import { useRegion } from '../lib/regionContext'
import { sortEducation } from '../lib/organize'
import { CertList, ContactRow, ExperienceList, SectionLabel, SummaryBlock, hasItems, joinMeta, show } from './shared'

export function Classic({ cv }: { cv: CVData }) {
  const { labels, sections } = useRegion()

  return (
    <article className="cv cv-classic">
      <header className="cv-classic-head">
        <h1>{cv.name || labels.nameFallback}</h1>
        {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}
        <ContactRow cv={cv} />
      </header>

      {sections.map((id) => {
        if (id === 'objective' && show(cv.objective)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.objective}</SectionLabel>
              <p className="cv-prose">{cv.objective}</p>
            </section>
          )
        }
        if (id === 'summary') {
          return <SummaryBlock key={id} text={cv.summary} title={labels.summary} />
        }
        if (id === 'skills' && hasItems(cv.skills)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.skills}</SectionLabel>
              <p className="cv-prose">{cv.skills.map((s) => s.name).filter(Boolean).join('  ·  ')}</p>
            </section>
          )
        }
        if (id === 'experience' && hasItems(cv.experience)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.experience}</SectionLabel>
              <ExperienceList items={cv.experience} />
            </section>
          )
        }
        if (id === 'education' && hasItems(cv.education)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.education}</SectionLabel>
              {sortEducation(cv.education).map((ed) => (
                <div key={ed.id} className="cv-entry">
                  <div className="cv-entry-top">
                    <strong>{joinMeta([ed.degree, ed.field]) || ed.school}</strong>
                    <span>{joinMeta([ed.startDate, ed.endDate])}</span>
                  </div>
                  <div className="cv-entry-sub">{ed.school}</div>
                  {show(ed.details) && <p className="cv-prose">{ed.details}</p>}
                </div>
              ))}
            </section>
          )
        }
        if (id === 'languages' && hasItems(cv.languages)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.languages}</SectionLabel>
              <p className="cv-prose">
                {cv.languages
                  .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
                  .filter(Boolean)
                  .join('  ·  ')}
              </p>
            </section>
          )
        }
        if (id === 'certifications' && hasItems(cv.certifications)) {
          return (
            <section key={id}>
              <SectionLabel>{labels.certifications}</SectionLabel>
              <CertList items={cv.certifications} />
            </section>
          )
        }
        return null
      })}
    </article>
  )
}
