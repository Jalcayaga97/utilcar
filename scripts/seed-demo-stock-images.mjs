/**

 * Reemplaza assets locales de showcase con fotos stock temporales (Unsplash/Pexels).

 * Genera WebP optimizado y opcionalmente re-sube a Sanity.

 *

 * npm run seed:demo-stock-images          # solo local, omite ya procesadas

 * npm run seed:demo-stock-images:cms      # local + subida CMS imágenes

 * npm run seed:demo-stock-images:audit    # auditoría previa sin cambios

 */

import { createClient } from '@sanity/client'

import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'

import { copyFile, stat, unlink, writeFile } from 'node:fs/promises'

import { randomBytes } from 'node:crypto'

import { tmpdir } from 'node:os'

import { basename, dirname, join, extname, normalize } from 'node:path'

import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { WEBP_QUALITY } from './webp-utils.js'

import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'



const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const TARGET_W = 1920

const TARGET_H = 1080

const applyCms = process.argv.includes('--cms')

const auditOnly = process.argv.includes('--audit')



/** @type {Record<string, { platform: string, url: string, title: string, theme: string, credit?: string }>} */

const STOCK_POOL = {

  van_cargo_side: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1768400554801-2002b63e0591?auto=format&fit=crop&w=2560&q=90',

    title: 'Furgón comercial blanco — vista lateral',

    theme: 'talleres-moviles',

    credit: 'Unsplash License',

  },

  van_sliding_door: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1775048071386-8e23d45a2b92?auto=format&fit=crop&w=2560&q=90',

    title: 'Furgón utilitario — puerta corrediza',

    theme: 'ventanas-lunetas',

    credit: 'Unsplash License',

  },

  van_ford_urban: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1567696154079-246a3d6b6fa5?auto=format&fit=crop&w=2560&q=90',

    title: 'Furgón blanco en entorno urbano',

    theme: 'talleres-moviles',

    credit: 'Unsplash License',

  },

  van_modern_ev: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1771207895109-0c09d6cd3f9b?auto=format&fit=crop&w=2560&q=90',

    title: 'Furgón eléctrico moderno',

    theme: 'talleres-moviles',

    credit: 'Unsplash License',

  },

  workshop_mechanic: {

    platform: 'Pexels',

    url: 'https://images.pexels.com/photos/3846390/pexels-photo-3846390.jpeg?auto=compress&cs=tinysrgb&w=2560',

    title: 'Taller mecánico — trabajo en vehículo',

    theme: 'talleres-moviles',

    credit: 'Andrea Piacquadio / Pexels',

  },

  bus_school_forward: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1764083029045-4c45c365b710?auto=format&fit=crop&w=2560&q=90',

    title: 'Interior bus escolar — vista frontal',

    theme: 'equipamiento-escolar',

    credit: 'Unsplash License',

  },

  bus_seats_empty: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1708728428878-f50ea36cc27f?auto=format&fit=crop&w=2560&q=90',

    title: 'Asientos vacíos — transporte pasajeros',

    theme: 'banquetas',

    credit: 'Unsplash License',

  },

  bus_seats_rows: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1680365498038-94a268b2130e?auto=format&fit=crop&w=2560&q=90',

    title: 'Filas de asientos en bus',

    theme: 'butacas',

    credit: 'Unsplash License',

  },

  bus_interior_modern: {

    platform: 'Pexels',

    url: 'https://images.pexels.com/photos/18893549/pexels-photo-18893549.jpeg?auto=compress&cs=tinysrgb&w=2560',

    title: 'Interior bus moderno y luminoso',

    theme: 'transporte-pasajeros',

    credit: 'Thanh Long Bùi / Pexels',

  },

  school_bus_road: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1602248406547-bda7af9fb7e9?auto=format&fit=crop&w=2560&q=90',

    title: 'Bus escolar amarillo en ruta',

    theme: 'conversiones',

    credit: 'Unsplash License',

  },

  school_bus_building: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1714742016775-111a6d5768f9?auto=format&fit=crop&w=2560&q=90',

    title: 'Bus escolar frente a edificio',

    theme: 'equipamiento-escolar',

    credit: 'Unsplash License',

  },

  school_bus_street: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1778084765778-52cc028571d5?auto=format&fit=crop&w=2560&q=90',

    title: 'Bus escolar en calle urbana',

    theme: 'conversiones',

    credit: 'Unsplash License',

  },

  leather_seat_black: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1614530499660-fe1fbd7921d6?auto=format&fit=crop&w=2560&q=90',

    title: 'Asiento cuero negro — detalle tapicería',

    theme: 'tapiceria',

    credit: 'Unsplash License',

  },

  leather_interior_red: {

    platform: 'Unsplash',

    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2560&q=90',

    title: 'Interior automotriz — cuero y costuras',

    theme: 'tapiceria',

    credit: 'Unsplash License',

  },

  workshop_service: {

    platform: 'Pexels',

    url: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=2560',

    title: 'Servicio automotriz en taller',

    theme: 'tapiceria',

    credit: 'cottonbro studio / Pexels',

  },

}



