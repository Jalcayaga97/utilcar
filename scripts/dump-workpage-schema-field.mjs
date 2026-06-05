/**
 * Dump del field blocks resuelto para workPage vs serviceSubPage.
 * node scripts/dump-workpage-schema-field.mjs
 */
import { workPage } from '../utilcar-studio/schemas/content/workPage.js'
import { serviceSubPage } from '../utilcar-studio/schemas/content/serviceSubPage.js'
import { pageBlocksField, workPageBlocksField } from '../utilcar-studio/schemas/content/blocks/pageBlocks.js'

const wpField = workPage.fields.find((f) => f.name === 'blocks')
const svcField = serviceSubPage.fields.find((f) => f.name === 'blocks')

function summarize(field, label) {
  console.log(`\n=== ${label} ===`)
  console.log('name:', field.name)
  console.log('title:', field.title)
  console.log('type:', field.type)
  console.log('hidden:', field.hidden ?? false)
  console.log('readOnly:', field.readOnly ?? false)
  console.log('components:', field.components ?? null)
  console.log('options:', JSON.stringify(field.options ?? {}))
  console.log(
    'of types:',
    (field.of ?? []).map((o) => o.type).join(', '),
  )
  console.log('validation:', field.validation ? 'Rule[] present' : 'none')
}

summarize(wpField, 'workPage.blocks (efectivo en schema)')
summarize(svcField, 'serviceSubPage.blocks')

console.log('\n=== workPageBlocksField() directo ===')
summarize(workPageBlocksField(), 'workPageBlocksField()')

console.log('\n=== pageBlocksField() directo ===')
summarize(pageBlocksField(), 'pageBlocksField()')

console.log('\n=== workPage document ===')
console.log('name:', workPage.name)
console.log('components:', workPage.components ?? null)
console.log('field names:', workPage.fields.map((f) => f.name).join(', '))
