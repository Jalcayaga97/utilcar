/**
 * Envío del formulario de contacto vía POST /api/contact (Resend en servidor).
 *
 * @param {Object} formData — campos del formulario
 * @returns {Promise<{ ok: boolean }>}
 */
export async function submitContact(formData, { to } = {}) {
  const destination = String(to ?? '').trim()
  if (!destination) {
    throw new Error('missing_contact_email')
  }

  const payload = {
    ...formData,
    to: destination,
    submittedAt: new Date().toISOString(),
  }

  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok || !data?.ok) {
    throw new Error('send_failed')
  }

  return { ok: true }
}
