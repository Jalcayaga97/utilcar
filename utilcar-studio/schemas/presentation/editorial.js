/**
 * Presentation layer — textos y agrupaciones editoriales (solo Studio).
 */

export const EDITORIAL_HINTS = {
  specialtiesSection:
    'Esta sección aparece en la página de inicio (Home). Los cambios se publican en el sitio web.',
  specialtiesCreate: 'Puedes crear nuevas categorías aquí.',
  specialtiesOrder:
    'El orden de las categorías afecta cómo se muestran en la página de inicio (Home). Arrastra para reordenar.',
  specialtiesNoDuplicates:
    'Se recomienda no duplicar títulos entre especialidades.',
  specialtyItem:
    'Completa título, descripción e imagen. El sistema asigna identificadores automáticamente.',
}

export const FIELDSETS = {
  hero: { name: 'hero', title: 'Contenido principal', options: { collapsible: false } },
  content: { name: 'content', title: 'Contenido', options: { collapsible: true, collapsed: false } },
  media: { name: 'media', title: 'Imagen', options: { collapsible: true, collapsed: false } },
  cta: { name: 'cta', title: 'Botón', options: { collapsible: true, collapsed: true } },
}

export const HERO_FIELDSETS = [
  { name: 'content', title: 'Content', options: { collapsible: false } },
  { name: 'ctas', title: 'CTAs', options: { collapsible: true, collapsed: false } },
  { name: 'media', title: 'Media', options: { collapsible: true, collapsed: false } },
  { name: 'advanced', title: 'Advanced', options: { collapsible: true, collapsed: true } },
]

export const PORTFOLIO_FIELDSETS = [
  { name: 'content', title: 'Content', options: { collapsible: false } },
  { name: 'settings', title: 'Configuración', options: { collapsible: true, collapsed: false } },
  { name: 'projects', title: 'Proyectos', options: { collapsible: true, collapsed: false } },
  { name: 'advanced', title: 'Advanced', options: { collapsible: true, collapsed: true } },
]

export const PORTFOLIO_ITEM_FIELDSETS = [
  { name: 'content', title: 'Contenido', options: { collapsible: false } },
  { name: 'media', title: 'Media', options: { collapsible: true, collapsed: false } },
  { name: 'options', title: 'Opciones', options: { collapsible: true, collapsed: true } },
]

export const EDITORIAL_COPY = {
  hero: {
    sectionDescription:
      'Primera impresión del sitio: titular, mensajes clave, botones e imagen principal.',
    contentHint:
      'Escribe un titular claro y 2–3 destacados breves. El subtítulo complementa la propuesta de valor.',
    missingImageWarning:
      'Sin imagen en CMS: el sitio mostrará la foto hero local por defecto hasta que subas una aquí.',
    emptyPrimaryCtaWarning:
      'Sin CTA primario: el sitio usará "Solicitar cotización" desde la configuración global.',
    imageAltHint: 'Describe la imagen para accesibilidad y SEO (obligatorio si hay imagen).',
    highlightsHint: 'Frases cortas con beneficios clave. Aparecen con ícono de check en el Home.',
  },
  portfolio: {
    sectionDescription:
      'Vista previa de trabajos en el Home. Cada proyecto es una tarjeta con imagen, categoría y descripción.',
    itemsHint:
      '{count} proyecto(s) en la sección. Arrastra para reordenar; el sitio respeta el orden editorial.',
    reorderHint: 'Tip: mantén títulos compactos y categorías consistentes para una grilla uniforme.',
    categoryHint: 'Se muestra como badge sobre la tarjeta (ej. Talleres móviles, Ventanas y lunetas).',
    galleryHint: 'Galería opcional para futuras vistas ampliadas. No cambia la tarjeta principal aún.',
    featuredHint: 'Marca proyectos destacados para futuras variantes visuales.',
  },
  specialties: {
    sectionDescription:
      'Las tres especialidades que aparecen en el Home. Cada una es una sección editorial, no una página aparte.',
    categoryDescription:
      'Título, descripción, imagen, especificaciones y CTA. Lo que edites aquí es lo que verás en Inicio → Especialidades.',
    categoryGalleryHint: '[DEPRECATED] Galería legacy — no editable.',
    featuresHint: 'Grupos de especificaciones (ej. Compatibilidad, Equipamiento). Cada grupo con su lista de ítems.',
    brandsHint: '[DEPRECATED] Marcas legacy — no editable.',
    brandGalleryHint: '[DEPRECATED] Galería de marca legacy.',
  },
  services: {
    sectionDescription: 'Tarjetas de servicios principales en el Home.',
    itemHint: 'Cada servicio: título, descripción, icono opcional e imagen.',
  },
  whyUs: {
    sectionDescription: 'Beneficios o motivos para elegir Utilcar.',
    itemHint: 'Tarjetas compactas con icono y descripción breve.',
  },
}

export const SPECIALTY_FIELDSETS = [
  FIELDSETS.hero,
  FIELDSETS.content,
  FIELDSETS.media,
  FIELDSETS.cta,
]

export const SPECIALTY_CATEGORY_FIELDSETS = [
  { name: 'hero', title: 'Contenido principal', options: { collapsible: false } },
  { name: 'media', title: 'Imagen principal', options: { collapsible: true, collapsed: false } },
  { name: 'features', title: 'Características', options: { collapsible: true, collapsed: false } },
  { name: 'cta', title: 'CTA', options: { collapsible: true, collapsed: false } },
  { name: 'options', title: 'Opciones', options: { collapsible: true, collapsed: true } },
  { name: 'gallery', title: '[DEPRECATED] Galería', options: { collapsible: true, collapsed: true } },
  { name: 'brands', title: '[DEPRECATED] Marcas', options: { collapsible: true, collapsed: true } },
  { name: 'advanced', title: '[DEPRECATED] Layout', options: { collapsible: true, collapsed: true } },
]

export const SPECIALTY_BRAND_FIELDSETS = [
  { name: 'identity', title: 'Identidad', options: { collapsible: false } },
  { name: 'media', title: 'Imágenes', options: { collapsible: true, collapsed: false } },
  { name: 'gallery', title: 'Galería', options: { collapsible: true, collapsed: false } },
  { name: 'features', title: 'Características', options: { collapsible: true, collapsed: true } },
  { name: 'cta', title: 'CTA', options: { collapsible: true, collapsed: true } },
  { name: 'options', title: 'Opciones', options: { collapsible: true, collapsed: true } },
]

export const SERVICE_ITEM_FIELDSETS = [
  { name: 'content', title: 'Contenido', options: { collapsible: false } },
  { name: 'media', title: 'Media', options: { collapsible: true, collapsed: false } },
  { name: 'options', title: 'Opciones', options: { collapsible: true, collapsed: true } },
]

export const WHY_US_ITEM_FIELDSETS = [
  { name: 'content', title: 'Contenido', options: { collapsible: false } },
  { name: 'options', title: 'Opciones', options: { collapsible: true, collapsed: true } },
]

export const LUCIDE_ICON_OPTIONS = [
  { title: 'Llave inglesa', value: 'wrench' },
  { title: 'Camión', value: 'truck' },
  { title: 'Escudo', value: 'shield' },
  { title: 'Check', value: 'check-circle' },
  { title: 'Estrella', value: 'star' },
  { title: 'Usuarios', value: 'users' },
  { title: 'Herramientas', value: 'settings' },
  { title: 'Reloj', value: 'clock' },
  { title: 'Medalla', value: 'award' },
  { title: 'Bus', value: 'bus' },
]
