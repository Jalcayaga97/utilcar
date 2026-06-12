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
  if (value == null) return false
  const email = String(value).trim()
  if (!email || email.length > FIELD_LIMITS.mail) return false
  return EMAIL_RE.test(email)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** string | array → primer valor no vacío con trim; null/undefined → '' */
export function normalizeRecipient(value) {
  if (value == null) return ''

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item == null) continue
      const candidate = String(item).trim()
      if (candidate) return candidate
    }
    return ''
  }

  if (typeof value === 'string') return value.trim()

  return ''
}

function responseBody(error, detail) {
  const body = { ok: false, error }
  if (detail) body.detail = detail
  return body
}

function invalidInput(reason) {
  console.error('CONTACT VALIDATION:', reason)
  return { ok: false, status: 400, body: responseBody('invalid_input') }
}

export function parseContactPayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return invalidInput('invalid_payload')
  }

  const nombre = sanitizeField(raw.nombre, FIELD_LIMITS.nombre)
  const empresa = sanitizeField(raw.empresa, FIELD_LIMITS.empresa)
  const mail = sanitizeField(raw.mail, FIELD_LIMITS.mail)
  const telefono = sanitizeField(raw.telefono, FIELD_LIMITS.telefono)
  const servicio = sanitizeField(raw.servicio, FIELD_LIMITS.servicio)
  const consulta = sanitizeField(raw.consulta, FIELD_LIMITS.consulta)
  const to = sanitizeField(normalizeRecipient(raw.to), FIELD_LIMITS.to)
  const submittedAt = sanitizeField(raw.submittedAt, 40) || new Date().toISOString()

  if (!nombre) return invalidInput('missing_nombre')
  if (!mail) return invalidInput('missing_mail')
  if (!isValidEmail(mail)) return invalidInput('invalid_mail')
  if (!servicio) return invalidInput('missing_servicio')
  if (!consulta) return invalidInput('missing_consulta')
  if (!to) return invalidInput('missing_to')
  if (!isValidEmail(to)) return invalidInput('invalid_to')

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

function validateBeforeResend(data) {
  if (!isNonEmptyString(data.consulta)) {
    console.error('CONTACT VALIDATION: data.consulta vacío')
    return { ok: false, status: 400, body: responseBody('invalid_input') }
  }

  if (!isValidEmail(data.mail)) {
    console.error('CONTACT VALIDATION: data.mail inválido')
    return { ok: false, status: 400, body: responseBody('invalid_input') }
  }

  const to = normalizeRecipient(data.to)
  if (!to || !isValidEmail(to)) {
    console.error('CONTACT VALIDATION: data.to inválido')
    return { ok: false, status: 400, body: responseBody('invalid_input') }
  }

  return { ok: true, to }
}

function getEmailConfig() {
  const apiKey = String(process.env.RESEND_API_KEY ?? '').trim()
  const from = String(process.env.RESEND_FROM_EMAIL ?? '').trim()

  if (!apiKey || !from) {
    console.error('CONTACT CONFIG: RESEND_API_KEY o RESEND_FROM_EMAIL faltante')
    return { ok: false, status: 503, body: responseBody('missing_email_config') }
  }

  if (!isNonEmptyString(from)) {
    console.error('CONTACT CONFIG: RESEND_FROM_EMAIL vacío tras trim')
    return { ok: false, status: 503, body: responseBody('missing_email_config') }
  }

  return { ok: true, apiKey, from }
}

export async function sendContactEmail(data) {
  console.log('📦 CONTACT BODY:', data)

  const inputCheck = validateBeforeResend(data)
  if (!inputCheck.ok) return inputCheck

  const config = getEmailConfig()
  if (!config.ok) return config

  const from = config.from
  const to = inputCheck.to
  const subject = 'Nuevo contacto'
  const html = buildEmailHtml(data)

  if (!isNonEmptyString(from) || !isValidEmail(to) || !isValidEmail(data.mail) || !isNonEmptyString(subject) || !isNonEmptyString(html)) {
    console.error('CONTACT VALIDATION: payload Resend incompleto o inválido')
    return { ok: false, status: 400, body: responseBody('invalid_input') }
  }

  const resendPayload = {
    from,
    to,
    replyTo: data.mail,
    subject,
    html,
  }

  console.log('📤 RESEND PAYLOAD:', resendPayload)

  try {
    const resend = new Resend(config.apiKey)
    const result = await resend.emails.send(resendPayload)

    if (result.error) {
      const detail = result.error.message ?? JSON.stringify(result.error)
      console.error('RESEND FAIL:', result.error)
      return { ok: false, status: 502, body: responseBody('resend_failed', detail) }
    }

    return { ok: true, status: 200, body: { ok: true, id: result.data?.id ?? null } }
  } catch (err) {
    console.error('RESEND FAIL:', err)
    const detail = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 502, body: responseBody('resend_failed', detail) }
  }
}

export async function handleContactPost(body) {
  try {
    const parsed = parseContactPayload(body)
    if (!parsed.ok) return parsed

    return await sendContactEmail(parsed.data)
  } catch (error) {
    console.error('CONTACT ERROR:', error)
    const detail = error instanceof Error ? error.message : String(error)
    return { ok: false, status: 502, body: responseBody('resend_failed', detail) }
  }
}
