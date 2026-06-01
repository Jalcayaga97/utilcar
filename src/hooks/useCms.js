import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  EMPTY_HOME_EXTENSIONS,
  getHomeContent,
  getEspecialidades,
} from '@/lib/cms/home.adapter'
import {
  getServices,
  getHighlights,
  getServiceLinks,
  getServicePaths,
  getMainNavLinks,
  getServiceCtaDefaults,
  getCtaButtonLabels,
  getTalleresMovilesContent,
  getVentanasLunetasContent,
  getEquipamientoEscolarContent,
  getBanquetasContent,
  getButacasContent,
  getAccesoriosContent,
  getVentanasBrands,
  getBanquetasCategories,
  getAccesoriosCategories,
} from '@/lib/cms/services.adapter'
import { getWorkContent, getTrabajosPreview, getTrabajosPageHero, getWorkBundle } from '@/lib/cms/work.adapter'
import { getContactContent, getContactDisplay } from '@/lib/cms/contact.adapter'
import { getServicePageDisplay } from '@/lib/cms/services.adapter'
import {
  getValidatedLocalServicesBundle,
  getValidatedLocalHomeContent,
  getValidatedLocalEspecialidades,
  getValidatedLocalWorkBundle,
  getValidatedLocalContactContent,
} from '@/lib/cms/localContent'
import { isSanityEnabled } from '@/lib/cms/config'

/**
 * Hydration-safe: primer render SIEMPRE con contenido local validado.
 * Sanity solo actúa como enhancement después del mount del cliente.
 */
function useCmsData(localValue, fetcher) {
  const [data, setData] = useState(localValue)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!mounted || !isSanityEnabled()) return

    let cancelled = false
    fetcher().then((next) => {
      if (!cancelled && next != null) setData(next)
    })

    return () => {
      cancelled = true
    }
  }, [mounted, fetcher])

  return data
}

const localServices = () => getValidatedLocalServicesBundle()
const localWork = () => getValidatedLocalWorkBundle()

function getLocalHomeContentWithExtensions() {
  return {
    ...getValidatedLocalHomeContent(),
    extensions: EMPTY_HOME_EXTENSIONS,
  }
}

export function useHomeContent() {
  return useCmsData(getLocalHomeContentWithExtensions(), getHomeContent)
}

export function useEspecialidades() {
  return useCmsData(getValidatedLocalEspecialidades(), getEspecialidades)
}

export function useServices() {
  return useCmsData(localServices().services, getServices)
}

export function useHighlights() {
  return useCmsData(localServices().highlights, getHighlights)
}

export function useServiceLinks() {
  return useCmsData(localServices().serviceLinks, getServiceLinks)
}

export function useMainNavLinks() {
  return useCmsData(localServices().mainNavLinks, getMainNavLinks)
}

export function useServicePaths() {
  return useCmsData(localServices().servicePaths, getServicePaths)
}

export function useServiceCtaDefaults() {
  return useCmsData(localServices().serviceCtaDefaults, getServiceCtaDefaults)
}

export function useCtaButtonLabels() {
  return useCmsData(localServices().ctaButtonLabels, getCtaButtonLabels)
}

export function useTalleresMovilesContent() {
  return useCmsData(localServices().talleresMoviles, getTalleresMovilesContent)
}

export function useVentanasLunetasContent() {
  return useCmsData(localServices().ventanasLunetas, getVentanasLunetasContent)
}

export function useEquipamientoEscolarContent() {
  return useCmsData(localServices().equipamientoEscolar, getEquipamientoEscolarContent)
}

export function useBanquetasContent() {
  return useCmsData(localServices().banquetas, getBanquetasContent)
}

export function useButacasContent() {
  return useCmsData(localServices().butacas, getButacasContent)
}

export function useAccesoriosContent() {
  return useCmsData(localServices().accesorios, getAccesoriosContent)
}

export function useVentanasBrands() {
  return useCmsData(localServices().ventanasBrands, getVentanasBrands)
}

export function useBanquetasCategories() {
  return useCmsData(localServices().banquetasCategories, getBanquetasCategories)
}

export function useAccesoriosCategories() {
  return useCmsData(localServices().accesoriosCategories, getAccesoriosCategories)
}

export function useWorkContent() {
  return useCmsData(localWork().workContent, getWorkContent)
}

export function useTrabajosPreview() {
  return useCmsData(localWork().workContent.preview, getTrabajosPreview)
}

export function useTrabajosPageHero() {
  return useCmsData(localWork().trabajosPageHero, getTrabajosPageHero)
}

export function useWorkBundleMeta() {
  const empty = useMemo(() => ({ _workSource: 'legacy' }), [])
  const fetcher = useCallback(async () => {
    const bundle = await getWorkBundle()
    return {
      _workSource: bundle._workSource ?? 'legacy',
      extensions: bundle.extensions ?? {},
    }
  }, [])
  return useCmsData(empty, fetcher)
}

function localServicePageDisplay(pageKey) {
  const bundle = localServices()
  const fieldMap = {
    'talleres-moviles': 'talleresMoviles',
    'ventanas-lunetas': 'ventanasLunetas',
    'equipamiento-escolar': 'equipamientoEscolar',
    banquetas: 'banquetas',
    butacas: 'butacas',
    accesorios: 'accesorios',
  }
  const field = fieldMap[pageKey]
  return {
    content: field ? bundle[field] : {},
    heroImage: null,
    galleryImages: null,
    source: 'legacy',
  }
}

export function useServicePageDisplay(pageKey) {
  const local = useMemo(() => localServicePageDisplay(pageKey), [pageKey])
  const fetcher = useCallback(() => getServicePageDisplay(pageKey), [pageKey])
  return useCmsData(local, fetcher)
}

export function useContactContent() {
  return useCmsData(getValidatedLocalContactContent(), getContactContent)
}

export function useContactDisplay() {
  const local = useMemo(
    () => ({
      content: getValidatedLocalContactContent(),
      heroImage: null,
      source: 'legacy',
    }),
    [],
  )
  const fetcher = useCallback(() => getContactDisplay(), [])
  return useCmsData(local, fetcher)
}
