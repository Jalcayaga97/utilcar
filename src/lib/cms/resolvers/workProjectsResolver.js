import { isSanityEnabled } from '@/lib/cms/config'
import {
  SERVICE_CATEGORY_KEYS,
  labelForServiceCategory,
} from '@/lib/cms/constants/serviceCategories'
import {
  normalizeWorkProject,
  normalizeWorkProjectList,
} from '@/lib/cms/contracts/workProjectContract'
import { getValidatedLocalWorkBundle } from '@/lib/cms/localContent'
import { pickImageUrl } from '@/lib/cms/assets/resolveImage'
import { logServicePortfolioAudit } from '@/lib/cms/servicePageAuditLog'
import { SERVICE_PORTFOLIO_DEFAULT_TITLE } from '@/constants/servicePortfolio'

/**
 * Filtros dinámicos para Trabajos — solo categorías con al menos un proyecto visible.
 * @param {object[]} projects
 * @param {object[]} [legacyFilters]
 */
export function buildWorkFiltersFromProjects(projects, legacyFilters = []) {
  const visible = normalizeWorkProjectList(projects)
  const legacyAll = legacyFilters.find((f) => f.id === 'all') ?? { id: 'all', label: 'Todos' }
  const filters = [legacyAll]

  for (const key of SERVICE_CATEGORY_KEYS) {
    const count = visible.filter((p) => p.categoryId === key).length
    if (!count) continue
    const legacy = legacyFilters.find((f) => f.id === key)
    filters.push({
      id: key,
      label: legacy?.label ?? labelForServiceCategory(key),
      order: filters.length,
    })
  }

  return filters
}

/**
 * Tarjetas portfolio UI (Trabajos / Home).
 * @param {object} project
 * @param {object | null} [legacyItem]
 */
export function mapWorkProjectToPortfolioCard(project, legacyItem = null) {
  if (!project) return null
  const legacyImage =
    typeof legacyItem?.image === 'string'
      ? legacyItem.image
      : pickImageUrl(legacyItem?.image) ?? null
  const imageUrl =
    project.imageUrl ??
    project.image ??
    legacyImage ??
    null

  return {
    id: project.id,
    title: project.title,
    category: project.category,
    categoryId: project.categoryId,
    description: project.description,
    client: project.client,
    vehicle: project.vehicle,
    image: imageUrl,
    imageUrl,
    imageAlt: project.imageAlt || legacyItem?.imageAlt || '',
    imageKey: legacyItem?.imageKey ?? null,
    gallery: project.gallery?.length ? project.gallery : legacyItem?.gallery ?? [],
    featured: project.featured,
  }
}

/**
 * @param {object[]} projects
 * @param {Map<string, object>} [legacyById]
 */
export function mapWorkProjectsToPortfolio(projects, legacyById = new Map()) {
  return normalizeWorkProjectList(projects)
    .map((project) => mapWorkProjectToPortfolioCard(project, legacyById.get(project.id)))
    .filter(Boolean)
}

function projectCategoryKey(project) {
  return String(project?.serviceCategory ?? project?.categoryId ?? '').trim()
}

/** Convierte ítem legacy de work.js al shape raw de workProject (solo si no está en CMS). */
export function legacyPortfolioItemToWorkProjectRaw(item) {
  if (!item?.id || !item?.title) return null

  const serviceCategory = projectCategoryKey(item)
  if (!serviceCategory) return null

  const imageSrc = typeof item.image === 'string' ? item.image : pickImageUrl(item.image)
  return {
    id: item.id,
    title: item.title,
    serviceCategory,
    description: item.description ?? '',
    client: item.client ?? '',
    vehicle: item.vehicle ?? '',
    visible: true,
    ...(imageSrc
      ? { image: { url: imageSrc, alt: item.imageAlt ?? item.title } }
      : {}),
  }
}

/**
 * Catálogo Proyectos CMS. Con Sanity activo: solo documentos CMS.
 * Sin Sanity: supplementa con legacy local (work.js).
 */
