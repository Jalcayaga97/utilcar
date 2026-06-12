import { buildContactErrorBody, handleContactPost } from './lib/contactHandler.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false })
  }

  try {
    const result = await handleContactPost(req.body ?? {})
    return res.status(result.status).json(result.body)
  } catch (error) {
    console.error('CONTACT ERROR:', error)
    return res.status(500).json(buildContactErrorBody(error))
  }
}
