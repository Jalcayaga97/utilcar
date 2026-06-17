import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REVALIDATE_SECONDS = 60
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadSnapshot() {
  const candidates = [
    join(__dirname, '../../public/cms/home-isr.json'),
    join(process.cwd(), 'public/cms/home-isr.json'),
  ]

  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, 'utf8'))
    } catch {
      /* siguiente candidato */
    }
  }

  return null
}

/**
 * Vercel Node.js Function — snapshot Home con caché CDN (ISR-equivalente).
 */
export default {
  async fetch() {
    const snapshot = loadSnapshot()

    if (!snapshot) {
      return Response.json({ error: 'snapshot_unavailable' }, { status: 503 })
    }

    return Response.json(snapshot, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    })
  },
}
