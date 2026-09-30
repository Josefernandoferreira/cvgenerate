import { existsSync, readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const API_URL = 'https://translation.googleapis.com/language/translate/v2'

type TranslateBody = {
  q?: string | string[]
  source?: string
  target?: string
}

export function googleTranslateProxy(apiKey: string | undefined): Plugin {
  const handle = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = req.url?.split('?')[0] ?? ''
    if (path !== '/api/translate') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }
    void respond(req, res, apiKey)
  }

  return {
    name: 'google-translate-proxy',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}

function readApiKey(fallback?: string) {
  for (const name of ['.env.local', '.env']) {
    const file = resolve(process.cwd(), name)
    if (!existsSync(file)) continue
    const match = readFileSync(file, 'utf8').match(/^GOOGLE_TRANSLATE_API_KEY\s*=\s*(.+)\s*$/m)
    const value = match?.[1]?.trim().replace(/^["']|["']$/g, '')
    if (value) return value
  }
  return fallback?.trim() ?? ''
}

async function respond(req: IncomingMessage, res: ServerResponse, apiKey: string | undefined) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const key = readApiKey(apiKey)
  if (!key) {
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'missing_key', translations: [] }))
    return
  }

  try {
    const body = parseBody(await readBody(req))
    const queries = Array.isArray(body.q) ? body.q : body.q ? [body.q] : []
    const texts = queries.map((item) => item.trim()).filter(Boolean)
    if (!texts.length || !body.source || !body.target) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'invalid_body', translations: [] }))
      return
    }

    const google = await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: body.source,
        target: body.target,
        format: 'text',
      }),
    })
    const payload = (await google.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> }
      error?: { message?: string }
    }
    if (!google.ok) {
      res.statusCode = google.status
      res.end(JSON.stringify({ error: payload.error?.message ?? 'google_error', translations: [] }))
      return
    }

    const translations = (payload.data?.translations ?? []).map((item) =>
      decodeHtml(item.translatedText ?? ''),
    )
    res.statusCode = 200
    res.end(JSON.stringify({ translations }))
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'translate_failed', translations: [] }))
  }
}

function parseBody(raw: string): TranslateBody {
  try {
    return JSON.parse(raw) as TranslateBody
  } catch {
    return {}
  }
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function decodeHtml(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(Number.parseInt(n, 16)))
}
