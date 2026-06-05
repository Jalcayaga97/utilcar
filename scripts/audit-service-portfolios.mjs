/**

 * Auditoría portfolios de servicio — workProject por categoría.

 * npm run audit:service-portfolios

 */

import { createClient } from '@sanity/client'

import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

import { SERVICE_CATEGORY_KEYS } from '../src/lib/cms/constants/serviceCategories.js'

import { WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS } from '../src/constants/servicePortfolio.js'

import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'

import {

  SERVICE_SUB_PAGE_KEYS,

  serviceSubPageDocumentId,

} from '../utilcar-studio/schemas/content/serviceSubPage.js'



const sanityEnv = loadSanityEnv({ requireToken: false })

sanityEnv.applyToProcessEnv()



const client = createClient({

  projectId: sanityEnv.projectId,

  dataset: sanityEnv.dataset,

  apiVersion: '2024-05-28',

  token: sanityEnv.token || undefined,

  useCdn: false,

})



const issues = []

const warnings = []



function issue(code, message) {

  issues.push({ code, message })

}



function warn(code, message) {

  warnings.push({ code, message })

}



const projects = await client.fetch(WORK_PROJECTS_QUERY)

const byCategory = Object.fromEntries(SERVICE_CATEGORY_KEYS.map((k) => [k, []]))

for (const p of projects) {

  if (byCategory[p.serviceCategory]) byCategory[p.serviceCategory].push(p)

}



console.log('\n=== audit:service-portfolios ===\n')



for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {

  const doc = await client.fetch(

    `*[_id == $id][0]{

      "portfolioBlock": blocks[_type == "portfolioBlock"][0]{ items, title, eyebrow, description },

      "heroBlock": blocks[_type == "heroBlock"][0]{ highlights, image{ asset->{ url } } }

    }`,

    { id: serviceSubPageDocumentId(pageKey) },

  )



  const embedded = doc?.portfolioBlock?.items?.length ?? 0

  const hero = doc?.heroBlock

  const heroImg = Boolean(hero?.image?.asset?.url)

  const highlights = hero?.highlights?.length ?? 0

  const workCount = byCategory[pageKey]?.length ?? 0

  const workProjectOnly = WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS.has(pageKey)



  console.log(

    `• ${title}: ${workCount} workProject, ${embedded} embebidos, hero img: ${heroImg ? 'ok' : 'NO'}, highlights: ${highlights}`,

  )



  if (workCount === 0) {

    warn('no-projects', `${title}: sin proyectos workProject en CMS`)

  }

  if (workProjectOnly && embedded > 0) {

    issue('embedded-legacy', `${title}: ${embedded} ítems embebidos — eliminar (solo workProject)`)

  }

  if (!heroImg) {

    issue('missing-hero', `${title}: hero sin imagen publicada`)

  }

}



if (warnings.length) {

  console.log('\n--- Advertencias ---')

  for (const w of warnings) console.log(`⚠ [${w.code}] ${w.message}`)

}



if (issues.length) {

  console.log('\n--- Errores ---')

  for (const i of issues) console.log(`✗ [${i.code}] ${i.message}`)

  console.log(`\nFAIL (${issues.length})\n`)

  process.exit(1)

}



console.log('\nOK\n')


