/**
 * Reemplaza tabs de serviceSubPage-banquetas por la oferta actual:
 * escolares → furgones → camiones
 *
 * npm run migrate:banquetas-product-lines:dry
 * npm run migrate:banquetas-product-lines
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const BANQUETAS_ID = serviceSubPageDocumentId('banquetas')

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const uploadCache = new Map()

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

function specSection(title, items) {
  return { title, items }
}

/** Orden manual: escolares → furgones → camiones */
const BANQUETAS_PRODUCT_LINES = [
  {
    id: 'escolares',
    name: 'Banquetas escolares',
    intro: [
      'Línea de banquetas para transporte escolar, fabricadas según requerimientos de seguridad, confort y normativa de transporte de pasajeros.',
    ],
    sections: [
      specSection('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      specSection('Opciones de equipamiento', [
        'Asiento con espuma de 6 cm de alta densidad.',
        'Respaldo con espuma de 4 cm de alta densidad.',
        'Cabecera regulable.',
        'Tapiz lateral en vinil liso.',
        'Tapiz de cubiertas en vinil técnico Bronco Benz.',
        'Patas en perfil rectangular 50×30 electropintadas.',
        'Cinturones de seguridad de dos puntas (uso obligatorio).',
      ]),
    ],
  },
  {
    id: 'furgones',
    name: 'Banquetas para furgones',
    intro: [
      'Banquetas diseñadas para furgones utilitarios, minibuses y conversiones de pasajeros, optimizadas para espacios compactos con estructura reforzada y terminaciones orientadas al uso diario.',
    ],
    sections: [
      specSection('Aplicación', [
        'Minibuses, furgones convertidos y transporte corporativo.',
        'Layouts modulares según batalla, accesos y capacidad del vehículo.',
        'Integración con equipamiento interior y señalética del proyecto.',
      ]),
      specSection('Opciones de equipamiento', [
        'Estructura de tubo de 1" × 2 mm doblada simétricamente.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Espuma de poliuretano de alta densidad.',
        'Tapiz a elección del cliente.',
        'Patas en perfil rectangular 50×30 electropintadas.',
        'Cinturones de seguridad de dos puntas.',
      ]),
    ],
  },
  {
    id: 'camiones',
    name: 'Banquetas para camiones',
    intro: [
      'Banquetas para camiones de transporte de pasajeros y aplicaciones de larga distancia, con estructura reforzada, ergonomía y tapizados técnicos para uso intensivo en ruta.',
    ],
    sections: [
      specSection('Aplicación', [
        'Transporte interurbano y regional en camiones habilitados para pasajeros.',
        'Configuraciones en riel o anclaje directo según carrocería y normativa.',
        'Distribuciones personalizadas según capacidad y pasillo homologado.',
      ]),
      specSection('Opciones de equipamiento', [
        'Estructura de tubo de 1" × 2 mm con procesos de fabricación controlados.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Espuma de alta densidad en asiento y respaldo.',
        'Tapizados técnicos resistentes al desgaste.',
        'Cabecera regulable opcional.',
        'Cinturones de tres puntas según normativa.',
      ]),
    ],
  },
]

const TAB_GALLERY_FILES = {
  escolares: [
    { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', alt: 'Banquetas escolares — Utilcar' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', alt: 'Banquetas escolares — instalación' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc2.jpg', alt: 'Banquetas escolares — detalle tapizado' },
  ],
  furgones: [
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', alt: 'Banquetas para furgones — transporte de pasajeros' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg', alt: 'Banquetas para furgones — interior' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg', alt: 'Banquetas para furgones — detalle fabricación' },
  ],
  camiones: [
    { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', alt: 'Banquetas para camiones — estructura reforzada' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', alt: 'Banquetas para camiones — terminaciones' },
  ],
}

const BEFORE_QUERY = `*[_id in [$id, $draftId]]{
  _id, _rev,
  "tabCount": count(tabs),
  tabs[]{ _key, id, name, "galleryCount": count(gallery) }
}`

const FULL_QUERY = `*[_id == $id][0]{
  _id, _rev, tabsSection, blocks, tabs[]{ _key, id, name }
}`

function fileStat(relativePath) {
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) return { exists: false, abs }
  return { exists: true, abs, size: statSync(abs).size }
}

