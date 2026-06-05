/**

 * Sube imágenes locales faltantes en proyectos CMS.

 * npm run repair:work-project-images

 */

import { createClient } from '@sanity/client'

import { createReadStream, existsSync } from 'node:fs'

import { basename, dirname, join } from 'node:path'

import { fileURLToPath } from 'node:url'

import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'



const __dirname = dirname(fileURLToPath(import.meta.url))

const WEB_ROOT = join(__dirname, '..')



const LOCAL_BY_ID = {

  'TM-001': { file: 'src/assets/images/talleres/tr143.jpg', alt: 'Taller móvil equipado en terreno' },

  'TM-003': { file: 'src/assets/images/trabajos/taller-hiace.jpg', alt: 'Taller móvil Toyota Hiace' },

  'VL-001': { file: 'src/assets/images/trabajos/ventanas-master.jpg', alt: 'Ventanas Renault Master' },

  'EE-001': { file: 'src/assets/images/escolar/ee350.jpg', alt: 'Flota escolar Mercedes Sprinter' },

}



const sanityEnv = loadSanityEnv({ requireToken: true })

sanityEnv.applyToProcessEnv()



const client = createClient({

  projectId: sanityEnv.projectId,

  dataset: sanityEnv.dataset,

  apiVersion: '2024-05-28',

  token: sanityEnv.token,

  useCdn: false,

})



const cache = new Map()

let uploaded = 0

let patched = 0



async function uploadImage(relativePath, alt) {

  if (!relativePath) return null

  if (cache.has(relativePath)) return cache.get(relativePath)

  const abs = join(WEB_ROOT, relativePath)

  if (!existsSync(abs)) {

    console.warn(`⚠ archivo no encontrado: ${relativePath}`)

    return null

  }

  const asset = await client.assets.upload('image', createReadStream(abs), {

    filename: basename(abs),

  })

  const ref = {

    _type: 'image',

    asset: { _type: 'reference', _ref: asset._id },

    alt: alt || basename(abs),

  }

  cache.set(relativePath, ref)

  uploaded++

  return ref

}



const projects = await client.fetch(

  `*[_type == "workProject"]{ _id, "id": coalesce(projectId.current, projectId), image }`,

)



for (const doc of projects) {

  const patch = {}

  const local = LOCAL_BY_ID[doc.id]

  if (local && !doc.image?.asset?._ref) {

    const image = await uploadImage(local.file, local.alt)

    if (image) patch.image = image

  }

  if (Object.keys(patch).length) {

    await client.patch(doc._id).set(patch).commit()

    patched++

    console.log(`✓ ${doc.id}`, Object.keys(patch).join(', '))

  }

}



console.log(`\nReparados: ${patched}, imágenes subidas: ${uploaded}\n`)


