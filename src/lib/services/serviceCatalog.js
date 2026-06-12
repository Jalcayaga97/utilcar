/**
 * Catálogo maestro de servicios — orden y rutas desde SERVICE_LINKS.
 * Navbar, Footer y Home comparten la misma fuente vía useServiceLinks + useServices.
 */

import { SERVICE_LINKS } from '@/content/services'

export const EXPECTED_SERVICE_COUNT = 12

export const CONTACT_FORM_CUSTOM_PROJECT_LABEL = 'Proyecto personalizado'

/** Slug de página (pageKey) desde path de SERVICE_LINKS. */
export function servicePathToPageKey(path) {
  return String(path ?? '').replace(/^\//, '')
}

/** Pestañas Trabajos — siempre las 12 categorías en orden Navbar. */
export function buildWorkCategoryFilters(legacyFilters = []) {
  const legacyAll = legacyFilters.find((f) => f.id === 'all') ?? { id: 'all', label: 'Todos' }
  const tabs = SERVICE_LINKS.map((link) => ({
    id: servicePathToPageKey(link.path),
    label: link.label,
  }))
  return [legacyAll, ...tabs]
}

/** Opciones del select «Servicio de interés» en formulario de contacto. */
export function buildContactFormServiceOptions() {
  return [...SERVICE_LINKS.map((link) => link.label), CONTACT_FORM_CUSTOM_PROJECT_LABEL]
}

/**
 * Construye tarjetas MainServices: orden = serviceLinks, contenido = catálogo por path.
 * Los ítems CMS opcionales enriquecen imagen/descripción por path.
 *
 * @param {{
 *   serviceLinks: { label: string, path: string }[],
 *   services: object[],
 *   cmsByPath?: Record<string, object>,
 *   cardLinkLabel?: string,
 * }} params
 */
export function buildMainServiceCards({
  serviceLinks,
  services,
  cmsByPath = {},
  cardLinkLabel = 'Ver más',
}) {
  const catalogByPath = new Map((services ?? []).map((service) => [service.path, service]))

  return (serviceLinks ?? [])
    .map((link) => {
      const base = catalogByPath.get(link.path)
      if (!base) return null

      const cms = cmsByPath[link.path]
      return {
        id: base.id,
        title: link.label || base.title,
        description: cms?.description || base.description,
        path: link.path,
        imageAlt: cms?.imageAlt || base.imageAlt || link.label,
        icon: cms?.icon ?? base.icon,
        imageUrl: cms?.imageUrl ?? null,
        cardLinkLabel: cms?.cardLinkLabel ?? cardLinkLabel,
      }
    })
    .filter(Boolean)
}

/** Verifica orden alfabético por label (locale es). */
export function isAlphabeticalServiceOrder(serviceLinks) {
  const labels = (serviceLinks ?? []).map((link) => link.label)
  const sorted = [...labels].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
  return labels.length > 0 && labels.every((label, index) => label === sorted[index])
}

/** Paths únicos en serviceLinks. */
export function uniqueServicePaths(serviceLinks) {
  return [...new Set((serviceLinks ?? []).map((link) => link.path).filter(Boolean))]
}
