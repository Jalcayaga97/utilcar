import { loadEnv } from 'vite'
import { buildContactErrorBody, handleContactPost } from '../../api/lib/contactHandler.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim()
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export function contactApiPlugin() {
  return {
    name: 'utilcar-contact-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] == null) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/contact') return next()

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'method_not_allowed' })
          return
        }

        try {
          const body = await readJsonBody(req)
          const result = await handleContactPost(body)
          sendJson(res, result.status, result.body)
        } catch (error) {
          console.error('CONTACT ERROR:', error)
          sendJson(res, 500, buildContactErrorBody(error))
        }
      })
    },
  }
}
