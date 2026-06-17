function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  const border = isLast ? '' : 'border-bottom:1px solid #ececea;'
  return `
    <tr>
      <td style="padding:16px 28px 6px 28px;${border}">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b6b68;text-transform:uppercase;letter-spacing:0.06em;line-height:1.4;">
          ${escapeHtml(label)}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 16px 28px;${border}">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a18;line-height:1.55;">
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
      value: `<a href="mailto:${escapeHtml(data.mail)}" style="color:#1a1a18;text-decoration:underline;">${escapeHtml(data.mail)}</a>`,
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
  <title>Nuevo contacto recibido</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f3;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f3;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid #e0e0dc;border-radius:8px;">
          <tr>
            <td style="padding:28px 28px 8px 28px;border-bottom:1px solid #ececea;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b6b68;text-transform:uppercase;letter-spacing:0.08em;">
                Utilcar Conversiones
              </p>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#1a1a18;line-height:1.3;">
                Nuevo contacto recibido
              </h1>
            </td>
          </tr>
          ${fieldRows}
          <tr>
            <td style="padding:20px 28px 28px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8a86;line-height:1.5;">
                Mensaje enviado desde el formulario de contacto de utilcar.cl
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