export function mergeWorkProjectCatalog(cmsRawList = []) {
  if (isSanityEnabled()) {
    return normalizeWorkProjectList(cmsRawList)
  }

  const cmsNormalized = normalizeWorkProjectList(cmsRawList)
  const cmsIds = new Set(cmsNormalized.map((project) => project.id))
  const legacyPortfolio = getValidatedLocalWorkBundle()?.workContent?.portfolio ?? []

  const supplementalRaw = legacyPortfolio
    .filter((item) => item?.id && !cmsIds.has(item.id))
    .map(legacyPortfolioItemToWorkProjectRaw)
    .filter(Boolean)

  return normalizeWorkProjectList([...(cmsRawList ?? []), ...supplementalRaw])
}

/**
 * Vista previa Home — proyectos con featured o homeVisible en Proyectos CMS.
 * @param {object[]} projects — catálogo normalizado o raw
 * @param {{ limit?: number, legacyPreview?: object[] }} [options]
 */
export function resolveHomeFeaturedProjects(projects, { limit = 4, legacyPreview = [] } = {}) {
  const normalized = normalizeWorkProjectList(projects)
  const flagged = normalized.filter((project) => project.featured || project.homeVisible)

  if (flagged.length) {
    const legacyPortfolio = getValidatedLocalWorkBundle()?.workContent?.portfolio ?? []
    const legacyById = new Map(legacyPortfolio.map((item) => [String(item?.id), item]))
    return mapWorkProjectsToPortfolio(flagged, legacyById).slice(0, limit)
  }

  if (!isSanityEnabled() && legacyPreview.length) {
    const byId = new Map(normalized.map((project) => [String(project.id), project]))
    return legacyPreview
      .map((item) => {
        const hit = byId.get(String(item.id))
        if (hit) return mapWorkProjectToPortfolioCard(hit)
        const raw = legacyPortfolioItemToWorkProjectRaw(item)
        return mapWorkProjectToPortfolioCard(normalizeWorkProject(raw))
      })
      .filter(Boolean)
      .slice(0, limit)
  }

  return []
}

function mergeProjectWithCatalog(project, byId, byRef) {
  const catalogHit =
    byId.get(project.id) ?? (project._id ? byRef.get(project._id) : null) ?? null
  if (!catalogHit) return project

  const imageUrl =
    project.imageUrl ??
    project.image ??
    catalogHit.imageUrl ??
    catalogHit.image ??
    null

  return {
    ...catalogHit,
    ...project,
    image: imageUrl,
    imageUrl,
    imageAlt: project.imageAlt || catalogHit.imageAlt,
    gallery: project.gallery?.length ? project.gallery : catalogHit.gallery,
  }
}

function mapWorkProjectsInEditorialOrder(entries, catalog) {
  const normalizedCatalog = normalizeWorkProjectList(catalog)
  const byId = new Map(normalizedCatalog.map((project) => [project.id, project]))
  const byRef = new Map(
    normalizedCatalog.filter((project) => project._id).map((project) => [project._id, project]),
  )

  const cards = []
  for (const entry of entries ?? []) {
    let project = null
    if (entry && (entry.title || entry.projectId || entry.id)) {
      project = normalizeWorkProject(entry)
    } else if (entry?._ref) {
      project = byRef.get(entry._ref) ?? null
    }
    if (!project || project.visible === false) continue
    project = mergeProjectWithCatalog(project, byId, byRef)
    const legacyItem = getValidatedLocalWorkBundle()?.workContent?.portfolio?.find(
      (item) => String(item?.id) === String(project.id),
    )
    const card = mapWorkProjectToPortfolioCard(project, legacyItem ?? null)
    if (card) cards.push(card)
  }
  return cards
}

function mapPortfolioCardsByIds(ids, catalog) {
  const normalized = normalizeWorkProjectList(catalog)
  const byId = new Map(normalized.map((project) => [project.id, project]))
  const legacyPortfolio = getValidatedLocalWorkBundle()?.workContent?.portfolio ?? []
  const legacyById = new Map(legacyPortfolio.map((item) => [String(item?.id), item]))
  return (ids ?? [])
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map((project) => mapWorkProjectToPortfolioCard(project, legacyById.get(String(project.id)) ?? null))
}

