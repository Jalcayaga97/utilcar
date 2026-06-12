import { handleContactPost } from './lib/contactHandler.js'

/**
 * Vercel Node.js Function — Web Standard fetch export.
 * Respuestas permitidas: 200 | 400 | 502 | 503
 */
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } })
    }

    if (request.method !== 'POST') {
      return Response.json({ ok: false, error: 'invalid_input' }, { status: 400 })
    }

    try {
      let body
      try {
        body = await request.json()
      } catch {
        return Response.json({ ok: false, error: 'invalid_input' }, { status: 400 })
      }

      if (body == null || typeof body !== 'object' || Array.isArray(body)) {
        return Response.json({ ok: false, error: 'invalid_input' }, { status: 400 })
      }

      const result = await handleContactPost(body)
      return Response.json(result.body, { status: result.status })
    } catch (error) {
      console.error('CONTACT ERROR:', error)
      const detail = error instanceof Error ? error.message : String(error)
      return Response.json({ ok: false, error: 'resend_failed', detail }, { status: 502 })
    }
  },
}
