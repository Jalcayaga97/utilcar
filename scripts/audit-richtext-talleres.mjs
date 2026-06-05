/**
 * Auditoría richTextBlock — talleres-moviles
 * node scripts/audit-richtext-talleres.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageQuery, HOME_BLOCKS_PROJECTION } from '../src/lib/sanity/queries.js'
import { portableTextToParagraphs, richTextSectionContract } from '../src/lib/cms/contracts/richTextBlockContract.js'

const PAGE_KEY = 'talleres-moviles'

const env = loadSanityEnv({ requireToken: false })
env.applyToProcessEnv()
const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const fullQuery = `*[_type == "serviceSubPage" && pageKey == $pageKey][0]{
  blocks[]{ _type, _key, eyebrow, title, body }
}`
const full = await client.fetch(fullQuery, { pageKey: PAGE_KEY })
const rtFull = full?.blocks?.find((b) => b._type === 'richTextBlock')

const projected = await client.fetch(serviceSubPageQuery(PAGE_KEY))
const rtGroq = projected?.blocks?.find((b) => b._type === 'richTextBlock')

const contractFromFull = richTextSectionContract(rtFull)
const contractFromGroq = richTextSectionContract(rtGroq)

console.log('=== CMS (body explícito en query) ===')
console.log(
  JSON.stringify(
    {
      _type: rtFull?._type,
      eyebrow: rtFull?.eyebrow,
      title: rtFull?.title,
      bodyPortableBlocks: rtFull?.body?.length ?? 0,
      paragraphs: contractFromFull.paragraphs,
      paragraphCount: contractFromFull.paragraphs.length,
    },
    null,
    2,
  ),
)

console.log('\n=== GROQ PAGE_BLOCKS_PROJECTION ===')
console.log('includes "body":', HOME_BLOCKS_PROJECTION.includes('body'))
console.log('includes "content":', HOME_BLOCKS_PROJECTION.includes('content'))
console.log('includes "portableText":', HOME_BLOCKS_PROJECTION.includes('portableText'))
console.log(
  JSON.stringify(
    {
      eyebrow: rtGroq?.eyebrow,
      title: rtGroq?.title,
      bodyPresent: rtGroq?.body != null,
      bodyLength: rtGroq?.body?.length ?? 0,
      keysOnBlock: rtGroq ? Object.keys(rtGroq) : [],
      paragraphs: contractFromGroq.paragraphs,
      paragraphCount: contractFromGroq.paragraphs.length,
    },
    null,
    2,
  ),
)
