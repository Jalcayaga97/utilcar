import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const mapBlock = {
  name: 'mapBlock',
  title: 'Mapa',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    {
      name: 'embedQuery',
      title: 'Query Google Maps',
      type: 'string',
      description: 'Ej. Utilcar+Santiago (opcional; fallback a SITE.mapsQuery)',
    },
    { name: 'iframeTitle', title: 'Título iframe (accesibilidad)', type: 'string' },
  ],
  preview: {
    select: { title: 'title', enabled: 'enabled' },
    prepare({ title, enabled }) {
      return {
        title: title || 'Mapa',
        subtitle: enabled === false ? 'Oculto' : 'Visible',
      }
    },
  },
}
