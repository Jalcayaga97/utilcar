/** Validaciones UX editoriales (warnings, no bloquean publicación). */

const PORTFOLIO_DESCRIPTION_MAX = 220

export function missingImageAsset(value) {
  return Boolean(value?.asset?._ref || value?.asset?._id)
}

export function heroImageWarning(Rule) {
  return Rule.custom((value) => {
    if (!missingImageAsset(value)) {
      return 'Sin imagen: el sitio usará la foto hero local por defecto.'
    }
    return true
  }).warning()
}

export function heroPrimaryCtaWarning(Rule) {
  return Rule.custom((value) => {
    if (!value) {
      return 'CTA primario vacío: el sitio usará "Solicitar cotización" por defecto.'
    }
    const label = String(value.label ?? '').trim()
    const path = String(value.to ?? value.path ?? '').trim()
    if (label && !path) {
      return 'Falta la ruta del botón primario (ej. /contacto).'
    }
    if (!label && path) {
      return 'Falta el texto del botón primario.'
    }
    if (!label && !path) {
      return 'CTA primario vacío: el sitio usará valores globales por defecto.'
    }
    return true
  }).warning()
}

export function heroSecondaryCtaWarning(Rule) {
  return Rule.custom((value) => {
    if (!value) return true
    const label = String(value.label ?? '').trim()
    const path = String(value.to ?? value.path ?? '').trim()
    if (label && !path) {
      return 'Falta la ruta del enlace secundario.'
    }
    if (!label && path) {
      return 'Falta el texto del enlace secundario.'
    }
    return true
  }).warning()
}

export function portfolioCategoryWarning(Rule) {
  return Rule.custom((value) => {
    if (!String(value ?? '').trim()) {
      return 'Sin categoría: la tarjeta mostrará la categoría vacía en el sitio.'
    }
    return true
  }).warning()
}

export function portfolioItemImageWarning(Rule) {
  return Rule.custom((value) => {
    if (!missingImageAsset(value)) {
      return 'Sin imagen: la tarjeta usará un placeholder visual.'
    }
    return true
  }).warning()
}

export function portfolioDescriptionLengthWarning(Rule) {
  return Rule.custom((value) => {
    const text = String(value ?? '').trim()
    const max = 220
    if (text.length > max) {
      return `Descripción larga (${text.length} caracteres). Recomendado: máximo ${max}.`
    }
    return true
  }).warning()
}

export function heroTitleLengthWarning(Rule) {
  return Rule.custom((value) => {
    const text = String(value ?? '').trim()
    if (text.length > 80) {
      return `Título largo (${text.length} caracteres). Recomendado: máximo 80.`
    }
    return true
  }).warning()
}

export { PORTFOLIO_DESCRIPTION_MAX }
