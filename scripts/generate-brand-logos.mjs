/**
 * Genera logos SVG normalizados en public/brands/.
 * npm run generate:brand-logos
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BRAND_NAMES, buildBrandSvgContent } from './lib/brandLogoCatalog.mjs'

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const OUT_DIR = join(WEB_ROOT, 'public', 'brands')

mkdirSync(OUT_DIR, { recursive: true })

let written = 0
for (const name of BRAND_NAMES) {
  const content = buildBrandSvgContent(name)
  if (!content) {
    console.warn(`⚠ sin SVG para: ${name}`)
    continue
  }
  const slug =
    name === 'Grupo Norte'
      ? 'grupo-norte'
      : name.toLowerCase().replace(/\s+/g, '-')
  const outPath = join(OUT_DIR, `${slug}.svg`)
  writeFileSync(outPath, content, 'utf8')
  written += 1
  console.info(`✓ ${slug}.svg`)
}

console.info(`\n${written}/${BRAND_NAMES.length} logos en public/brands/`)