async function uploadImage(relativePath, alt) {
  if (!relativePath) return null
  if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)

  const stat = fileStat(relativePath)
  if (!stat.exists) {
    console.warn(`  ⚠ Imagen no encontrada: ${relativePath}`)
    return null
  }

  if (dryRun) {
    const placeholder = { _type: 'image', alt: alt || basename(relativePath), _dry: true }
    uploadCache.set(relativePath, placeholder)
    return placeholder
  }

  const asset = await client.assets.upload('image', createReadStream(stat.abs), {
    filename: basename(stat.abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: alt || basename(stat.abs),
  }
  uploadCache.set(relativePath, ref)
  return ref
}

function mapTab(tab, galleryEntries) {
  return {
    _type: 'serviceTab',
    _key: blockKey('tab', tab.id),
    id: tab.id,
    name: tab.name,
    description: tab.intro?.[0] ?? '',
    models: [],
    subtitle: '',
    intro: tab.intro ?? [],
    sections: (tab.sections ?? []).map((section, index) => ({
      _key: blockKey(`sec-${tab.id}`, index),
      title: section.title,
      items: section.items ?? [],
    })),
    gallery: galleryEntries,
    extra: tab.extra ?? undefined,
  }
}

async function buildTabs() {
  const mappedTabs = []
  let galleryCount = 0

  for (const tab of BANQUETAS_PRODUCT_LINES) {
    const files = TAB_GALLERY_FILES[tab.id] ?? []
    const gallery = []
    for (const [index, fileEntry] of files.entries()) {
      const image = await uploadImage(fileEntry.file, fileEntry.alt)
      if (!image) continue
      galleryCount += 1
      gallery.push({
        _key: blockKey(`gal-${tab.id}`, index),
        image,
        alt: fileEntry.alt,
        caption: tab.name,
      })
    }
    mappedTabs.push(mapTab(tab, gallery))
  }

  return { mappedTabs, galleryCount }
}

async function main() {
  const beforeDocs = await client.fetch(BEFORE_QUERY, {
    id: BANQUETAS_ID,
    draftId: `drafts.${BANQUETAS_ID}`,
  })

  console.log('[migrate:banquetas-product-lines] BEFORE')
  for (const doc of beforeDocs) {
    console.log(`  ${doc._id}: ${doc.tabCount ?? 0} tabs → ${(doc.tabs ?? []).map((t) => `${t.id}(${t.galleryCount ?? 0}img)`).join(', ')}`)
  }

  const { mappedTabs, galleryCount } = await buildTabs()

  console.log('\nAFTER (plan)')
  console.log(`  tabs: ${mappedTabs.length}`)
  console.log(`  orden: ${mappedTabs.map((t) => t.id).join(' → ')}`)
  console.log(`  imágenes gallery: ${galleryCount}`)
  for (const tab of mappedTabs) {
    const secKeys = (tab.sections ?? []).every((s) => s._key)
    console.log(`  · ${tab.id}: gallery=${tab.gallery?.length ?? 0}, sections=${tab.sections?.length ?? 0}, _key=${tab._key}, secKeys=${secKeys}`)
  }

  if (dryRun) {
    console.log('\n[dry] Sin escritura en Sanity.')
    return
  }

  const targets = beforeDocs.length ? beforeDocs : [{ _id: BANQUETAS_ID }]
  for (const doc of targets) {
    if ((doc.tabCount ?? 0) === 0 && doc._id.startsWith('drafts.')) continue
    await client.patch(doc._id).set({ tabs: mappedTabs }).commit()
    console.log(`\n✓ Tabs actualizados en ${doc._id}`)
  }

  const verify = await client.fetch(BEFORE_QUERY, {
    id: BANQUETAS_ID,
    draftId: `drafts.${BANQUETAS_ID}`,
  })
  console.log('\nVERIFY')
  for (const doc of verify) {
    console.log(`  ${doc._id}: ${(doc.tabs ?? []).map((t) => `${t.id}(_key=${t._key},gal=${t.galleryCount})`).join(', ')}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
