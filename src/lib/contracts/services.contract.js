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
  proteccionCabina: { hero: { title: '' } },
  cambioPisos: { hero: { title: '' } },
  reclinaciones: { hero: { title: '' } },
  fundas: { hero: { title: '' } },
  literas: { hero: { title: '' } },
  tapiceria: { hero: { title: '' } },
  equipamientoMarcaTabs: [],
  banquetasCategories: [],
  butacasCategories: [],
  accesoriosCategories: [],
  tapiceriaCategories: [],
}
