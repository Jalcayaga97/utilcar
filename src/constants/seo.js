import { SITE } from '@/constants/site'

/**
 * Metadatos SEO por ruta pública.
 * Títulos y descripciones únicos, keywords suaves (sin stuffing).
 */
export const PAGE_SEO = {
  home: {
    path: '/',
    title: 'Conversiones automotrices en Santiago',
    description:
      'Utilcar Conversiones: talleres móviles, ventanas para furgones, equipamiento escolar, banquetas para minibús y butacas. Fabricación e instalación en Santiago, Chile.',
    keywords:
      'conversiones automotrices Santiago, talleres móviles, equipamiento escolar, ventanas furgones, banquetas minibús',
  },
  'talleres-moviles': {
    path: '/talleres-moviles',
    title: 'Talleres móviles y conversiones en terreno',
    description:
      'Conversión de furgones y utilitarios en talleres móviles, bibliotecas y oficinas técnicas. Mobiliario, electricidad y terminaciones profesionales en Santiago.',
    keywords:
      'talleres móviles Santiago, conversión furgón taller, vehículo taller terreno',
  },
  'ventanas-lunetas': {
    path: '/ventanas-lunetas',
    title: 'Ventanas y lunetas para furgones',
    description:
      'Fabricación e instalación de ventanas corredizas y lunetas para furgones y minibuses. Toyota, Peugeot, Renault, Fiat, Citroën, Chevrolet y más marcas.',
    keywords:
      'ventanas furgones Santiago, lunetas minibús, ventanas corredizas utilitarios',
  },
  'equipamiento-escolar': {
    path: '/equipamiento-escolar',
    title: 'Equipamiento escolar y buses',
    description:
      'Equipamiento de buses escolares según normativa de transporte: butacas homologadas, señalética, balizas y terminaciones. Utilcar, Santiago.',
    keywords:
      'equipamiento escolar Chile, conversión bus escolar, butacas homologadas transporte',
  },
  banquetas: {
    path: '/banquetas',
    title: 'Banquetas para minibús y transporte',
    description:
      'Fabricación de banquetas para minibús, traslado de personal y transporte escolar. Estructura reforzada, tapizados técnicos y cinturones en Santiago.',
    keywords:
      'banquetas minibús Santiago, banquetas transporte personal, fabricación banquetas',
  },
  butacas: {
    path: '/butacas',
    title: 'Butacas a medida para transporte',
    description:
      'Butacas ergonómicas para flotas, turismo y vehículos especiales. Matrices propias, tapizados premium e instalación certificada en Santiago.',
    keywords:
      'butacas transporte Santiago, butacas a medida minibús, fabricación butacas',
  },
  accesorios: {
    path: '/accesorios',
    title: 'Accesorios para conversiones vehiculares',
    description:
      'Cabeceras, apoya brazos, balizas y distintivo escolar para vans y buses. Accesorios de confort, seguridad y señalización — Utilcar Santiago.',
    keywords:
      'accesorios conversión vehicular, baliza amarilla 12V, distintivo escolar',
  },
  'trabajos-realizados': {
    path: '/trabajos-realizados',
    title: 'Trabajos realizados y portfolio',
    description:
      'Proyectos de conversiones automotrices: talleres móviles, ventanas, equipamiento escolar, banquetas y accesorios. Experiencia Utilcar en Santiago.',
    keywords:
      'trabajos conversiones automotrices, portfolio talleres móviles, proyectos equipamiento escolar',
  },
  contacto: {
    path: '/contacto',
    title: 'Contacto y cotización',
    description:
      'Cotice su conversión o equipamiento con Utilcar en Quinta Normal, Santiago. Teléfono, WhatsApp, formulario y mapa de ubicación.',
    keywords:
      'cotizar conversión automotriz Santiago, Utilcar contacto, taller conversión Chile',
  },
  'not-found': {
    path: '',
    title: 'Página no encontrada',
    description: 'La página solicitada no existe. Vuelva al inicio o contacte a Utilcar Conversiones.',
    keywords: '',
    noindex: true,
  },
}

export const PUBLIC_ROUTES = Object.entries(PAGE_SEO)
  .filter(([, meta]) => meta.path && !meta.noindex)
  .map(([, meta]) => meta.path)

export function getPageSeo(pageKey) {
  return PAGE_SEO[pageKey] ?? null
}

export function buildCanonical(path) {
  const base = SITE.url.replace(/\/$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildPageTitle(seoTitle) {
  if (!seoTitle) return `${SITE.name} | Conversiones automotrices`
  return `${seoTitle} | ${SITE.name}`
}
