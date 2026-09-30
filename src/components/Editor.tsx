import type { ChangeEvent } from 'react'
import type { CVData } from '../types'
import {
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptySkill,
} from '../lib/empty'
import { orderEducation, orderExperience, sortExperience } from '../lib/organize'
import { useRegion } from '../lib/regionContext'
import { whatsappHref } from '../lib/whatsapp'
import { linkedinHref, webHref } from '../lib/contactLinks'

type Props = {
  cv: CVData
  onChange: (cv: CVData) => void
}

export function Editor({ cv, onChange }: Props) {
  const region = useRegion()
  function patch(partial: Partial<CVData>) {
    onChange({ ...cv, ...partial })
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => patch({ photo: String(reader.result ?? '') })
    reader.readAsDataURL(file)
  }

  return (
    <div className="editor">
      <details open>
        <summary>Perfil</summary>
        <label>
          Nome
          <input value={cv.name} onChange={(e) => patch({ name: e.target.value })} />
        </label>
        <label>
          Título
          <input value={cv.headline} onChange={(e) => patch({ headline: e.target.value })} />
        </label>
        {region.showObjective && (
          <label>
            {region.labels.objective}
            <textarea rows={3} value={cv.objective} onChange={(e) => patch({ objective: e.target.value })} />
          </label>
        )}
        <label>
          {region.labels.summary}
          <textarea
            rows={5}
            placeholder="Texto de apresentação que aparece abaixo de Resumo no PDF do LinkedIn."
            value={cv.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </label>
        <p className="field-hint">
          No LinkedIn esse bloco fica logo abaixo do título Resumo / Sobre / About.
        </p>
        {region.showWorkAuth && (
          <>
            <label>
              {region.labels.nationality}
              <input value={cv.nationality} onChange={(e) => patch({ nationality: e.target.value })} />
            </label>
            <label>
              {region.labels.workAuth}
              <input
                placeholder="EU citizen, visa, etc."
                value={cv.workAuth}
                onChange={(e) => patch({ workAuth: e.target.value })}
              />
            </label>
          </>
        )}
        <label className="file-field">
          Foto
          <input type="file" accept="image/*" onChange={onPhoto} />
        </label>
        {!region.showPhoto && (
          <p className="field-hint">O padrão {region.formal} omite foto. Ela fica salva, mas some do PDF.</p>
        )}
        {cv.photo && (
          <button type="button" className="linkish" onClick={() => patch({ photo: '' })}>
            Remover foto
          </button>
        )}
      </details>

      <details open>
        <summary>Contato</summary>
        {(
          [
            ['email', 'E-mail'],
            ['phone', 'Telefone'],
            ['location', 'Cidade'],
            ['linkedin', 'LinkedIn'],
            ['website', 'GitHub / site'],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={cv.contact[key]}
              onChange={(e) =>
                patch({ contact: { ...cv.contact, [key]: e.target.value } })
              }
            />
          </label>
        ))}
        {whatsappHref(cv.contact.phone) && (
          <p className="field-hint">
            WhatsApp:{' '}
            <a className="linkish" href={whatsappHref(cv.contact.phone)} target="_blank" rel="noreferrer">
              {whatsappHref(cv.contact.phone)}
            </a>
          </p>
        )}
        {linkedinHref(cv.contact.linkedin) && (
          <p className="field-hint">
            LinkedIn:{' '}
            <a className="linkish" href={linkedinHref(cv.contact.linkedin)} target="_blank" rel="noreferrer">
              {linkedinHref(cv.contact.linkedin)}
            </a>
          </p>
        )}
        {webHref(cv.contact.website) && (
          <p className="field-hint">
            {/github/i.test(webHref(cv.contact.website)) ? 'GitHub' : 'Site'}:{' '}
            <a className="linkish" href={webHref(cv.contact.website)} target="_blank" rel="noreferrer">
              {webHref(cv.contact.website)}
            </a>
          </p>
        )}
      </details>

      <details open>
        <summary>Experiência</summary>
        <p className="field-hint">Mais recente primeiro. Cargos da mesma empresa ficam juntos no PDF.</p>
        {orderExperience(cv.experience).map((job, index) => (
          <fieldset key={job.id}>
            <legend>Cargo {index + 1}</legend>
            <label>
              Título
              <input
                value={job.title}
                onChange={(e) =>
                  patch({
                    experience: cv.experience.map((item) =>
                      item.id === job.id ? { ...item, title: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              Empresa
              <input
                value={job.company}
                onChange={(e) =>
                  patch({
                    experience: cv.experience.map((item) =>
                      item.id === job.id ? { ...item, company: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <div className="row2">
              <label>
                Início
                <input
                  value={job.startDate}
                  onChange={(e) =>
                    patch({
                      experience: cv.experience.map((item) =>
                        item.id === job.id ? { ...item, startDate: e.target.value } : item,
                      ),
                    })
                  }
                  onBlur={() => patch({ experience: sortExperience(cv.experience) })}
                />
              </label>
              <label>
                Fim
                <input
                  value={job.endDate}
                  onChange={(e) =>
                    patch({
                      experience: cv.experience.map((item) =>
                        item.id === job.id ? { ...item, endDate: e.target.value } : item,
                      ),
                    })
                  }
                  onBlur={() => patch({ experience: sortExperience(cv.experience) })}
                />
              </label>
            </div>
            <label>
              Local
              <input
                value={job.location}
                onChange={(e) =>
                  patch({
                    experience: cv.experience.map((item) =>
                      item.id === job.id ? { ...item, location: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              Destaques (um por linha)
              <textarea
                rows={4}
                value={job.bullets.join('\n')}
                onChange={(e) =>
                  patch({
                    experience: cv.experience.map((item) =>
                      item.id === job.id ? { ...item, bullets: e.target.value.split('\n') } : item,
                    ),
                  })
                }
              />
            </label>
            <div className="row-actions">
              <button
                type="button"
                onClick={() =>
                  patch({ experience: cv.experience.filter((item) => item.id !== job.id) })
                }
              >
                Remover
              </button>
            </div>
          </fieldset>
        ))}
        <button type="button" className="btn add" onClick={() => patch({ experience: [...cv.experience, emptyExperience()] })}>
          Adicionar cargo
        </button>
      </details>

      <details>
        <summary>Formação acadêmica</summary>
        {orderEducation(cv.education).map((ed, index) => (
          <fieldset key={ed.id}>
            <legend>Curso {index + 1}</legend>
            <label>
              Instituição
              <input
                value={ed.school}
                onChange={(e) =>
                  patch({
                    education: cv.education.map((item) =>
                      item.id === ed.id ? { ...item, school: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              Diploma
              <input
                value={ed.degree}
                onChange={(e) =>
                  patch({
                    education: cv.education.map((item) =>
                      item.id === ed.id ? { ...item, degree: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              Área
              <input
                value={ed.field}
                onChange={(e) =>
                  patch({
                    education: cv.education.map((item) =>
                      item.id === ed.id ? { ...item, field: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <div className="row2">
              <label>
                Início
                <input
                  value={ed.startDate}
                  onChange={(e) =>
                    patch({
                      education: cv.education.map((item) =>
                        item.id === ed.id ? { ...item, startDate: e.target.value } : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Fim
                <input
                  value={ed.endDate}
                  onChange={(e) =>
                    patch({
                      education: cv.education.map((item) =>
                        item.id === ed.id ? { ...item, endDate: e.target.value } : item,
                      ),
                    })
                  }
                />
              </label>
            </div>
            <label>
              Detalhes
              <textarea
                rows={2}
                value={ed.details}
                onChange={(e) =>
                  patch({
                    education: cv.education.map((item) =>
                      item.id === ed.id ? { ...item, details: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <button
              type="button"
              onClick={() => patch({ education: cv.education.filter((item) => item.id !== ed.id) })}
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button type="button" className="btn add" onClick={() => patch({ education: [...cv.education, emptyEducation()] })}>
          Adicionar formação
        </button>
      </details>

      <details>
        <summary>Competências</summary>
        <label>
          Uma por linha
          <textarea
            rows={6}
            value={cv.skills.map((s) => s.name).join('\n')}
            onChange={(e) =>
              patch({
                skills: e.target.value.split('\n').map((name, i) => ({
                  id: cv.skills[i]?.id ?? crypto.randomUUID(),
                  name,
                })),
              })
            }
          />
        </label>
        <button type="button" className="btn add" onClick={() => patch({ skills: [...cv.skills, emptySkill()] })}>
          Adicionar linha
        </button>
      </details>

      <details>
        <summary>Idiomas</summary>
        {region.id === 'eu' && (
          <p className="field-hint">Use CEFR: A1, A2, B1, B2, C1, C2.</p>
        )}
        {cv.languages.map((lang) => (
          <div key={lang.id} className="row2">
            <input
              placeholder="Idioma"
              value={lang.name}
              onChange={(e) =>
                patch({
                  languages: cv.languages.map((item) =>
                    item.id === lang.id ? { ...item, name: e.target.value } : item,
                  ),
                })
              }
            />
            <input
              placeholder="Nível"
              value={lang.level}
              onChange={(e) =>
                patch({
                  languages: cv.languages.map((item) =>
                    item.id === lang.id ? { ...item, level: e.target.value } : item,
                  ),
                })
              }
            />
          </div>
        ))}
        <button type="button" className="btn add" onClick={() => patch({ languages: [...cv.languages, emptyLanguage()] })}>
          Adicionar idioma
        </button>
      </details>

      <details>
        <summary>Certificações</summary>
        {cv.certifications.map((cert) => (
          <fieldset key={cert.id}>
            <input
              placeholder="Nome"
              value={cert.name}
              onChange={(e) =>
                patch({
                  certifications: cv.certifications.map((item) =>
                    item.id === cert.id ? { ...item, name: e.target.value } : item,
                  ),
                })
              }
            />
            <input
              placeholder="Emissor"
              value={cert.issuer}
              onChange={(e) =>
                patch({
                  certifications: cv.certifications.map((item) =>
                    item.id === cert.id ? { ...item, issuer: e.target.value } : item,
                  ),
                })
              }
            />
            <input
              placeholder="Ano"
              value={cert.date}
              onChange={(e) =>
                patch({
                  certifications: cv.certifications.map((item) =>
                    item.id === cert.id ? { ...item, date: e.target.value } : item,
                  ),
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                patch({
                  certifications: cv.certifications.filter((item) => item.id !== cert.id),
                })
              }
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="btn add"
          onClick={() => patch({ certifications: [...cv.certifications, emptyCertification()] })}
        >
          Adicionar certificado
        </button>
      </details>
    </div>
  )
}
