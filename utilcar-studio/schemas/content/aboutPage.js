import { schemaVersionField } from './fields/schemaVersion.js'
import { aboutPageBlocksField } from './blocks/pageBlocks.js'

export const aboutPage = {
  name: 'aboutPage',
  title: 'Sobre Nosotros',
  type: 'document',
  fields: [schemaVersionField, aboutPageBlocksField()],
}