/**
 * Home — Trabajos recientes: prioridad selectedProjects → featuredProjects (legacy) → flags.
 * @returns {{ projects: object[], source: 'cms-selected' | 'cms-featured-refs' | 'cms-featured-flags' | 'legacy-preview' | 'empty' }}
 */
export function resolveHomePortfolioDisplay(portfolioSection, catalog, options = {}) {
  const limit = Math.min(Math.max(1, portfolioSection?.previewCount ?? options.limit ?? 3), 12)
  const normalizedCatalog = normalizeWorkProjectList(catalog)

  const selectedRaws = portfolioSection?.selectedProjects ?? []
  if (selectedRaws.length > 0) {
    const selectedCards = mapWorkProjectsInEditorialOrder(selectedRaws, normalizedCatalog)
    if (selectedCards.length > 0) {
      return { projects: selectedCards.slice(0, limit), source: 'cms-selected' }
    }
  }

  const legacyIds = portfolioSection?.featuredProjectIds ?? []
  if (legacyIds.length > 0) {
    const legacyCards = mapPortfolioCardsByIds(legacyIds, normalizedCatalog)
    if (legacyCards.length > 0) {
      return { projects: legacyCards.slice(0, limit), source: 'cms-featured-refs' }
    }
  }

  const flagged = resolveHomeFeaturedProjects(normalizedCatalog, {
    limit,
    legacyPreview: options.legacyPreview ?? [],
  })
  if (flagged.length) {
    return { projects: flagged, source: 'cms-featured-flags' }
  }

  return { projects: [], source: 'empty' }
}

/** Proyectos por categoría de servicio (página de servicio). */
export function filterWorkProjectsByCategory(projects, pageKey) {
  const key = String(pageKey ?? '').trim()
  if (!key) return []

  return normalizeWorkProjectList(projects).filter((project) => projectCategoryKey(project) === key)
}

/**
 * Copy editorial del bloque Portfolio — fallbacks centralizados (no en páginas JSX).
 */
export function resolveServicePortfolioMeta(portfolioSection = null, legacyGalleryMeta = null) {
  return {
    eyebrow: portfolioSection?.eyebrow ?? legacyGalleryMeta?.eyebrow ?? '',
    title:
      portfolioSection?.title ??
      legacyGalleryMeta?.title ??
      SERVICE_PORTFOLIO_DEFAULT_TITLE,
    description: portfolioSection?.description ?? legacyGalleryMeta?.description ?? '',
  }
}

/**
 * Portfolio de página de servicio — exclusivamente workProject por categoría.
 * @returns {{ projects: object[], source: string, meta: { eyebrow, title, description } }}
 */
export function resolveServicePagePortfolio({
  pageKey,
  workProjects = [],
  portfolioSection = null,
  legacyGalleryMeta = null,
}) {
  const meta = resolveServicePortfolioMeta(portfolioSection, legacyGalleryMeta)

  const catalog = mergeWorkProjectCatalog(workProjects)
  const filtered = filterWorkProjectsByCategory(catalog, pageKey)
  const fromWork = mapWorkProjectsToPortfolio(filtered)

  logServicePortfolioAudit({
    pageKey,
    workProjectsFound: filtered.length,
    workProjectsInputCount: Array.isArray(workProjects) ? workProjects.length : 0,
    workProjectsInputIsArray: Array.isArray(workProjects),
    projectCount: fromWork.length,
    source: fromWork.length ? 'cms-projects' : 'none',
    projects: fromWork.map((p) => ({ id: p.id, title: p.title, hasImage: Boolean(p.image) })),
  })

  return {
    projects: fromWork,
    source: fromWork.length ? 'cms-projects' : 'none',
    meta,
  }
}

/** Log DEV unificado para portfolio de servicio. */
export function logServicePortfolio(pageKey, payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-portfolio]', {
    pageKey,
    projectCount: payload.projectCount ?? 0,
    source: payload.source ?? 'none',
    portfolioTitle: payload.portfolioTitle ?? '',
    portfolioDescription: payload.portfolioDescription ?? '',
    ...payload,
  })
}
