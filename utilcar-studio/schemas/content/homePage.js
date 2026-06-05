import { schemaVersionField } from './fields/schemaVersion.js'
import { especialidadItem } from '../legacy/objects/especialidadItem.js'
import { EDITORIAL_HINTS } from '../presentation/editorial.js'
import { advancedSectionHidden } from '../governance/studioAdmin.js'
import { legacyMirrorReadOnly } from '../governance/legacyMirror.js'
import { specialtiesNewArrayRules } from '../governance/validators.js'
import { HomePageDocumentInput } from '../presentation/components/HomePageDocumentInput.jsx'
import {
  heroBlock,
  specialtiesBlock,
  servicesBlock,
  whyUsBlock,
  whyUtilcarBlock,
  portfolioBlock,
  galleryBlock,
  ctaBlock,
  faqBlock,
  featuresBlock,
  richTextBlock,
  mapBlock,
  seoBlock,
} from './blocks/index.js'
import { HomePageBlocksArrayInput } from '../presentation/components/HomePageBlocksArrayInput.jsx'
import { HomePageBlockItemInput } from '../presentation/components/HomePageBlockItemInput.jsx'

const sectionBlock = (name, title, extraFields = []) => ({
  name,
  title,
  type: 'object',
  fields: [
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text' },
    ...extraFields,
  ],
})

export const homePage = {
  name: 'homePage',
  title: 'Inicio',
  type: 'document',
  components: {
    input: HomePageDocumentInput,
  },
  fields: [
    schemaVersionField,
    {
      name: 'blocks',
      title: 'Bloques de la página',
      description:
        'Fuente única de edición (roadmap CMS). Los campos planos son espejo GROQ deprecated.',
      type: 'array',
      of: [
        { type: 'heroBlock' },
        { type: 'specialtiesBlock' },
        { type: 'servicesBlock' },
        { type: 'whyUsBlock' },
        { type: 'whyUtilcarBlock' },
        { type: 'portfolioBlock' },
        { type: 'galleryBlock' },
        { type: 'ctaBlock' },
        { type: 'faqBlock' },
        { type: 'featuresBlock' },
        { type: 'richTextBlock' },
      ],
      options: {
        sortable: true,
        modal: {
          type: 'dialog',
          width: 2,
        },
      },
      components: {
        input: HomePageBlocksArrayInput,
        item: HomePageBlockItemInput,
      },
    },
    {
      name: 'hero',
      title: 'Portada (Hero)',
      description: '[DEPRECATED mirror] Solo lectura si hay blocks. Advanced Mode.',
      type: 'object',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      fields: [
        { name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() },
        { name: 'subtitle', title: 'Subtítulo', type: 'text' },
        { name: 'highlights', title: 'Destacados', type: 'array', of: [{ type: 'string' }] },
        { name: 'secondaryLink', title: 'Enlace secundario', type: 'ctaLink' },
        { name: 'imageAlt', title: 'Descripción de imagen', type: 'string' },
      ],
    },
    {
      name: 'specialtiesNew',
      title: 'Especialidades (alias GROQ)',
      description: '[DEPRECATED mirror] coalesce(categories, items) → specialtiesNew.',
      type: 'array',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      of: [{ type: 'specialty' }],
      options: { sortable: true },
      validation: (Rule) => specialtiesNewArrayRules(Rule),
    },
    {
      ...sectionBlock('services', 'Bloque servicios', [
        { name: 'cardLinkLabel', title: 'Texto enlace tarjeta', type: 'string' },
      ]),
      title: 'Servicios (espejo GROQ)',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
    },
    {
      ...sectionBlock('highlights', 'Por qué Utilcar (espejo GROQ)'),
      readOnly: legacyMirrorReadOnly,
      hidden: true,
    },
    {
      name: 'portfolioPreview',
      title: 'Portfolio (espejo GROQ)',
      type: 'object',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'ctaLabel', type: 'string' },
        { name: 'ctaTo', type: 'string' },
        { name: 'previewCount', type: 'number' },
      ],
    },
    {
      name: 'ctaBanner',
      title: 'Banner CTA (espejo GROQ)',
      type: 'object',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'especialidades',
      title: 'Especialidades (archivo legacy)',
      type: 'object',
      hidden: advancedSectionHidden,
      readOnly: true,
      fields: [
        { name: 'eyebrow', type: 'string', readOnly: true, hidden: true },
        { name: 'title', type: 'string', readOnly: true, hidden: true },
        { name: 'description', type: 'text', readOnly: true, hidden: true },
        { name: 'itemEyebrowPrefix', type: 'string', readOnly: true, hidden: true },
        {
          name: 'items',
          title: 'Ítems legacy',
          type: 'array',
          readOnly: true,
          hidden: true,
          of: [{ type: 'especialidadItem' }],
        },
      ],
    },
    {
      name: 'especialidadesList',
      title: 'Especialidades (legacy)',
      type: 'array',
      hidden: advancedSectionHidden,
      readOnly: true,
      of: [{ type: 'especialidadItem' }],
    },
  ],
  preview: {
    select: { title: 'hero.title', blocks: 'blocks' },
    prepare({ title, blocks }) {
      const count = Array.isArray(blocks) ? blocks.length : 0
      return {
        title: title || 'Inicio',
        subtitle: count ? `${count} bloque${count === 1 ? '' : 's'}` : 'Sin bloques',
      }
    },
  },
}

export {
  heroBlock,
  specialtiesBlock,
  servicesBlock,
  whyUsBlock,
  whyUtilcarBlock,
  portfolioBlock,
  galleryBlock,
  ctaBlock,
  faqBlock,
  featuresBlock,
  richTextBlock,
  mapBlock,
  seoBlock,
}
