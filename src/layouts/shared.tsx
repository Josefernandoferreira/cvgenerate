import type { Certification, CVData, Experience } from '../types'
import { groupExperience, stitchBulletLines, type ExperienceGroup } from '../lib/organize'
import { formatToday } from '../lib/cvLang'
import { useRegion } from '../lib/regionContext'
import { whatsappHref } from '../lib/whatsapp'
import { githubHref, linkedinHref, webHref } from '../lib/contactLinks'

export function joinMeta(parts: Array<string | undefined>) {
  return parts.map((p) => p?.trim()).filter(Boolean).join('  ·  ')
}

export function show(text?: string) {
  return Boolean(text?.trim())
}

export function hasItems<T>(items?: T[]) {
  return Boolean(items?.length)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SectionLabel({ children }: { children: string }) {
  return <h2 className="cv-label">{children}</h2>
}

export function SummaryBlock({
  text,
  title,
  leadClass = 'cv-prose',
}: {
  text?: string
  title: string
  leadClass?: string
}) {
  if (!show(text)) return null
  return (
    <section className="cv-summary">
      <h2 className="cv-label">{title}</h2>
      <p className={leadClass}>{text}</p>
    </section>
  )
}

export function PhoneLink({ phone }: { phone: string }) {
  const href = whatsappHref(phone)
  if (!href) return <>{phone}</>
  return (
    <a className="cv-link cv-whatsapp" href={href} target="_blank" rel="noreferrer">
      {phone}
    </a>
  )
}

export function ProfileLink({
  value,
  kind,
}: {
  value: string
  kind: 'linkedin' | 'github' | 'web'
}) {
  const href = kind === 'linkedin' ? linkedinHref(value) : kind === 'github' ? githubHref(value) : webHref(value)
  if (!href) return <>{value}</>
  return (
    <a className="cv-link" href={href} target="_blank" rel="noreferrer">
      {value}
    </a>
  )
}

export function ContactRow({ cv }: { cv: CVData }) {
  const region = useRegion()
  const items = [
    cv.contact.email,
    cv.contact.phone ? <PhoneLink key="phone" phone={cv.contact.phone} /> : null,
    cv.contact.location,
    cv.contact.linkedin ? <ProfileLink key="linkedin" value={cv.contact.linkedin} kind="linkedin" /> : null,
    cv.contact.website ? <ProfileLink key="web" value={cv.contact.website} kind="web" /> : null,
    region.showWorkAuth && cv.nationality ? cv.nationality : '',
    region.showWorkAuth && cv.workAuth ? cv.workAuth : '',
  ].filter((item) => (typeof item === 'string' ? item.trim() : item))
  if (!items.length) return null
  return (
    <p className="cv-contact">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 ? '  ·  ' : null}
          {item}
        </span>
      ))}
    </p>
  )
}

export function Photo({
  cv,
  className = '',
}: {
  cv: CVData
  className?: string
}) {
  const region = useRegion()
  if (!region.showPhoto) return null
  if (cv.photo) return <img className={`cv-photo ${className}`} src={cv.photo} alt="" />
  if (!cv.name) return null
  return <div className={`cv-photo cv-photo-fallback ${className}`}>{initials(cv.name)}</div>
}

function RoleBlock({
  job,
  company,
  grouped,
}: {
  job: Experience
  company: string
  grouped: boolean
}) {
  const dates = joinMeta([job.startDate, job.endDate])
  const meta = grouped
    ? job.location
    : joinMeta([company && company !== job.title ? company : '', job.location])
  const bullets = stitchBulletLines(job.bullets.filter(Boolean))

  return (
    <div className="cv-role">
      <p className="cv-role-title">{job.title || company}</p>
      {show(dates) && <p className="cv-role-dates">{dates}</p>}
      {show(meta) && <p className="cv-role-meta">{meta}</p>}
      {hasItems(bullets) && (
        <ul>
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ExperienceList({ items }: { items: Experience[] }) {
  const groups = groupExperience(items)
  return (
    <div className="cv-timeline">
      {groups.map((group) => (
        <ExperienceGroupBlock key={group.roles[0]?.id ?? group.company} group={group} />
      ))}
    </div>
  )
}

function ExperienceGroupBlock({ group }: { group: ExperienceGroup }) {
  const grouped = group.roles.length > 1 && Boolean(group.company)
  const span = grouped
    ? joinMeta([group.roles[group.roles.length - 1]?.startDate, group.roles[0]?.endDate])
    : ''

  return (
    <div className={`cv-company ${grouped ? 'is-grouped' : ''}`}>
      {grouped && (
        <div className="cv-company-head">
          <strong>{group.company}</strong>
          <span>{span}</span>
        </div>
      )}
      {group.roles.map((job) => (
        <RoleBlock key={job.id} job={job} company={group.company} grouped={grouped} />
      ))}
    </div>
  )
}

export function ClosingBlock({ name }: { name: string }) {
  const { labels, lang } = useRegion()
  return (
    <footer className="cv-closing">
      <p className="cv-closing-name">{name.trim() || labels.nameFallback}</p>
      <p className="cv-closing-date">{formatToday(lang)}</p>
    </footer>
  )
}

export function CertList({ items }: { items: Certification[] }) {
  if (!hasItems(items)) return null
  return (
    <ul className="cv-certs">
      {items.map((cert) => {
        const meta = joinMeta([cert.issuer, cert.date])
        return (
          <li key={cert.id}>
            <strong>{cert.name}</strong>
            {show(meta) && <span>{meta}</span>}
          </li>
        )
      })}
    </ul>
  )
}
