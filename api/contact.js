import { buildContactErrorBody, handleContactPost } from './lib/contactHandler.js'

/**
 * Vercel Node.js Function — Web Standard fetch export.
 * Runtime: Node.js (no Edge). Respuestas vía Response.json().
 */
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { Allow: 'POST, OPTIONS' },
      })
    }

    if (request.method !== 'POST') {
      return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 })
    }

    try {
      let body
      try {
        body = await request.json()
      } catch {
        return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
      }

      if (body == null || typeof body !== 'object' || Array.isArray(body)) {
        return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
      }

      const result = await handleContactPost(body)
      return Response.json(result.body, { status: result.status })
    } catch (error) {
      console.error('CONTACT ERROR:', error)
      return Response.json(buildContactErrorBody(error), { status: 500 })
    }
  },
}
