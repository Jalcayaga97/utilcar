/**
 * Contrato canónico Servicios — debe coincidir con ServicesBundleSchema (Zod).
 */
export const ServiceItemContract = {
  id: '',
  title: '',
  description: '',
  path: '',
  imageAlt: '',
  icon: null,
}

export const ServicesBundleContract = {
  services: [],
  highlights: [],
  serviceLinks: [],
  mainNavLinks: [],
  servicePaths: [],
  serviceCtaDefaults: {
    title: '',
    description: '',
    primaryLabel: '',
    primaryTo: '',
  },
  ctaButtonLabels: {
    primaryLabel: '',
    primaryTo: '',
    whatsAppLabel: '',
  },
  talleresMoviles: { hero: { title: '' } },
  ventanasLunetas: { hero: { title: '' } },
  equipamientoEscolar: { hero: { title: '' } },
  banquetas: { hero: { title: '' } },
  butacas: { hero: { title: '' } },
  accesorios: { hero: { title: '' } },
  ventanasBrands: [],
  banquetasCategories: [],
  accesoriosCategories: [],
}
