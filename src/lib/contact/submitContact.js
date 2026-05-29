import { ENV } from '@/constants/env'

/**
 * Envío del formulario de contacto.
 *
 * Integración futura (descomentar y configurar):
 * - Resend: POST a API route con RESEND_API_KEY
 * - EmailJS: emailjs.send(serviceId, templateId, payload)
 *
 * @param {Object} formData — campos del formulario
 * @returns {Promise<{ ok: boolean }>}
 */
export async function submitContact(formData) {
  const payload = {
    ...formData,
    to: ENV.contactEmail,
    submittedAt: new Date().toISOString(),
  }

  if (import.meta.env.DEV) {
    void payload
  }

  // Ejemplo Resend (futuro):
  // const res = await fetch('/api/contact', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // if (!res.ok) throw new Error('send_failed')

  await new Promise((resolve) => setTimeout(resolve, 900))

  return { ok: true }
}