const CROP_VARIANTS = ['center', 'left', 'right', 'top', 'bottom', 'entropy', 'attention']



/**

 * @type {Array<{ rel: string, stock: string, crop?: string, cms: string[] }>}

 */

const FILE_ASSIGNMENTS = [

  { rel: 'src/assets/images/talleres/tr143.jpg', stock: 'van_cargo_side', crop: 'center', cms: ['homePage.showcaseCarouselBlock[4]', 'serviceSubPage.talleres-moviles.showcase[0]', 'serviceSubPage.proteccion-cabina.showcase[2]', 'aboutPage.heroBlock (fallback local)'] },

  { rel: 'src/assets/images/talleres/tr247.jpg', stock: 'workshop_mechanic', crop: 'center', cms: ['serviceSubPage.talleres-moviles.showcase[1]', 'serviceSubPage.literas.showcase[3]'] },

  { rel: 'src/assets/images/talleres/tr11.jpg', stock: 'van_sliding_door', crop: 'left', cms: ['homePage.showcaseCarouselBlock[3]', 'serviceSubPage.talleres-moviles.showcase[2]', 'serviceSubPage.proteccion-cabina.showcase[3]'] },

  { rel: 'src/assets/images/talleres/tr12.jpg', stock: 'van_modern_ev', crop: 'right', cms: ['serviceSubPage.talleres-moviles.showcase[3]', 'serviceSubPage.cambio-pisos.showcase[3]'] },

  { rel: 'src/assets/images/talleres/tr9.jpg', stock: 'van_ford_urban', crop: 'center', cms: ['serviceSubPage.talleres-moviles.showcase[4]', 'serviceSubPage.literas.showcase[2]'] },



  { rel: 'src/assets/images/ventanas/vent1.jpg', stock: 'van_cargo_side', crop: 'right', cms: ['homePage.showcaseCarouselBlock[2]', 'serviceSubPage.ventanas-lunetas.showcase[0]'] },

  { rel: 'src/assets/images/ventanas/vent2.jpg', stock: 'van_sliding_door', crop: 'entropy', cms: ['serviceSubPage.ventanas-lunetas.showcase[1]', 'serviceSubPage.proteccion-cabina.showcase[4]'] },

  { rel: 'src/assets/images/ventanas/vent3.jpg', stock: 'van_ford_urban', crop: 'left', cms: ['serviceSubPage.ventanas-lunetas.showcase[2]'] },

  { rel: 'src/assets/images/ventanas/marcas/toyota/toyota.jpg', stock: 'van_cargo_side', crop: 'attention', cms: ['serviceSubPage.ventanas-lunetas.showcase[3]'] },

  { rel: 'src/assets/images/ventanas/marcas/chevrolet/chev1.jpg', stock: 'van_modern_ev', crop: 'bottom', cms: ['serviceSubPage.ventanas-lunetas.showcase[4]'] },



  { rel: 'src/assets/images/escolar/ee350.jpg', stock: 'bus_school_forward', crop: 'center', cms: ['serviceSubPage.equipamiento-escolar.showcase[0]', 'serviceSubPage.cambio-pisos.showcase[2]'] },

  { rel: 'src/assets/images/escolar/ee351.jfif', stock: 'bus_seats_empty', crop: 'center', cms: ['serviceSubPage.equipamiento-escolar.showcase[1]'] },

  { rel: 'src/assets/images/escolar/ee352.jpg', stock: 'bus_interior_modern', crop: 'top', cms: ['serviceSubPage.equipamiento-escolar.showcase[2]'] },

  { rel: 'public/imagenes/conversiones buses ecolares/escolar01.jpg', stock: 'school_bus_road', crop: 'center', cms: ['serviceSubPage.equipamiento-escolar.showcase[3]'] },

  { rel: 'src/assets/images/accesorios/distintivo-escolar/esc.jpg', stock: 'school_bus_building', crop: 'right', cms: ['serviceSubPage.equipamiento-escolar.showcase[4]', 'serviceSubPage.accesorios.showcase[3]'] },



  { rel: 'src/assets/images/banquetas/escolares/banq_esc.jpg', stock: 'bus_seats_empty', crop: 'entropy', cms: ['homePage.showcaseCarouselBlock[0]', 'serviceSubPage.banquetas.showcase[0]', 'serviceSubPage.fundas.showcase[0]', 'serviceSubPage.tapiceria.showcase[3]'] },

  { rel: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', stock: 'bus_school_forward', crop: 'bottom', cms: ['serviceSubPage.banquetas.showcase[1]', 'serviceSubPage.fundas.showcase[1]'] },

  { rel: 'src/assets/images/banquetas/escolares/banq_esc2.jpg', stock: 'bus_interior_modern', crop: 'left', cms: ['serviceSubPage.cambio-pisos.showcase[0]'] },

  { rel: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', stock: 'bus_seats_rows', crop: 'center', cms: ['serviceSubPage.banquetas.showcase[2]', 'serviceSubPage.literas.showcase[0]'] },

  { rel: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg', stock: 'bus_seats_empty', crop: 'right', cms: ['serviceSubPage.banquetas.showcase[3]', 'serviceSubPage.literas.showcase[1]'] },

  { rel: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg', stock: 'bus_interior_modern', crop: 'attention', cms: ['serviceSubPage.butacas.showcase[4]', 'serviceSubPage.cambio-pisos.showcase[1]'] },

  { rel: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', stock: 'leather_seat_black', crop: 'center', cms: ['serviceSubPage.banquetas.showcase[4]', 'serviceSubPage.reclinaciones.showcase[3]', 'serviceSubPage.tapiceria.showcase[4]'] },

  { rel: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', stock: 'leather_interior_red', crop: 'left', cms: ['serviceSubPage.butacas.showcase[3]', 'serviceSubPage.reclinaciones.showcase[4]'] },



  { rel: 'src/assets/images/butacas/IMG_0148.jfif', stock: 'leather_seat_black', crop: 'attention', cms: ['homePage.showcaseCarouselBlock[1]', 'serviceSubPage.butacas.showcase[0]', 'serviceSubPage.proteccion-cabina.showcase[0]', 'serviceSubPage.reclinaciones.showcase[0]', 'serviceSubPage.fundas.showcase[2]', 'serviceSubPage.tapiceria.showcase[0]'] },

  { rel: 'src/assets/images/butacas/IMG_0149.jfif', stock: 'leather_interior_red', crop: 'center', cms: ['serviceSubPage.butacas.showcase[1]', 'serviceSubPage.proteccion-cabina.showcase[1]', 'serviceSubPage.reclinaciones.showcase[1]', 'serviceSubPage.fundas.showcase[3]', 'serviceSubPage.tapiceria.showcase[1]'] },

  { rel: 'src/assets/images/butacas/IMG_0150.jfif', stock: 'bus_seats_rows', crop: 'top', cms: ['serviceSubPage.butacas.showcase[2]', 'serviceSubPage.reclinaciones.showcase[2]', 'serviceSubPage.literas.showcase[4]', 'serviceSubPage.tapiceria.showcase[2]'] },



  { rel: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg', stock: 'leather_seat_black', crop: 'top', cms: ['serviceSubPage.accesorios.showcase[0]'] },

  { rel: 'src/assets/images/accesorios/apoya-brazos/apoya_brazos.jpg', stock: 'leather_interior_red', crop: 'right', cms: ['serviceSubPage.accesorios.showcase[1]'] },

  { rel: 'src/assets/images/accesorios/balizas/baliza.jpg', stock: 'school_bus_road', crop: 'left', cms: ['serviceSubPage.accesorios.showcase[2]'] },

  { rel: 'src/assets/images/services/accesorios.jpg', stock: 'van_ford_urban', crop: 'center', cms: ['serviceSubPage.accesorios.showcase[4]', 'homePage.servicesBlock card'] },

  { rel: 'src/assets/images/services/banquetas.jpg', stock: 'bus_seats_empty', crop: 'center', cms: ['serviceSubPage.cambio-pisos.showcase[4]', 'serviceSubPage.fundas.showcase[4]'] },



  { rel: 'src/assets/images/hero.jpg', stock: 'school_bus_street', crop: 'center', cms: ['homePage.heroBlock (fallback local)'] },

  { rel: 'src/assets/images/services/talleres.jpg', stock: 'van_cargo_side', crop: 'entropy', cms: ['homePage.servicesBlock card'] },

  { rel: 'src/assets/images/services/ventanas.jpg', stock: 'van_sliding_door', crop: 'center', cms: ['homePage.servicesBlock card'] },

  { rel: 'src/assets/images/services/escolar.jpg', stock: 'school_bus_road', crop: 'center', cms: ['homePage.servicesBlock card'] },

  { rel: 'src/assets/images/services/butacas.jfif', stock: 'leather_seat_black', crop: 'center', cms: ['homePage.servicesBlock card'] },

]



const downloadCache = new Map()



function absPath(rel) {

  return normalize(join(WEB_ROOT, rel))

}



function isTargetResolution(width, height) {

  return width === TARGET_W && height === TARGET_H

}



async function readRasterMeta(abs) {

  if (!existsSync(abs)) return null

  try {

    const meta = await sharp(abs).metadata()

    const { size } = await stat(abs)

    return { width: meta.width, height: meta.height, size }

  } catch {

    return null

  }

}



async function isAlreadyProcessed(abs) {

  const meta = await readRasterMeta(abs)

  if (!meta) return false

  return isTargetResolution(meta.width, meta.height)

}



async function auditAssignments() {

  const completed = []

  const pending = []



  for (const [index, entry] of FILE_ASSIGNMENTS.entries()) {

    const abs = absPath(entry.rel)

    const meta = await readRasterMeta(abs)

    const done = meta && isTargetResolution(meta.width, meta.height)

    const row = {

      index: index + 1,

      rel: entry.rel,

      resolucion: meta ? `${meta.width}x${meta.height}` : 'missing',

      peso: meta ? meta.size : 0,

    }

    if (done) completed.push(row)

    else pending.push(row)

  }



  return { completed, pending, resumeAt: pending[0] ?? null }

}



/** Escritura robusta en Windows: temp sin espacios → copy atómico al destino. */

async function writeBufferToPath(outPath, buffer) {

  const dir = dirname(outPath)

  mkdirSync(dir, { recursive: true })



  const tempPath = join(tmpdir(), `utilcar-seed-${randomBytes(8).toString('hex')}.jpg`)

  try {

    await writeFile(tempPath, buffer)

    if (existsSync(outPath)) {

      try {

        await unlink(outPath)

      } catch {

        // destino bloqueado: intentar sobrescribir vía copy

      }

    }

    await copyFile(tempPath, outPath)

  } finally {

    try {

      await unlink(tempPath)

    } catch {

      // ignore

    }

  }

}



async function downloadStock(stockKey) {

  if (downloadCache.has(stockKey)) return downloadCache.get(stockKey)

  const meta = STOCK_POOL[stockKey]

  if (!meta) throw new Error(`Stock desconocido: ${stockKey}`)



  const res = await fetch(meta.url, {

    headers: { 'User-Agent': 'utilcar-demo-seed/1.0' },

    redirect: 'follow',

  })

  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${stockKey}`)

  const buf = Buffer.from(await res.arrayBuffer())

  downloadCache.set(stockKey, buf)

  return buf

}



async function writeRaster(outPath, buffer, crop = 'center') {

  const pipeline = sharp(buffer).rotate().resize(TARGET_W, TARGET_H, {

    fit: 'cover',

    position: crop,

  })

  const outBuf = await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer()

  await writeBufferToPath(outPath, outBuf)

}



async function writeWebpSidecar(rasterPath) {

  const webpPath = rasterPath.replace(/\.(jpe?g|png|jfif)$/i, '.webp')

  const webpBuf = await sharp(rasterPath).webp({ quality: WEBP_QUALITY }).toBuffer()

  await writeBufferToPath(webpPath, webpBuf)

  return webpPath

}



function formatBytes(n) {

  if (n < 1024) return `${n} B`

  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`

  return `${(n / (1024 * 1024)).toFixed(2)} MB`

}



async function buildReportRow(entry, stock, abs, webpPath, status) {

  const rasterStat = await sharp(abs).metadata()

  const { size: rasterSize } = await stat(abs)

  const { size: webpSize } = await stat(webpPath)



  return {

    archivo: entry.rel,

    status,

    imagen: stock.title,

    plataforma: stock.platform,

    tema: stock.theme,

    credito: stock.credit ?? stock.platform,

    resolucion: `${rasterStat.width}x${rasterStat.height}`,

    pesoRaster: formatBytes(rasterSize),

    pesoWebp: formatBytes(webpSize),

    pesoRasterBytes: rasterSize,

    pesoWebpBytes: webpSize,

    ubicacionLocal: abs,

    ubicacionWebp: webpPath,

    ubicacionCms: entry.cms,

  }

}



async function patchAboutHero(client, heroPath) {

  const doc = await client.fetch(`*[_id == "aboutPage"][0]{ _id, blocks }`)

  if (!doc?.blocks?.length) {

    console.warn('  ⚠ aboutPage sin bloques — omitiendo hero CMS')

    return false

  }

  const heroIdx = doc.blocks.findIndex((b) => b._type === 'heroBlock')

  if (heroIdx < 0) {

    console.warn('  ⚠ aboutPage sin heroBlock')

    return false

  }



  const abs = absPath(heroPath)

  const asset = await client.assets.upload('image', createReadStream(abs), {

    filename: basename(abs),

  })

  const blocks = structuredClone(doc.blocks)

  blocks[heroIdx] = {

    ...blocks[heroIdx],

    image: {

      _type: 'image',

      asset: { _type: 'reference', _ref: asset._id },

      alt: blocks[heroIdx].imageAlt || 'Taller Utilcar — conversiones automotrices',

    },

  }

  await client.patch('aboutPage').set({ blocks }).commit({ visibility: 'sync' })

  return true

}



async function runCmsMigration() {

  const e = loadSanityEnv({ requireToken: true })

  e.applyToProcessEnv()



  const client = createClient({

    projectId: e.projectId,

    dataset: e.dataset,

    apiVersion: '2024-05-28',

    token: e.token,

    useCdn: false,

  })



  console.info('\n── Subiendo showcases a Sanity (solo imágenes) ──\n')



  const { execSync } = await import('node:child_process')

  execSync('node scripts/migrate-home-showcase.mjs --apply', {

    cwd: WEB_ROOT,

    stdio: 'inherit',

    env: process.env,

  })

  execSync('node scripts/migrate-service-showcases.mjs --apply', {

    cwd: WEB_ROOT,

    stdio: 'inherit',

    env: process.env,

  })



  console.info('\n── About hero image ──\n')

  const aboutOk = await patchAboutHero(client, 'src/assets/images/talleres/tr143.jpg')

  console.info(aboutOk ? '  ✓ aboutPage.heroBlock.image actualizado' : '  ⚠ about hero no actualizado')



  return {

    homeShowcase: true,

    serviceShowcases: true,

    aboutHero: aboutOk,

  }

}



function printAudit(audit, label) {

  console.info(`\n── ${label} ──`)

  console.info(`Completadas (${audit.completed.length}/${FILE_ASSIGNMENTS.length}):`)

  for (const row of audit.completed) {

    console.info(`  #${row.index} ✓ ${row.rel} (${row.resolucion})`)

  }

  console.info(`Pendientes (${audit.pending.length}/${FILE_ASSIGNMENTS.length}):`)

  for (const row of audit.pending) {

    console.info(`  #${row.index} ○ ${row.rel} (${row.resolucion})`)

  }

  if (audit.resumeAt) {

    console.info(`\n→ Reanudar en #${audit.resumeAt.index}: ${audit.resumeAt.rel}`)

  } else {

    console.info('\n→ Todas las imágenes ya están procesadas.')

  }

}



console.info('\n══════════════════════════════════════')

console.info('  SEED demo stock images (temporales)')

console.info('══════════════════════════════════════')



const auditBefore = await auditAssignments()

printAudit(auditBefore, 'Auditoría BEFORE')



if (auditOnly) {

  process.exit(0)

}



const report = []

let processed = 0

let skipped = 0



for (const [index, entry] of FILE_ASSIGNMENTS.entries()) {

  const abs = absPath(entry.rel)

  const stock = STOCK_POOL[entry.stock]

  const crop = entry.crop ?? CROP_VARIANTS[index % CROP_VARIANTS.length]



  if (await isAlreadyProcessed(abs)) {

    skipped += 1

    const webpPath = abs.replace(/\.(jpe?g|png|jfif)$/i, '.webp')

    report.push(await buildReportRow(entry, stock, abs, webpPath, 'skipped'))

    console.info(`↷ omitida #${index + 1} ${entry.rel} (ya ${TARGET_W}x${TARGET_H})`)

    continue

  }



  const sourceBuf = await downloadStock(entry.stock)

  await writeRaster(abs, sourceBuf, crop)

  const webpPath = await writeWebpSidecar(abs)

  report.push(await buildReportRow(entry, stock, abs, webpPath, 'processed'))

  processed += 1

  console.info(`✓ procesada #${index + 1} ${entry.rel} ← ${stock.platform}: ${stock.title}`)

}



const auditAfterLocal = await auditAssignments()

printAudit(auditAfterLocal, 'Auditoría AFTER (local)')



const reportPath = join(WEB_ROOT, 'docs', 'DEMO_STOCK_IMAGES_REPORT.json')

mkdirSync(dirname(reportPath), { recursive: true })



const at1080 = report.filter((r) => r.resolucion === `${TARGET_W}x${TARGET_H}`).length



const reportPayload = {

  generatedAt: new Date().toISOString(),

  summary: {

    total: FILE_ASSIGNMENTS.length,

    processedThisRun: processed,

    skippedThisRun: skipped,

    at1920x1080: at1080,

    pendingAfterRun: auditAfterLocal.pending.length,

  },

  cmsUpload: null,

  items: report,

}



writeFileSync(reportPath, JSON.stringify(reportPayload, null, 2))



console.info(`\n── Resumen local ──`)

console.info(`Procesadas esta corrida: ${processed}`)

console.info(`Omitidas (ya listas):    ${skipped}`)

console.info(`Total @ 1920x1080:       ${at1080}/${FILE_ASSIGNMENTS.length}`)

console.info(`Peso total raster:       ${formatBytes(report.reduce((n, r) => n + r.pesoRasterBytes, 0))}`)

console.info(`Peso total WebP:         ${formatBytes(report.reduce((n, r) => n + r.pesoWebpBytes, 0))}`)

console.info(`Reporte JSON:            ${reportPath}`)



if (auditAfterLocal.pending.length > 0) {

  console.error(`\n✗ Quedan ${auditAfterLocal.pending.length} imágenes pendientes — CMS no ejecutado.`)

  process.exit(1)

}



let cmsResult = null

if (applyCms) {

  cmsResult = await runCmsMigration()

  reportPayload.cmsUpload = {

    executedAt: new Date().toISOString(),

    ...cmsResult,

    targets: [

      'homePage.showcaseCarouselBlock (5 imgs)',

      'serviceSubPage.showcaseCarouselBlock × 12 (5 imgs c/u)',

      'aboutPage.heroBlock.image',

    ],

  }

  writeFileSync(reportPath, JSON.stringify(reportPayload, null, 2))

  console.info('\n── CMS upload ──')

  console.info('  ✓ homePage showcaseCarouselBlock')

  console.info('  ✓ serviceSubPage showcaseCarouselBlock (×12)')

  console.info(cmsResult.aboutHero ? '  ✓ aboutPage.heroBlock.image' : '  ⚠ aboutPage.heroBlock.image omitido')

} else {

  console.info('\nPara subir a Sanity: npm run seed:demo-stock-images:cms')

}



console.info('\n✓ Demo stock images completadas\n')


