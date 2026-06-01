import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalContactContent } from '@/lib/cms/localContent'
import { deepMerge } from '@/lib/cms/merge'
import { buildActiveContactContent } from '@/lib/cms/resolvers/contactPageResolver'
import { validateContent } from '@/lib/cms/validate'
import { ContactContentSchema } from '@/lib/schemas'
import { fetchContactPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:contact'

async function loadContactFromSanity() {
  const local = getValidatedLocalContactContent()
  const remote = await fetchContactPage()
  if (!remote) return { ...local, _contactSource: 'legacy' }

  const flatMerged = validateContent(
    ContactContentSchema,
    deepMerge(local, {
      hero: remote.hero,
      intro: remote.intro,
      details: remote.details,
      cta: remote.cta,
      map: remote.map,
      faq: remote.faq,
      form: remote.form,
      servicios: remote.servicios,
      faqItems: remote.faqItems,
    }),
    local,
    'sanity:contact-flat',
  )

  const active = buildActiveContactContent(flatMerged, remote)
  return validateContent(ContactContentSchema, active, local, 'sanity:contact')
}

async function resolveContactContent() {
  const local = getValidatedLocalContactContent()

  if (!isSanityEnabled()) {
    return { ...local, _contactSource: 'legacy' }
  }

  try {
    return await loadCached(CACHE_KEY, loadContactFromSanity)
  } catch {
    return { ...local, _contactSource: 'legacy' }
  }
}

export async function getContactContent() {
  return resolveContactContent()
}

export async function getContactHeroImage() {
  const content = await resolveContactContent()
  return content._heroImage ?? null
}

export async function getContactDisplay() {
  const content = await resolveContactContent()
  return {
    content,
    heroImage: content._heroImage ?? null,
    source: content._contactSource ?? 'legacy',
  }
}

export function getLocalContactContent() {
  return getValidatedLocalContactContent()
}
