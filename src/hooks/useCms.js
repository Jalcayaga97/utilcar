import { useCallback, useMemo } from 'react'
import { useCmsData } from '@/hooks/useCmsData'
import {
  getEspecialidades,
  getHomePortfolioCards,
  getLocalHomePortfolioCards,
} from '@/lib/cms/home.adapter'
import {
  getServices,
  getHighlights,
  getServiceLinks,
  getServicePaths,
  getMainNavLinks,
  getServiceCtaDefaults,
  getGlobalServiceCta,
  getCtaButtonLabels,
  getTalleresMovilesContent,
  getVentanasLunetasContent,
  getEquipamientoEscolarContent,
  getBanquetasContent,
  getButacasContent,
  getAccesoriosContent,
  getEquipamientoMarcaTabs,
  getBanquetasCategories,
  getButacasCategories,
  getAccesoriosCategories,
  getServicePageDisplay,
} from '@/lib/cms/services.adapter'
import {
  getWorkContent,
  getTrabajosPreview,
  getTrabajosPageHero,
  getWorkBundle,
  getWorkPageDisplay,
} from '@/lib/cms/work.adapter'
import { getAboutPageDisplay } from '@/lib/cms/about.adapter'
import { getContactContent, getContactPageDisplay } from '@/lib/cms/contact.adapter'
import { getCompanyInfo, getContactFormEmail, getLocalCompanyInfo } from '@/lib/cms/company.adapter'
import { ENV } from '@/constants/env'
import {
  getValidatedLocalServicesBundle,
  getValidatedLocalEspecialidades,
  getValidatedLocalWorkBundle,
  getValidatedLocalContactContent,
  getValidatedLocalAboutContent,
} from '@/lib/cms/localContent'

export const EMPTY_ARRAY = Object.freeze([])

const LOCAL_SERVICES_BUNDLE = getValidatedLocalServicesBundle()
const LOCAL_WORK_BUNDLE = getValidatedLocalWorkBundle()
const LOCAL_CONTACT = getValidatedLocalContactContent()
const LOCAL_COMPANY = getLocalCompanyInfo()

function useCmsPrimitive(localValue, fetcher, resetKey = null) {
  const { data, isLoading, isError } = useCmsData(localValue, fetcher, resetKey)
  return useMemo(
    () => ({
      value: isLoading ? null : (data ?? localValue),
      isLoading,
      isError,
    }),
    [data, isLoading, isError, localValue],
  )
}

export function useEspecialidades() {
  const local = useMemo(() => getValidatedLocalEspecialidades(), [])
  const fetcher = useCallback(() => getEspecialidades(), [])
  const { value, isLoading } = useCmsPrimitive(local, fetcher)
  return isLoading ? EMPTY_ARRAY : value
}

export function useHomePortfolioCards() {
  const local = useMemo(() => getLocalHomePortfolioCards(), [])
  const fetcher = useCallback(() => getHomePortfolioCards(), [])
  const { value, isLoading } = useCmsPrimitive(local, fetcher)
  return isLoading ? EMPTY_ARRAY : value
}

export function useServices() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.services, getServices)
  return isLoading ? EMPTY_ARRAY : value
}

export function useHighlights() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.highlights, getHighlights)
  return isLoading ? EMPTY_ARRAY : value
}

export function useServiceLinks() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.serviceLinks, getServiceLinks)
  return isLoading ? EMPTY_ARRAY : value
}

export function useMainNavLinks() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.mainNavLinks, getMainNavLinks)
  return isLoading ? EMPTY_ARRAY : value
}

export function useServicePaths() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.servicePaths, getServicePaths)
  return isLoading ? EMPTY_ARRAY : value
}

export function useServiceCtaDefaults() {
  const local = LOCAL_SERVICES_BUNDLE.serviceCtaDefaults
  const { value, isLoading } = useCmsPrimitive(local, getServiceCtaDefaults)
  return isLoading ? local : value
}

export function useGlobalServiceCta() {
  const local = LOCAL_SERVICES_BUNDLE.serviceCtaDefaults
  const { value, isLoading } = useCmsPrimitive(local, getGlobalServiceCta)
  return isLoading ? local : value
}

