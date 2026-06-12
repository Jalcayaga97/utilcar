import { isContactCmsActive, isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalContactContent } from '@/lib/cms/localContent'
import {
  emptyContactPageContent,
  mapContactPageRuntime,
} from '@/lib/cms/resolvers/contactPageResolver'
import { validateContent } from '@/lib/cms/validate'
import { ContactContentSchema } from '@/lib/schemas'
import { fetchContactPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:contact-page'

async function loadContactPageFromSanity() {
  const remote = await fetchContactPage()
  if (!remote) return null

  const resolved = {
    extensions: remote.extensions ?? {},
    _pageSource: remote._pageSource,
  }

  return mapContactPageRuntime(emptyContactPageContent(), resolved, {
    remote: {
      form: remote.form,
      blocks: remote.blocks,
      details: remote.details,
    },
  })
}

async function resolveContactPageBundle() {
  if (!isSanityEnabled() || !isContactCmsActive()) {
    return mapContactPageRuntime(getValidatedLocalContactContent(), {}, {})
  }

  try {
    return await loadCached(CACHE_KEY, loadContactPageFromSanity)
  } catch {
    return null
  }
}

function localContactPageDisplay() {
  const content = getValidatedLocalContactContent()
  return {
    content,
    heroImage: null,
    seo: null,
    source: 'legacy',
    isLoading: false,
  }
}

export async function getContactPageDisplay() {
  if (!isContactCmsActive()) {
    return localContactPageDisplay()
  }

  const bundle = await resolveContactPageBundle()
  if (!bundle || bundle._contactSource !== 'cms') {
    return null
  }

  const validated = validateContent(
    ContactContentSchema,
    bundle.content,
    getValidatedLocalContactContent(),
    'sanity:contact-page',
  )

  return {
    content: validated,
    heroImage: bundle.heroImage ?? null,
    seo: bundle.seo ?? null,
    source: 'cms',
    isLoading: false,
  }
}

/** Contenido editorial completo (formulario, FAQ, etc.). */
export async function getContactContent() {
  const display = await getContactPageDisplay()
  return display?.content ?? getValidatedLocalContactContent()
}

/** @deprecated Usar getContactPageDisplay */
export async function getContactDisplay() {
  return getContactPageDisplay()
}

export async function getContactHeroImage() {
  const display = await getContactPageDisplay()
  return display?.heroImage ?? null
}

export function getLocalContactContent() {
  return getValidatedLocalContactContent()
}
