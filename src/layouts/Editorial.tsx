import type { CVData } from '../types'
import { useRegion } from '../lib/regionContext'
import { sortEducation } from '../lib/organize'
import { CertList, ExperienceList, PhoneLink, ProfileLink, SummaryBlock, hasItems, joinMeta, show } from './shared'

export function Editorial({ cv }: { cv: CVData }) {
  const { labels, showObjective } = useRegion()

  return (
    <article className="cv cv-editorial">
      <header>
        <p className="cv-kicker">{cv.contact.location || labels.document}</p>
        <h1>{cv.name || labels.nameFallback}</h1>
        {show(cv.headline) && <p className="cv-headline">{cv.headline}</p>}
        <p className="cv-contact">
          {[
            cv.contact.email,
            cv.contact.phone ? <PhoneLink key="phone" phone={cv.contact.phone} /> : null,
            cv.contact.linkedin ? <ProfileLink key="linkedin" value={cv.contact.linkedin} kind="linkedin" /> : null,
            cv.contact.website ? <ProfileLink key="web" value={cv.contact.website} kind="web" /> : null,
          ]
            .filter(Boolean)
            .map((item, i) => (
              <span key={i}>
                {i > 0 ? '   ' : null}
                {item}
              </span>
            ))}
        </p>
      </header>

      {showObjective && show(cv.objective) && (
        <section>
          <h2>{labels.objective}</h2>
          <p className="cv-deck">{cv.objective}</p>
        </section>
      )}
      <SummaryBlock text={cv.summary} title={labels.summary} leadClass="cv-deck" />

      <div className="cv-editorial-grid">
        <div>
          {hasItems(cv.experience) && (
            <section>
              <h2>{labels.path}</h2>
              <ExperienceList items={cv.experience} />
            </section>
          )}
        </div>

        <aside>
          {hasItems(cv.education) && (
            <section>
              <h2>{labels.study}</h2>
              {sortEducation(cv.education).map((ed) => (
                <div key={ed.id} className="cv-entry">
                  <strong>{ed.school}</strong>
                  <div className="cv-entry-sub">{joinMeta([ed.degree, ed.field])}</div>
                  <div className="cv-when">{joinMeta([ed.startDate, ed.endDate])}</div>
                  {show(ed.details) && <p className="cv-prose">{ed.details}</p>}
                </div>
              ))}
            </section>
          )}

          {hasItems(cv.skills) && (
            <section>
              <h2>{labels.craft}</h2>
              <p className="cv-prose">{cv.skills.map((s) => s.name).join(' · ')}</p>
            </section>
          )}

          {hasItems(cv.languages) && (
            <section>
              <h2>{labels.tongues}</h2>
              <p className="cv-prose">
                {cv.languages
                  .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
                  .join(' · ')}
              </p>
            </section>
          )}

          {hasItems(cv.certifications) && (
            <section>
              <h2>{labels.seals}</h2>
              <CertList items={cv.certifications} />
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
