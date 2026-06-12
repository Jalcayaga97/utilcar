/**
 * Detecta tipos Sanity referenciados pero no registrados en schemaTypes.
 * npm run audit:studio-schema
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const STUDIO_ROOT = join(WEB_ROOT, 'utilcar-studio', 'schemas')

const BUILTINS = new Set([
  'string', 'text', 'number', 'boolean', 'url', 'image', 'array', 'object',
  'document', 'block', 'reference', 'slug', 'datetime', 'date', 'file',
  'geopoint', 'crossDatasetReference',
])

/** Valores de UI Sanity, no tipos de schema. */
const UI_OPTIONS = new Set(['dialog', 'popover', 'fullscreen'])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (/\.(js|jsx|ts|tsx)$/.test(entry)) files.push(path)
  }
  return files
}

function parseSchemaTypes(indexSrc) {
  const match = indexSrc.match(/export const schemaTypes = \[([\s\S]*?)\]/)
  if (!match) return new Set()
  return new Set([...match[1].matchAll(/^\s*([a-zA-Z][a-zA-Z0-9_]*),?\s*$/gm)].map((m) => m[1]))
}

function parseTypeDefinitions(files) {
  const typeNameToVar = new Map()
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    for (const block of src.split('export const ').slice(1)) {
      const varMatch = block.match(/^([a-zA-Z][a-zA-Z0-9_]*) =/)
      const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/)
      if (varMatch && nameMatch) {
        typeNameToVar.set(nameMatch[1], { varName: varMatch[1], file })
      }
    }
  }
  return typeNameToVar
}

function parseReferencedTypes(files) {
  const referenced = new Set()
  const typeRef = /type:\s*['"]([a-zA-Z][a-zA-Z0-9_]*)['"]/g
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    for (const match of src.matchAll(typeRef)) {
      if (!BUILTINS.has(match[1]) && !UI_OPTIONS.has(match[1])) referenced.add(match[1])
    }
  }
  return referenced
}

const files = walk(STUDIO_ROOT)
const indexSrc = readFileSync(join(STUDIO_ROOT, 'index.js'), 'utf8')
const registeredVars = parseSchemaTypes(indexSrc)
const typeNameToVar = parseTypeDefinitions(files)
const referenced = parseReferencedTypes(files)

const missing = []
for (const typeName of referenced) {
  const def = typeNameToVar.get(typeName)
  if (!def) {
    missing.push({ typeName, reason: 'sin-definicion' })
    continue
  }
  if (!registeredVars.has(def.varName)) {
    missing.push({
      typeName,
      varName: def.varName,
      file: relative(WEB_ROOT, def.file),
      reason: 'no-registrado-en-schemaTypes',
    })
  }
}

console.info('\n══════════════════════════════════════')
console.info('  Auditoría schema Studio')
console.info('══════════════════════════════════════\n')
console.info(`Tipos referenciados: ${referenced.size}`)
console.info(`Variables en schemaTypes: ${registeredVars.size}`)

if (!missing.length) {
  console.info('✓ Sin tipos huérfanos')
} else {
  for (const item of missing) {
    if (item.reason === 'sin-definicion') {
      console.info(`✗ ${item.typeName} — referenciado pero sin definición`)
    } else {
      console.info(`✗ ${item.typeName} (${item.varName}) — no está en schemaTypes [${item.file}]`)
    }
  }
}

console.info(`\nErrores: ${missing.length}`)
if (missing.length) process.exit(1)
