import type { CVData } from '../types'
import { useRegion } from '../lib/regionContext'
import { sortEducation } from '../lib/organize'
import { CertList, ExperienceList, PhoneLink, Photo, ProfileLink, SectionLabel, SummaryBlock, hasItems, joinMeta, show } from './shared'

export function Modern({ cv }: { cv: CVData }) {
  const { labels, showObjective, showWorkAuth } = useRegion()

  return (
    <article className="cv cv-modern">
      <header className="cv-modern-head">
        <div>
          <h1>{cv.name || labels.nameFallback}</h1>
          {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}
        </div>
        <Photo cv={cv} />
      </header>

      <div className="cv-modern-grid">
        <aside>
          <section>
            <SectionLabel>{labels.contact}</SectionLabel>
            <ul className="cv-plain">
              {show(cv.contact.email) && <li>{cv.contact.email}</li>}
              {show(cv.contact.phone) && (
                <li>
                  <PhoneLink phone={cv.contact.phone} />
                </li>
              )}
              {show(cv.contact.location) && <li>{cv.contact.location}</li>}
              {show(cv.contact.linkedin) && (
                <li>
                  <ProfileLink value={cv.contact.linkedin} kind="linkedin" />
                </li>
              )}
              {show(cv.contact.website) && (
                <li>
                  <ProfileLink value={cv.contact.website} kind="web" />
                </li>
              )}
              {showWorkAuth && show(cv.nationality) && <li>{cv.nationality}</li>}
              {showWorkAuth && show(cv.workAuth) && <li>{cv.workAuth}</li>}
            </ul>
          </section>

          {hasItems(cv.skills) && (
            <section>
              <SectionLabel>{labels.skills}</SectionLabel>
              <ul className="cv-chips">
                {cv.skills.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </section>
          )}

          {hasItems(cv.languages) && (
            <section>
              <SectionLabel>{labels.languages}</SectionLabel>
              <ul className="cv-plain">
                {cv.languages.map((l) => (
                  <li key={l.id}>
                    {l.name}
                    {l.level ? ` — ${l.level}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasItems(cv.certifications) && (
            <section>
              <SectionLabel>{labels.certifications}</SectionLabel>
              <CertList items={cv.certifications} />
            </section>
          )}
        </aside>

        <div>
          {showObjective && show(cv.objective) && (
            <section>
              <SectionLabel>{labels.objective}</SectionLabel>
              <p className="cv-prose">{cv.objective}</p>
            </section>
          )}

          <SummaryBlock text={cv.summary} title={labels.summary} />

          {hasItems(cv.experience) && (
            <section>
              <SectionLabel>{labels.experience}</SectionLabel>
              <ExperienceList items={cv.experience} />
            </section>
          )}

          {hasItems(cv.education) && (
            <section>
              <SectionLabel>{labels.education}</SectionLabel>
              {sortEducation(cv.education).map((ed) => (
                <div key={ed.id} className="cv-entry">
                  <div className="cv-entry-top">
                    <strong>{ed.school}</strong>
                    <span>{joinMeta([ed.startDate, ed.endDate])}</span>
                  </div>
                  <div className="cv-entry-sub">{joinMeta([ed.degree, ed.field])}</div>
                  {show(ed.details) && <p className="cv-prose">{ed.details}</p>}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