export function useCtaButtonLabels() {
  const local = LOCAL_SERVICES_BUNDLE.ctaButtonLabels
  const { value, isLoading } = useCmsPrimitive(local, getCtaButtonLabels)
  return isLoading ? local : value
}

export function useTalleresMovilesContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.talleresMoviles, getTalleresMovilesContent)
  return isLoading ? {} : value
}

export function useVentanasLunetasContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.ventanasLunetas, getVentanasLunetasContent)
  return isLoading ? {} : value
}

export function useEquipamientoEscolarContent() {
  const { value, isLoading } = useCmsPrimitive(
    LOCAL_SERVICES_BUNDLE.equipamientoEscolar,
    getEquipamientoEscolarContent,
  )
  return isLoading ? {} : value
}

export function useBanquetasContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.banquetas, getBanquetasContent)
  return isLoading ? {} : value
}

export function useButacasContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.butacas, getButacasContent)
  return isLoading ? {} : value
}

export function useAccesoriosContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.accesorios, getAccesoriosContent)
  return isLoading ? {} : value
}

export function useEquipamientoMarcaTabs() {
  const { value, isLoading } = useCmsPrimitive(
    LOCAL_SERVICES_BUNDLE.equipamientoMarcaTabs,
    getEquipamientoMarcaTabs,
  )
  return isLoading ? EMPTY_ARRAY : value
}

export function useBanquetasCategories() {
  const { value, isLoading } = useCmsPrimitive(
    LOCAL_SERVICES_BUNDLE.banquetasCategories,
    getBanquetasCategories,
  )
  return isLoading ? EMPTY_ARRAY : value
}

export function useButacasCategories() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_SERVICES_BUNDLE.butacasCategories, getButacasCategories)
  return isLoading ? EMPTY_ARRAY : value
}

export function useAccesoriosCategories() {
  const { value, isLoading } = useCmsPrimitive(
    LOCAL_SERVICES_BUNDLE.accesoriosCategories,
    getAccesoriosCategories,
  )
  return isLoading ? EMPTY_ARRAY : value
}

export function useWorkContent() {
  const local = LOCAL_WORK_BUNDLE.workContent
  const { value, isLoading } = useCmsPrimitive(local, getWorkContent)
  return isLoading ? local : value
}

export function useTrabajosPreview() {
  const local = LOCAL_WORK_BUNDLE.workContent.preview
  const { value, isLoading } = useCmsPrimitive(local, getTrabajosPreview)
  return isLoading ? EMPTY_ARRAY : value
}

export function useTrabajosPageHero() {
  const local = LOCAL_WORK_BUNDLE.trabajosPageHero
  const { value, isLoading } = useCmsPrimitive(local, getTrabajosPageHero)
  return isLoading ? null : value
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
  const { value, isLoading } = useCmsPrimitive(empty, fetcher)
  return isLoading ? empty : value
}

function localWorkPageDisplay() {
  return {
    content: LOCAL_WORK_BUNDLE.workContent.page,
    heroImage: LOCAL_WORK_BUNDLE.trabajosPageHero,
    seo: null,
    source: 'legacy',
    isLoading: false,
  }
}

export function useWorkPageDisplay() {
  const local = useMemo(() => localWorkPageDisplay(), [])
  const loadingSnapshot = useMemo(() => ({ ...local, isLoading: true }), [local])
  const fetcher = useCallback(() => getWorkPageDisplay(), [])
  const { data, isLoading } = useCmsData(local, fetcher)

  return useMemo(() => {
    if (isLoading) return loadingSnapshot
    if (!data) return { ...local, isLoading: false }
    return { ...data, isLoading: false }
  }, [isLoading, loadingSnapshot, local, data])
}

