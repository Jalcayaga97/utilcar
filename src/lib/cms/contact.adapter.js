import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalContactContent } from '@/lib/cms/localContent'
import { deepMerge } from '@/lib/cms/merge'
import { validateContent } from '@/lib/cms/validate'
import { ContactContentSchema } from '@/lib/schemas'
import { fetchContactPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:contact'

async function loadContactFromSanity() {
  const local = getValidatedLocalContactContent()
  const remote = await fetchContactPage()
  if (!remote) return local

  const merged = deepMerge(local, {
    hero: remote.hero,
    intro: remote.intro,
    details: remote.details,
    cta: remote.cta,
    map: remote.map,
    faq: remote.faq,
    form: remote.form,
    servicios: remote.servicios,
    faqItems: remote.faqItems,
  })

  return validateContent(ContactContentSchema, merged, local, 'sanity:contact')
}

async function resolveContactContent() {
  const local = getValidatedLocalContactContent()

  if (!isSanityEnabled()) {
    return local
  }

  try {
    return await loadCached(CACHE_KEY, loadContactFromSanity)
  } catch {
    return local
  }
}

/**
 * Contenido Contacto — validado, cacheado, fallback local garantizado.
 */
export async function getContactContent() {
  return resolveContactContent()
}

export function getLocalContactContent() {
  return getValidatedLocalContactContent()
}
