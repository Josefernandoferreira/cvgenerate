import type { CVData } from '../types'
import { useRegion } from '../lib/regionContext'
import { sortEducation } from '../lib/organize'
import { CertList, ExperienceList, PhoneLink, Photo, ProfileLink, SummaryBlock, hasItems, joinMeta, show } from './shared'

export function Sidebar({ cv }: { cv: CVData }) {
  const { labels, showObjective, showWorkAuth } = useRegion()

  return (
    <article className="cv cv-sidebar">
      <aside className="cv-sidebar-rail">
        <Photo cv={cv} className="lg" />
        <h1>{cv.name || labels.nameFallback}</h1>
        {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}

        <h2>{labels.contact}</h2>
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

        {hasItems(cv.skills) && (
          <>
            <h2>{labels.skills}</h2>
            <ul className="cv-plain">
              {cv.skills.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </>
        )}

        {hasItems(cv.languages) && (
          <>
            <h2>{labels.languages}</h2>
            <ul className="cv-plain">
              {cv.languages.map((l) => (
                <li key={l.id}>
                  {l.name}
                  {l.level ? ` — ${l.level}` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      <div className="cv-sidebar-main">
        {showObjective && show(cv.objective) && (
          <section>
            <h2>{labels.objective}</h2>
            <p className="cv-prose">{cv.objective}</p>
          </section>
        )}

        <SummaryBlock text={cv.summary} title={labels.summary} />

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
                  <strong>{ed.school}</strong>
                  <span>{joinMeta([ed.startDate, ed.endDate])}</span>
                </div>
                <div className="cv-entry-sub">{joinMeta([ed.degree, ed.field])}</div>
                {show(ed.details) && <p className="cv-prose">{ed.details}</p>}
              </div>
            ))}
          </section>
        )}

        {hasItems(cv.certifications) && (
          <section>
            <h2>{labels.certifications}</h2>
            <CertList items={cv.certifications} />
          </section>
        )}
      </div>
    </article>
  )
}