function localServicePageDisplay(pageKey) {
  const fieldMap = {
    'talleres-moviles': 'talleresMoviles',
    'ventanas-lunetas': 'ventanasLunetas',
    'equipamiento-escolar': 'equipamientoEscolar',
    banquetas: 'banquetas',
    butacas: 'butacas',
    accesorios: 'accesorios',
    'proteccion-cabina': 'proteccionCabina',
    'cambio-pisos': 'cambioPisos',
    reclinaciones: 'reclinaciones',
    fundas: 'fundas',
    literas: 'literas',
    tapiceria: 'tapiceria',
  }
  const field = fieldMap[pageKey]
  const tabsMap = {
    'equipamiento-escolar': LOCAL_SERVICES_BUNDLE.equipamientoMarcaTabs,
    banquetas: LOCAL_SERVICES_BUNDLE.banquetasCategories,
    butacas: LOCAL_SERVICES_BUNDLE.butacasCategories,
    accesorios: LOCAL_SERVICES_BUNDLE.accesoriosCategories,
    tapiceria: LOCAL_SERVICES_BUNDLE.tapiceriaCategories,
  }
  return {
    content: field ? LOCAL_SERVICES_BUNDLE[field] : {},
    heroImage: null,
    showcaseImages: EMPTY_ARRAY,
    portfolioProjects: EMPTY_ARRAY,
    portfolioSource: 'none',
    tabs: tabsMap[pageKey] ?? EMPTY_ARRAY,
    seo: null,
    source: 'legacy',
    isLoading: false,
  }
}

export function useServicePageDisplay(pageKey) {
  const local = useMemo(() => localServicePageDisplay(pageKey), [pageKey])
  const loadingSnapshot = useMemo(() => ({ ...local, isLoading: true }), [local])
  const fetcher = useCallback(() => getServicePageDisplay(pageKey), [pageKey])
  const { data, isLoading } = useCmsData(local, fetcher, pageKey)

  return useMemo(() => {
    if (isLoading) return loadingSnapshot
    if (!data) return { ...local, isLoading: false }
    return { ...data, isLoading: false }
  }, [isLoading, loadingSnapshot, local, data])
}

export function useContactContent() {
  const { value, isLoading } = useCmsPrimitive(LOCAL_CONTACT, getContactContent)
  return isLoading ? LOCAL_CONTACT : value
}

export function useAboutPageDisplay() {
  const local = useMemo(
    () => ({
      content: getValidatedLocalAboutContent(),
      heroImage: null,
      seo: null,
      source: 'legacy',
      isLoading: false,
    }),
    [],
  )
  const loadingSnapshot = useMemo(() => ({ ...local, isLoading: true }), [local])
  const fetcher = useCallback(() => getAboutPageDisplay(), [])
  const { data, isLoading } = useCmsData(local, fetcher)

  return useMemo(() => {
    if (isLoading) return loadingSnapshot
    if (!data) return { ...local, isLoading: false }
    return { ...data, isLoading: false }
  }, [isLoading, loadingSnapshot, local, data])
}

export function useContactPageDisplay() {
  const local = useMemo(
    () => ({
      content: LOCAL_CONTACT,
      heroImage: null,
      seo: null,
      source: 'legacy',
      isLoading: false,
    }),
    [],
  )
  const loadingSnapshot = useMemo(() => ({ ...local, isLoading: true }), [local])
  const fetcher = useCallback(() => getContactPageDisplay(), [])
  const { data, isLoading } = useCmsData(local, fetcher)

  return useMemo(() => {
    if (isLoading) return loadingSnapshot
    if (!data) return { ...local, isLoading: false }
    return { ...data, isLoading: false }
  }, [isLoading, loadingSnapshot, local, data])
}

/** @deprecated Usar useContactPageDisplay */
export function useContactDisplay() {
  return useContactPageDisplay()
}

export function useCompanyInfo() {
  const fetcher = useCallback(() => getCompanyInfo(), [])
  const { value, isLoading } = useCmsPrimitive(LOCAL_COMPANY, fetcher)
  return useMemo(() => (isLoading ? LOCAL_COMPANY : value), [isLoading, value])
}

export function useContactFormEmail() {
  const local = ENV.contactEmail
  const fetcher = useCallback(() => getContactFormEmail(), [])
  const { value, isLoading } = useCmsPrimitive(local, fetcher)
  return isLoading ? local : value
}
