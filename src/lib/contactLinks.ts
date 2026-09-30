export function ensureHttp(value: string): string {
  const text = value.trim().replace(/^https?:\/\//i, '')
  if (!text) return ''
  return `https://${text}`
}

export function linkedinHref(value: string): string {
  const text = value.trim()
  if (!text) return ''
  if (/linkedin\.com/i.test(text)) return ensureHttp(text)
  const slug = text.replace(/^@/, '').replace(/^\/?(in\/)?/i, '').replace(/\/+$/, '')
  if (!slug) return ''
  return `https://www.linkedin.com/in/${slug}`
}

export function githubHref(value: string): string {
  const text = value.trim()
  if (!text) return ''
  if (/github\.com/i.test(text)) return ensureHttp(text)
  const slug = text.replace(/^@/, '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (/^[\w.-]+$/.test(slug) && !/\.(com|dev|app|io|net|org|design|me|br)$/i.test(slug)) {
    return `https://github.com/${slug}`
  }
  return ensureHttp(text)
}

export function webHref(value: string): string {
  const text = value.trim()
  if (!text) return ''
  if (/github\.com/i.test(text) || isGithubHandle(text)) return githubHref(text)
  return ensureHttp(text)
}

function isGithubHandle(value: string) {
  const text = value.trim().replace(/^@/, '')
  return /^[\w.-]+$/.test(text) && !text.includes('.')
}
