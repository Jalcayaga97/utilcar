/**
 * Copy editorial canónico de Trabajos — espejo de workContent.page (sin imports de assets).
 */
export const WORK_PAGE_CANONICAL = {
  hero: {
    eyebrow: 'Portfolio',
    title: 'Trabajos Realizados',
    subtitle:
      'Proyectos y conversiones desarrolladas por Utilcar Conversiones para transporte, equipamiento y vehículos especiales.',
    imageAlt: 'Conversión de vehículo utilitario realizada por Utilcar Conversiones',
  },
  intro: {
    eyebrow: 'Experiencia',
    title: 'Experiencia en conversiones automotrices',
    paragraphs: [
      'En Utilcar desarrollamos proyectos de conversión y equipamiento a medida para transporte de pasajeros, flotas escolares, trabajo en terreno y vehículos especiales.',
      'Cada trabajo refleja fabricación propia, terminaciones profesionales y soluciones adaptadas a los requerimientos técnicos de cada cliente.',
    ],
  },
  projects: {
    eyebrow: 'Proyectos',
    title: 'Registro de trabajos',
    description:
      'Filtra por línea de servicio y amplía cada proyecto para ver el detalle de la conversión.',
  },
  cta: {
    title: '¿Necesitas una conversión personalizada?',
    description:
      'Desarrollamos soluciones para transporte, equipamiento y trabajo en terreno según los requerimientos de cada cliente.',
    primaryLabel: 'Solicitar cotización',
    primaryTo: '/contacto',
  },
}

export const WORK_PAGE_SEO = {
  title: 'Trabajos realizados y portfolio',
  description:
    'Proyectos de conversiones automotrices: talleres móviles, ventanas, equipamiento escolar, banquetas y accesorios. Experiencia Utilcar en Santiago.',
  canonicalPath: '/trabajos-realizados',
}
