import { HERO_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import { HeroBlockEditorialInput } from '../../presentation/components/HeroBlockEditorialInput.jsx'
import { heroImageWarning, heroTitleLengthWarning } from '../../presentation/editorialValidators.js'

const isHomePage = ({ document }) => document?._type === 'homePage'

export const heroBlock = {
  name: 'heroBlock',
  title: 'Portada (Hero)',
  type: 'object',
  fieldsets: HERO_FIELDSETS,
  components: {
    input: HeroBlockEditorialInput,
  },
  fields: [
    {
      name: 'enabled',
      title: 'Visible en el sitio',
      type: 'boolean',
      fieldset: 'advanced',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      fieldset: 'advanced',
      hidden: true,
      initialValue: 0,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      fieldset: 'content',
      description: 'Etiqueta superior (ej. Servicios). En Home suele dejarse vacío.',
    },
    {
      name: 'title',
      title: 'Título principal',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => [Rule.required(), heroTitleLengthWarning(Rule)],
      description:
        'Titular H1. En Home usar una sola línea: "Conversiones, modificaciones, tapicería y equipamientos automotrices."',
    },
    {
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'text',
      fieldset: 'content',
      rows: 3,
      hidden: isHomePage,
      description:
        'Párrafo bajo el titular. Visible en servicios, contacto, sobre nosotros y trabajos. No se renderiza en Home.',
    },
    {
      name: 'highlights',
      title: '[Deprecado] Destacados',
      type: 'array',
      fieldset: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags', sortable: true },
      hidden: isHomePage,
      readOnly: true,
      description: 'Ya no se muestra en Home.',
    },
    {
      name: 'textLinkLabel',
      title: 'Enlace de texto — etiqueta',
      type: 'string',
      fieldset: 'ctas',
      hidden: ({ document }) => document?._type !== 'homePage',
      description: 'Solo Home: enlace bajo los botones globales. Ej: Ver trabajos realizados',
    },
    {
      name: 'textLinkUrl',
      title: 'Enlace de texto — URL',
      type: 'string',
      fieldset: 'ctas',
      hidden: ({ document }) => document?._type !== 'homePage',
      description: 'Solo Home: ruta interna. Ej: /trabajos-realizados',
    },
    {
      name: 'primaryCta',
      title: '[Legacy] CTA primario',
      type: 'editorialCta',
      fieldset: 'ctas',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'secondaryLink',
      title: '[Legacy] CTA secundario',
      type: 'editorialCta',
      fieldset: 'ctas',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'primaryImage',
      title: 'Imagen principal (logo corporativo)',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      hidden: ({ document }) => document?._type !== 'homePage',
      description: 'Logo Utilcar u imagen corporativa izquierda del hero Home.',
    },
    {
      name: 'primaryImageAlt',
      title: 'Alt imagen principal',
      type: 'string',
      fieldset: 'media',
      hidden: ({ document }) => document?._type !== 'homePage',
    },
    {
      name: 'secondaryImage',
      title: 'Imagen secundaria (distintivo / aniversario)',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      hidden: ({ document }) => document?._type !== 'homePage',
      description: 'Logo de años en el mercado u otro distintivo (derecha del hero Home).',
    },
    {
      name: 'secondaryImageAlt',
      title: 'Alt imagen secundaria',
      type: 'string',
      fieldset: 'media',
      hidden: ({ document }) => document?._type !== 'homePage',
    },
    {
      name: 'image',
      title: 'Imagen hero',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      hidden: isHomePage,
      validation: heroImageWarning,
      description: 'Imagen principal en páginas de servicio y contacto.',
    },
    {
      name: 'mobileImage',
      title: 'Imagen mobile (opcional)',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      hidden: isHomePage,
      description: 'Override para pantallas pequeñas. Si vacío, usa imagen hero.',
    },
    {
      name: 'imageAlt',
      title: 'Texto alternativo (alt)',
      type: 'string',
      fieldset: 'media',
      hidden: isHomePage,
      description: EDITORIAL_COPY.hero.imageAltHint,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'primaryImage',
      fallbackMedia: 'image',
      enabled: 'enabled',
      textLink: 'textLinkLabel',
    },
    prepare({ title, subtitle, media, fallbackMedia, enabled, textLink }) {
      const parts = []
      if (subtitle) parts.push(String(subtitle).slice(0, 48))
      if (textLink) parts.push(`Enlace: ${textLink}`)
      if (enabled === false) parts.push('Oculto')
      return {
        title: title || 'Portada (Hero)',
        subtitle: parts.join(' · ') || 'Visible',
        media: media ?? fallbackMedia,
      }
    },
  },
}
