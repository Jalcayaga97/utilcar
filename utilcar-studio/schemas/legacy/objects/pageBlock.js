/**
 * Metadatos internos — ocultos al editor; blockKey lo resuelve el frontend (normalize).
 */
export const pageBlock = {
  name: 'pageBlock',
  title: 'Metadatos internos',
  type: 'object',
  fields: [
    {
      name: 'blockKey',
      title: 'Clave interna',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'blockType',
      title: 'Tipo interno',
      type: 'string',
      hidden: true,
      readOnly: true,
      initialValue: 'specialty',
    },
  ],
}
