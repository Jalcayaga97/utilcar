import { ENV, whatsappUrlFromNumber } from '@/constants/env'
import { SITE } from '@/constants/site'

function safeString(value, fallback = '') {
  if (value == null) return fallback
  const s = String(value).trim()
  return s || fallback
}

function toTelHref(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return digits ? `tel:+${digits.replace(/^\+/, '')}` : ''
}

function normalizePhoneDisplay(phone) {
  const raw = safeString(phone)
  if (!raw) return ''
  if (raw.startsWith('+')) return raw
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('56')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
  }
  return raw
}

function normalizeOpeningHoursLines(raw) {
  if (!Array.isArray(raw) || !raw.length) return null
  const lines = raw
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim()
      if (entry && typeof entry === 'object') {
        const label = safeString(entry.label ?? entry.title)
        const value = safeString(entry.value ?? entry.hours ?? entry.text)
        if (label && value) return `${label}: ${value}`
        return label || value
      }
      return ''
    })
    .filter(Boolean)
  return lines.length ? lines : null
}

function normalizeSocialLinks(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => ({
      platform: safeString(item?.platform ?? item?.name),
      url: safeString(item?.url),
    }))
    .filter((item) => item.url)
}

function urlFromSocialLinks(links, platformName) {
  const match = (links ?? []).find(
    (item) => safeString(item?.platform).toLowerCase() === platformName.toLowerCase(),
  )
  return safeString(match?.url)
}

/**
 * Correo destino del formulario de contacto — siteSettings.contactEmail.
 */
export function resolveContactFormEmail(raw) {
  const cms = safeString(raw?.contactEmail)
  if (cms) return cms
  return safeString(raw?.company?.primaryEmail, ENV.contactEmail)
}

/**
 * Datos corporativos — siteSettings.company con fallback SITE/ENV.
 */
export function buildCompanyInfo(raw) {
  const company = raw?.company ?? {}
  const hasCmsCompany = Boolean(
    company.legalName ||
      company.phone ||
      company.primaryEmail ||
      company.mapsEmbedQuery,
  )

  const primaryEmail = safeString(company.primaryEmail, SITE.email || ENV.contactEmail)
  const secondaryEmail = safeString(company.secondaryEmail, SITE.emails?.[1] ?? '')
  const tertiaryEmail = safeString(company.tertiaryEmail, '')
  const emails = [primaryEmail, secondaryEmail, tertiaryEmail]
    .filter(Boolean)
    .filter((email, index, arr) => arr.indexOf(email) === index)

  const phoneDisplay = normalizePhoneDisplay(company.phone) || SITE.phoneDisplay
  const phoneTel = company.phone ? toTelHref(company.phone) : SITE.phoneTel

  const secondaryPhoneDisplay = normalizePhoneDisplay(company.secondaryPhone)
  const secondaryPhoneTel = company.secondaryPhone ? toTelHref(company.secondaryPhone) : ''

  const whatsappNumber = safeString(company.whatsappNumber, SITE.whatsapp || ENV.whatsappNumber)
  const whatsappUrl = whatsappUrlFromNumber(whatsappNumber)

  const addressStreet = safeString(company.addressStreet, SITE.addressStreet)
  const addressCity = safeString(company.addressCity, SITE.addressCity)
  const addressFull =
    safeString(company.addressFull) ||
    [addressStreet, addressCity].filter(Boolean).join(', ') ||
    SITE.address

  const openingHoursLines =
    normalizeOpeningHoursLines(company.openingHours) ?? [
      'Lunes a viernes',
      'Horario comercial',
    ]

  const mapsEmbedQuery = safeString(company.mapsEmbedQuery, SITE.mapsQuery)

  const socialLinks = normalizeSocialLinks(company.socialLinks)
  const instagramUrl =
    safeString(company.instagramUrl) || urlFromSocialLinks(socialLinks, 'instagram')
  const facebookUrl =
    safeString(company.facebookUrl) || urlFromSocialLinks(socialLinks, 'facebook')

  return {
    legalName: safeString(company.legalName, SITE.legalName),
    phone: phoneDisplay,
    phoneDisplay,
    phoneTel,
    secondaryPhone: secondaryPhoneDisplay,
    secondaryPhoneTel,
    whatsappNumber,
    whatsappUrl,
    primaryEmail,
    secondaryEmail,
    emails,
    email: primaryEmail,
    addressStreet,
    addressCity,
    addressFull,
    metro: SITE.metro,
    geo: SITE.geo,
    addressLocality: SITE.addressLocality,
    addressRegion: SITE.addressRegion,
    addressCountry: SITE.addressCountry,
    openingHoursLines,
    openingHoursSpecification: SITE.openingHours,
    mapsEmbedQuery,
    socialLinks,
    instagramUrl,
    facebookUrl,
    source: hasCmsCompany ? 'cms' : 'legacy',
  }
}

export function buildCompanyInfoFromSite() {
  return buildCompanyInfo(null)
}
