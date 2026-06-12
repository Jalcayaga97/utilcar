/** Metadatos compartidos por todos los bloques del Page Builder. */
export const BLOCK_META_FIELDSET = {
  name: 'meta',
  title: 'Visibilidad',
  options: { collapsible: false, columns: 2 },
}

export const blockMetaFields = () => [
  {
    name: 'enabled',
    title: 'Visible',
    type: 'boolean',
    fieldset: 'meta',
    initialValue: true,
    description: 'Oculta el bloque en el sitio cuando la fase frontend lo soporte.',
  },
  {
    name: 'order',
    title: 'Orden',
    type: 'number',
    fieldset: 'meta',
    hidden: true,
    initialValue: 0,
  },
]

export const BLOCK_TYPE_LABELS = {
  heroBlock: 'Portada (Hero)',
  specialtiesBlock: 'Especialidades',
  servicesBlock: 'Servicios',
  whyUsBlock: 'Por qué Utilcar',
  whyUtilcarBlock: 'Por qué Utilcar',
  portfolioBlock: 'Portfolio',
  galleryBlock: 'Portfolio (legacy)',
  ctaBlock: 'Banner CTA',
  faqBlock: 'Preguntas frecuentes',
  featuresBlock: 'Características',
  featureGridBlock: 'Grilla de características',
  richTextBlock: 'Texto enriquecido',
  showcaseCarouselBlock: 'Carrusel destacado',
  brandCarouselBlock: 'Marcas que confían',
  mapBlock: 'Mapa',
  seoBlock: 'SEO y metadatos',
}
