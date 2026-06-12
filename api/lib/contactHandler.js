import { Resend } from 'resend'

const FIELD_LIMITS = {
  nombre: 120,
  empresa: 120,
  mail: 254,
  telefono: 40,
  servicio: 120,
  consulta: 5000,
  to: 254,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
}

function sanitizeField(value, maxLength) {
  return stripHtml(value).slice(0, maxLength)
}

function isValidEmail(value) {
  return EMAIL_RE.test(value) && value.length <= FIELD_LIMITS.mail
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildContactErrorBody(error) {
  return {
    ok: false,
    error: error?.message || String(error),
    stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
  }
}

export function parseContactPayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, status: 400, error: 'invalid_payload' }
  }

  const nombre = sanitizeField(raw.nombre, FIELD_LIMITS.nombre)
  const empresa = sanitizeField(raw.empresa, FIELD_LIMITS.empresa)
  const mail = sanitizeField(raw.mail, FIELD_LIMITS.mail)
  const telefono = sanitizeField(raw.telefono, FIELD_LIMITS.telefono)
  const servicio = sanitizeField(raw.servicio, FIELD_LIMITS.servicio)
  const consulta = sanitizeField(raw.consulta, FIELD_LIMITS.consulta)
  const to = sanitizeField(raw.to, FIELD_LIMITS.to)
  const submittedAt = sanitizeField(raw.submittedAt, 40) || new Date().toISOString()

  if (!nombre) return { ok: false, status: 400, error: 'missing_nombre' }
  if (!mail) return { ok: false, status: 400, error: 'missing_mail' }
  if (!isValidEmail(mail)) return { ok: false, status: 400, error: 'invalid_mail' }
  if (!servicio) return { ok: false, status: 400, error: 'missing_servicio' }
  if (!consulta) return { ok: false, status: 400, error: 'missing_consulta' }
  if (!to) return { ok: false, status: 400, error: 'missing_to' }
  if (!isValidEmail(to)) return { ok: false, status: 400, error: 'invalid_to' }

  return {
    ok: true,
    data: { nombre, empresa, mail, telefono, servicio, consulta, to, submittedAt },
  }
}

function buildEmailHtml(data) {
  const rows = [
    ['Nombre', data.nombre],
    ['Empresa', data.empresa || '—'],
    ['Correo', data.mail],
    ['Teléfono', data.telefono || '—'],
    ['Servicio', data.servicio],
    ['Consulta', data.consulta],
    ['Fecha', data.submittedAt],
  ]

  const body = rows
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`,
    )
    .join('\n')

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5;color:#111">${body}</body></html>`
}

export async function sendContactEmail(data) {
  const apiKey = String(process.env.RESEND_API_KEY ?? '').trim()
  if (!apiKey) {
    console.error('CONTACT ERROR: RESEND_API_KEY no configurada en el entorno')
    return {
      ok: false,
      status: 503,
      error: new Error('missing_resend_api_key'),
    }
  }

  const from = String(process.env.RESEND_FROM_EMAIL ?? '').trim() || 'Utilcar <onboarding@resend.dev>'

  try {
    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from,
      to: data.to,
      replyTo: data.mail,
      subject: 'Nueva consulta desde utilcar.cl',
      html: buildEmailHtml(data),
    })

    if (result.error) {
      console.error('CONTACT ERROR: Resend API', result.error)
      return {
        ok: false,
        status: 502,
        error: new Error(result.error.message ?? JSON.stringify(result.error)),
      }
    }

    return { ok: true, status: 200, id: result.data?.id ?? null }
  } catch (error) {
    console.error('CONTACT ERROR: Resend send failed', error)
    return { ok: false, status: 502, error }
  }
}

export async function handleContactPost(body) {
  try {
    const parsed = parseContactPayload(body)
    if (!parsed.ok) {
      return { status: parsed.status, body: { ok: false, error: parsed.error } }
    }

    const sent = await sendContactEmail(parsed.data)
    if (!sent.ok) {
      const error = sent.error instanceof Error ? sent.error : new Error(String(sent.error))
      return { status: sent.status, body: buildContactErrorBody(error) }
    }

    return { status: 200, body: { ok: true, id: sent.id } }
  } catch (error) {
    console.error('CONTACT ERROR:', error)
    return { status: 500, body: buildContactErrorBody(error) }
  }
}
