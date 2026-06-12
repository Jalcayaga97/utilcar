/**
 * Inserta showcaseCarouselBlock (5 imgs) en cada serviceSubPage tras heroBlock.
 *
 * npm run migrate:service-showcases:dry
 * npm run migrate:service-showcases
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const uploadCache = new Map()

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

/** 5 imágenes por servicio — reutiliza assets locales del proyecto. */
const SHOWCASE_CATALOG = {
  'talleres-moviles': [
    { file: 'src/assets/images/talleres/tr143.jpg', title: 'Taller móvil', alt: 'Taller móvil equipado para trabajo en terreno — Utilcar' },
    { file: 'src/assets/images/talleres/tr247.jpg', title: 'Interior técnico', alt: 'Interior de vehículo adaptado como taller móvil' },
    { file: 'src/assets/images/talleres/tr11.jpg', title: 'Conversión furgón', alt: 'Conversión de furgón para servicio técnico móvil' },
    { file: 'src/assets/images/talleres/tr12.jpg', title: 'Compartimientos', alt: 'Unidad móvil con compartimientos interiores' },
    { file: 'src/assets/images/talleres/tr9.jpg', title: 'Revestimiento', alt: 'Vehículo utilitario con revestimiento interior' },
  ],
  'ventanas-lunetas': [
    { file: 'src/assets/images/ventanas/vent1.jpg', title: 'Ventanas corredizas', alt: 'Ventanas laterales corredizas en furgón utilitario' },
    { file: 'src/assets/images/ventanas/vent2.jpg', title: 'Marco aluminio', alt: 'Ventanas con marco de aluminio electropintado' },
    { file: 'src/assets/images/ventanas/vent3.jpg', title: 'Luneta trasera', alt: 'Luneta trasera con terminación profesional' },
    { file: 'src/assets/images/ventanas/marcas/toyota/toyota.jpg', title: 'Toyota', alt: 'Ventanas instaladas en vehículo Toyota' },
    { file: 'src/assets/images/ventanas/marcas/chevrolet/chev1.jpg', title: 'Chevrolet', alt: 'Ventanas Chevrolet — instalación Utilcar' },
  ],
  'equipamiento-escolar': [
    { file: 'src/assets/images/escolar/ee350.jpg', title: 'Equipamiento escolar', alt: 'Equipamiento escolar — interior de bus' },
    { file: 'src/assets/images/escolar/ee351.jfif', title: 'Distribución interior', alt: 'Conversión escolar — distribución de asientos' },
    { file: 'src/assets/images/escolar/ee352.jpg', title: 'Señalética', alt: 'Transporte escolar — instalación y señalética' },
    { file: 'public/imagenes/conversiones buses ecolares/escolar01.jpg', title: 'Bus escolar', alt: 'Conversión bus escolar — Utilcar Santiago' },
    { file: 'src/assets/images/accesorios/distintivo-escolar/esc.jpg', title: 'Distintivo escolar', alt: 'Distintivo escolar homologado' },
  ],
  banquetas: [
    { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', title: 'Banquetas escolares', alt: 'Banquetas escolares — fabricación Utilcar' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', title: 'Instalación escolar', alt: 'Banquetas escolares instaladas en minibús' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', title: 'Traslado personal', alt: 'Banquetas para traslado de personal' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg', title: 'Furgón equipado', alt: 'Interior furgón con banquetas de traslado' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', title: 'Banquetas adultos', alt: 'Banquetas para transporte de adultos' },
  ],
  butacas: [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Butacas Utilcar', alt: 'Butacas Utilcar — tapizado y terminaciones' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Detalle costuras', alt: 'Butacas a medida — detalle de costuras' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', title: 'Personalización', alt: 'Butacas personalizadas — estructura y confort' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', title: 'Flota ejecutiva', alt: 'Butacas para transporte ejecutivo' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg', title: 'Transporte pasajeros', alt: 'Butacas para transporte de pasajeros' },
  ],
  accesorios: [
    { file: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg', title: 'Cabeceras', alt: 'Cabeceras para vehículos comerciales' },
    { file: 'src/assets/images/accesorios/apoya-brazos/apoya_brazos.jpg', title: 'Apoya brazos', alt: 'Apoya brazos ergonómico para flota' },
    { file: 'src/assets/images/accesorios/balizas/baliza.jpg', title: 'Baliza 12V', alt: 'Baliza amarilla 12V homologada' },
    { file: 'src/assets/images/accesorios/distintivo-escolar/esc.jpg', title: 'Distintivo escolar', alt: 'Distintivo escolar para transporte' },
    { file: 'src/assets/images/services/accesorios.jpg', title: 'Accesorios Utilcar', alt: 'Accesorios para conversiones vehiculares' },
  ],
  'proteccion-cabina': [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Protección interior', alt: 'Protección de cabina — revestimiento resistente' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Terminación cabina', alt: 'Revestimiento cabina utilitario' },
    { file: 'src/assets/images/talleres/tr143.jpg', title: 'Cabina taller', alt: 'Protección cabina en vehículo de trabajo' },
    { file: 'src/assets/images/talleres/tr11.jpg', title: 'Furgón protegido', alt: 'Furgón con protección interior de cabina' },
    { file: 'src/assets/images/ventanas/vent2.jpg', title: 'Detalle instalación', alt: 'Terminación profesional cabina y ventanas' },
  ],
  'cambio-pisos': [
    { file: 'src/assets/images/banquetas/escolares/banq_esc2.jpg', title: 'Piso técnico', alt: 'Piso técnico en vehículo comercial' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg', title: 'Minibús renovado', alt: 'Renovación de piso en minibús' },
    { file: 'src/assets/images/escolar/ee350.jpg', title: 'Bus escolar', alt: 'Cambio de piso en bus escolar' },
    { file: 'src/assets/images/talleres/tr12.jpg', title: 'Furgón comercial', alt: 'Piso reforzado en furgón utilitario' },
    { file: 'src/assets/images/services/banquetas.jpg', title: 'Interior renovado', alt: 'Interior vehículo con piso técnico nuevo' },
  ],
  reclinaciones: [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Reclinable ejecutiva', alt: 'Butaca reclinable para transporte ejecutivo' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Mecanismo reclinable', alt: 'Instalación mecanismo reclinable Utilcar' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', title: 'Confort pasajeros', alt: 'Reclinación butacas — confort en ruta' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', title: 'Banqueta reclinable', alt: 'Banqueta con sistema reclinable' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', title: 'Turismo', alt: 'Asientos reclinables para turismo' },
  ],
  fundas: [
    { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', title: 'Fundas butacas', alt: 'Fundas a medida para butacas de flota' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', title: 'Uniformidad flota', alt: 'Fundas uniformes para transporte escolar' },
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Protección asientos', alt: 'Fundas protectoras para asientos' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Mantenimiento fácil', alt: 'Fundas removibles para fácil lavado' },
    { file: 'src/assets/images/services/banquetas.jpg', title: 'Flota equipada', alt: 'Vehículo comercial con fundas Utilcar' },
  ],
  literas: [
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', title: 'Literas furgón', alt: 'Literas instaladas en furgón comercial' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg', title: 'Estructura reforzada', alt: 'Literas con estructura reforzada y anclajes' },
    { file: 'src/assets/images/talleres/tr9.jpg', title: 'Vehículo especial', alt: 'Furgón con literas para descanso en ruta' },
    { file: 'src/assets/images/talleres/tr247.jpg', title: 'Interior dormitorio', alt: 'Conversión interior con literas' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', title: 'Descanso tripulación', alt: 'Literas para tripulación en vehículos especiales' },
  ],
  tapiceria: [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Cambio tapiz', alt: 'Cambio de tapiz en butacas — Utilcar' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Costuras reforzadas', alt: 'Tapicería vehicular con costuras reforzadas' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', title: 'Personalización', alt: 'Tapicería personalizada interior vehículo' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', title: 'Banquetas renovadas', alt: 'Renovación tapicería banquetas escolares' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', title: 'Interior premium', alt: 'Tapicería premium para transporte' },
  ],
}

const SHOWCASE_META = {
  eyebrow: 'Destacados',
  title: 'Referencias y trabajos',
  description: 'Selección de imágenes representativas de nuestro trabajo en este servicio.',
}

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

async function uploadImage(relativePath, alt) {
  if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ no encontrada: ${relativePath}`)
    return null
  }
  if (dryRun) {
    const ph = { _type: 'image', alt, _dry: true }
    uploadCache.set(relativePath, ph)
    return ph
  }
  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
  uploadCache.set(relativePath, ref)
  return ref
}

async function buildShowcaseImages(pageKey, uploadImageFn) {
  const entries = SHOWCASE_CATALOG[pageKey] ?? []
  const images = []
  for (const [index, entry] of entries.slice(0, 5).entries()) {
    const image = await uploadImageFn(entry.file, entry.alt)
    if (!image) continue
    images.push({
      _key: blockKey(`showcase-img-${pageKey}`, index),
      _type: 'showcaseCarouselBlockItem',
      image,
      alt: entry.alt,
      title: entry.title,
    })
  }
  return images
}

function buildShowcaseBlock(pageKey, images) {
  return {
    _type: 'showcaseCarouselBlock',
    _key: `showcase-${pageKey}`,
    enabled: true,
    order: 1,
    eyebrow: SHOWCASE_META.eyebrow,
    title: SHOWCASE_META.title,
    description: SHOWCASE_META.description,
    images,
  }
}

function insertAfterHero(blocks, showcaseBlock) {
  const list = structuredClone(blocks ?? [])
  const existingIdx = list.findIndex((b) => b._type === 'showcaseCarouselBlock')
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...showcaseBlock, _key: list[existingIdx]._key }
    return list.map((b, i) => ({ ...b, order: i }))
  }
  const heroIdx = list.findIndex((b) => b._type === 'heroBlock')
  const insertAt = heroIdx >= 0 ? heroIdx + 1 : 0
  list.splice(insertAt, 0, showcaseBlock)
  return list.map((b, i) => ({ ...b, order: i }))
}

const DOC_QUERY = `*[_id == $id][0]{ _id, _rev, pageKey, blocks }`

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE service showcases ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

let updated = 0
let imageTotal = 0

for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
  const docId = serviceSubPageDocumentId(pageKey)
  const doc = await client.fetch(DOC_QUERY, { id: docId })

  if (!doc) {
    console.warn(`✗ ${pageKey}: documento no existe`)
    continue
  }

  const hadShowcase = (doc.blocks ?? []).some((b) => b._type === 'showcaseCarouselBlock')
  const images = await buildShowcaseImages(pageKey, uploadImage)
  if (images.length < 5) {
    console.warn(`✗ ${title}: solo ${images.length}/5 imágenes`)
  }
  const showcaseBlock = buildShowcaseBlock(pageKey, images)
  const blocks = insertAfterHero(doc.blocks, showcaseBlock)

  console.info(
    `${hadShowcase ? '~' : '+'} ${title} (${pageKey}): showcase ${images.length} imgs, ${blocks.length} bloques`,
  )

  imageTotal += images.length

  if (apply && images.length >= 1) {
    await client.patch(docId).set({ blocks }).commit({ visibility: 'sync' })
    updated += 1
  }
}

console.info(`\nServicios procesados: ${SERVICE_SUB_PAGE_KEYS.length}`)
console.info(`Documentos actualizados: ${apply ? updated : 0} (dry-run: ${dryRun})`)
console.info(`Imágenes cargadas/planificadas: ${imageTotal}`)
console.info(apply ? '\n✓ Migración completada' : '\n[dry] Sin escritura en Sanity')
