/**
 * Variables de entorno Vite (prefijo VITE_).
 * Valores por defecto alineados con producción Utilcar.
 */

function readEnv(key, fallback) {
  const value = import.meta.env[key]
  if (value === undefined || value === '') return fallback
  return value
}

export const ENV = {
  siteUrl: readEnv('VITE_SITE_URL', 'https://www.utilcar.cl').replace(/\/$/, ''),
  whatsappNumber: readEnv('VITE_WHATSAPP_NUMBER', '56942868395'),
  contactEmail: readEnv('VITE_CONTACT_EMAIL', 'contacto@utilcar.cl'),
}

export function whatsappUrlFromNumber(number) {
  const digits = String(number).replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
