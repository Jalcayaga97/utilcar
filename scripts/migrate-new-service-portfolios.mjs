/**
 * Crea workProjects para servicios nuevos (mín. 3 por categoría).
 * npm run migrate:new-service-portfolios:dry
 * npm run migrate:new-service-portfolios
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const PORTFOLIO_CATALOG = [
  {
    serviceCategory: 'proteccion-cabina',
    projects: [
      {
        id: 'PC-001',
        title: 'Protección cabina furgón corporativo',
        description: 'Revestimiento interior de cabina para furgón de flota corporativa.',
        imageFile: 'src/assets/images/butacas/IMG_0148.jfif',
      },
      {
        id: 'PC-002',
        title: 'Protección cabina utilitario',
        description: 'Paneles y zonas de contacto protegidas en utilitario de trabajo.',
        imageFile: 'src/assets/images/butacas/IMG_0149.jfif',
      },
      {
        id: 'PC-003',
        title: 'Protección interior cabina doble',
        description: 'Terminaciones resistentes en cabina conductor y acompañante.',
        imageFile: 'src/assets/images/butacas/IMG_0150.jfif',
      },
    ],
  },
  {
    serviceCategory: 'cambio-pisos',
    projects: [
      {
        id: 'CP-001',
        title: 'Cambio de piso minibús',
        description: 'Renovación de piso técnico en minibús de transporte de personal.',
        imageFile: 'src/assets/images/banquetas/escolares/banq_esc.jpg',
      },
      {
        id: 'CP-002',
        title: 'Piso interior furgón convertido',
        description: 'Instalación de piso antideslizante en furgón de traslado.',
        imageFile: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg',
      },
      {
        id: 'CP-003',
        title: 'Piso técnico vehículo especial',
        description: 'Terminaciones en bordes y zonas de acceso en conversión a medida.',
        imageFile: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg',
      },
    ],
  },
  {
    serviceCategory: 'reclinaciones',
    projects: [
      {
        id: 'RL-001',
        title: 'Reclinación butacas ejecutivas',
        description: 'Mecanismo reclinable en butacas para transporte ejecutivo.',
        imageFile: 'src/assets/images/butacas/IMG_0148.jfif',
      },
      {
        id: 'RL-002',
        title: 'Reclinación banquetas turismo',
        description: 'Sistema reclinable integrado en banquetas de turismo.',
        imageFile: 'src/assets/images/butacas/IMG_0149.jfif',
      },
      {
        id: 'RL-003',
        title: 'Ajuste mecanismo reclinable',
        description: 'Instalación y prueba de reclinación en asiento a medida.',
        imageFile: 'src/assets/images/butacas/IMG_0150.jfif',
      },
    ],
  },
  {
    serviceCategory: 'fundas',
    projects: [
      {
        id: 'FD-001',
        title: 'Fundas butacas flota corporativa',
        description: 'Fundas a medida para uniformar tapicería de flota.',
        imageFile: 'src/assets/images/butacas/IMG_0148.jfif',
      },
      {
        id: 'FD-002',
        title: 'Fundas protección transporte',
        description: 'Fundas lavables para protección de asientos en uso intensivo.',
        imageFile: 'src/assets/images/butacas/IMG_0149.jfif',
      },
      {
        id: 'FD-003',
        title: 'Fundas banquetas escolares',
        description: 'Fundas decorativas y de protección para banquetas escolares.',
        imageFile: 'src/assets/images/banquetas/escolares/banq_esc2.jpg',
      },
    ],
  },
  {
    serviceCategory: 'tapiceria',
    projects: [
      {
        id: 'TP-001',
        title: 'Cambio de tapiz butacas flota',
        description: 'Renovación integral de tapizados en butacas de transporte corporativo.',
        imageFile: 'src/assets/images/butacas/IMG_0148.jfif',
      },
      {
        id: 'TP-002',
        title: 'Reparación tapicería banquetas',
        description: 'Reparación de costuras y espuma en banquetas escolares.',
        imageFile: 'src/assets/images/banquetas/escolares/banq_esc1.jpg',
      },
      {
        id: 'TP-003',
        title: 'Personalización interior ejecutivo',
        description: 'Tapicería premium y detalles de confort en transporte ejecutivo.',
        imageFile: 'src/assets/images/butacas/IMG_0150.jfif',
      },
    ],
  },
  {
    serviceCategory: 'literas',
    projects: [
      {
        id: 'LT-001',
        title: 'Literas furgón tripulación',
        description: 'Literas instaladas en zona de descanso para tripulación.',
        imageFile: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg',
      },
      {
        id: 'LT-002',
        title: 'Literas vehículo especial',
        description: 'Estructura reforzada con anclajes seguros en conversión interior.',
        imageFile: 'src/assets/images/banquetas/adultos/IMG_0118.jfif',
      },
      {
        id: 'LT-003',
        title: 'Literas transporte larga distancia',
        description: 'Configuración de literas según batalla y altura interior.',
        imageFile: 'src/assets/images/banquetas/adultos/IMG_0120.jfif',
      },
    ],
  },
]

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const imageCache = new Map()

async function uploadImage(relativePath, alt) {
  if (imageCache.has(relativePath)) return imageCache.get(relativePath)
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ imagen no encontrada: ${relativePath}`)
    imageCache.set(relativePath, null)
    return null
  }
  if (dryRun) {
    const placeholder = { _type: 'image', _dry: true, alt }
    imageCache.set(relativePath, placeholder)
    return placeholder
  }
  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: alt || basename(abs),
  }
  imageCache.set(relativePath, ref)
  return ref
}

const COUNT_QUERY = `*[_type == "workProject" && serviceCategory == $cat]{ projectId, "id": projectId.current }`

async function main() {
  console.info('\n[migrate:new-service-portfolios]\n')

  for (const group of PORTFOLIO_CATALOG) {
    const existing = await client.fetch(COUNT_QUERY, { cat: group.serviceCategory })
    const existingIds = new Set(existing.map((p) => p.id ?? p.projectId?.current))
    console.info(`── ${group.serviceCategory} (existentes: ${existing.length}) ──`)

    let order = existing.length
    for (const project of group.projects) {
      if (existingIds.has(project.id)) {
        console.info(`  · ${project.id} ya existe — omitido`)
        continue
      }
      const image = await uploadImage(project.imageFile, project.title)
      if (!image && apply) {
        console.warn(`  ✗ ${project.id} — sin imagen, omitido`)
        continue
      }
      order += 1
      const doc = {
        _id: `workProject-${project.id}`,
        _type: 'workProject',
        schemaVersion: SCHEMA_VERSION_VALUE,
        projectId: { _type: 'slug', current: project.id },
        title: project.title,
        serviceCategory: group.serviceCategory,
        description: project.description,
        client: '',
        vehicle: '',
        visible: true,
        featured: false,
        homeVisible: false,
        order,
        ...(image && !image._dry ? { image } : {}),
      }

      if (dryRun) {
        console.info(`  [dry] + ${project.id} — ${project.title}`)
      } else if (image && !image._dry) {
        await client.createOrReplace(doc)
        console.info(`  + ${project.id} — ${project.title}`)
      }
    }
  }

  console.info('\n── AFTER counts ──')
  for (const group of PORTFOLIO_CATALOG) {
    const count = await client.fetch(`count(*[_type == "workProject" && serviceCategory == $cat && visible != false])`, {
      cat: group.serviceCategory,
    })
    console.info(`  ${group.serviceCategory}: ${count} proyectos`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
