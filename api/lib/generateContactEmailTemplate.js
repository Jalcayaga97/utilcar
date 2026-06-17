/**const SITE_URL = String(process.env.VITE_SITE_URL || 'https://www.utilcar.cl').replace(/\/$/, '')**/
const SITE_URL = 'https://utilcar.vercel.app'
const LOGO_URL = `${SITE_URL}/logo.jpg`
const LOGO_ALT = 'Utilcar Conversiones'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

function formatMultilineHtml(value) {
  return escapeHtml(value).replace(/\n/g, '<br>')
}

/** ISO / string → DD-MM-YYYY HH:mm (America/Santiago) */
export function formatContactSubmittedAt(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return String(isoString ?? '')

  const parts = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')}-${get('month')}-${get('year')} ${get('hour')}:${get('minute')}`
}

function renderField(label, value, { isLast = false } = {}) {
  const divider = isLast ? '' : 'border-bottom:1px solid #eef1f6;'

  return `
    <tr>
      <td style="padding:20px 32px;${divider}">
        <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;line-height:1.4;">
          ${escapeHtml(label)}
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1e293b;line-height:1.6;">
          ${value}
        </p>
      </td>
    </tr>`
}

/**
 * Plantilla HTML compatible con clientes de correo (tablas + estilos inline).
 *
 * @param {{ nombre: string, empresa?: string, mail: string, telefono?: string, servicio: string, consulta: string, submittedAt: string }} data
 */
export function generateContactEmailTemplate(data) {
  const fields = [
    { label: 'Nombre', value: formatMultilineHtml(data.nombre) },
    { label: 'Empresa', value: formatMultilineHtml(data.empresa || '—') },
    {
      label: 'Correo',
      value: `<a href="mailto:${escapeHtml(data.mail)}" style="color:#1e293b;text-decoration:underline;">${escapeHtml(data.mail)}</a>`,
    },
    { label: 'Teléfono', value: formatMultilineHtml(data.telefono || '—') },
    { label: 'Servicio', value: formatMultilineHtml(data.servicio) },
    { label: 'Consulta', value: formatMultilineHtml(data.consulta) },
    {
      label: 'Fecha',
      value: escapeHtml(formatContactSubmittedAt(data.submittedAt)),
      isLast: true,
    },
  ]

  const fieldRows = fields
    .map((field, index) =>
      renderField(field.label, field.value, { isLast: field.isLast ?? index === fields.length - 1 }),
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Nueva consulta recibida</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fb;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:40px 20px 48px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:0 0 28px 0;">
              <img
                src="${escapeAttr(LOGO_URL)}"
                alt="${escapeAttr(LOGO_ALT)}"
                width="140"
                style="display:block;width:140px;max-width:140px;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;"
              />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 32px 0;">
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#1e293b;line-height:1.35;letter-spacing:-0.02em;">
                Nueva consulta recibida
              </h1>
              <p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#64748b;line-height:1.5;">
                Un visitante completó el formulario de contacto en su sitio web.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border:1px solid #e8ecf2;border-radius:12px;overflow:hidden;">
                ${fieldRows}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 16px 0 16px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#94a3b8;line-height:1.5;">
                <a href="${escapeAttr(SITE_URL)}" style="color:#64748b;text-decoration:none;font-weight:bold;">utilcar.cl</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
