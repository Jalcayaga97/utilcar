import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalContactContent } from '@/lib/cms/localContent'
import {
  buildActiveContactBundle,
  mapContactPageRuntime,
} from '@/lib/cms/resolvers/contactPageResolver'
import { validateContent } from '@/lib/cms/validate'
import { ContactContentSchema } from '@/lib/schemas'
import { fetchContactPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:contact-page'

async function loadContactPageFromSanity() {
  const local = getValidatedLocalContactContent()
  const remote = await fetchContactPage()

  if (!remote) {
    return mapContactPageRuntime(local, {}, { remote: null })
  }

  const resolved = {
    extensions: remote.extensions ?? {},
    _pageSource: remote._pageSource,
  }

  return mapContactPageRuntime(local, resolved, {
    remote: {
      form: remote.form,
      servicios: remote.servicios,
    },
  })
}

async function resolveContactPageBundle() {
  const local = getValidatedLocalContactContent()

  if (!isSanityEnabled()) {
    return mapContactPageRuntime(local, {}, {})
  }

  try {
    return await loadCached(CACHE_KEY, loadContactPageFromSanity)
  } catch {
    return mapContactPageRuntime(local, {}, {})
  }
}

function localContactPageDisplay() {
  const content = getValidatedLocalContactContent()
  return {
    content,
    heroImage: null,
    seo: null,
    source: 'legacy',
  }
}

export async function getContactPageDisplay() {
  if (!isSanityEnabled()) {
    return localContactPageDisplay()
  }

  try {
    const bundle = await resolveContactPageBundle()
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
      source: bundle._contactSource ?? 'legacy',
    }
  } catch {
    return localContactPageDisplay()
  }
}

/** Contenido editorial completo (formulario, FAQ, etc.). */
export async function getContactContent() {
  const display = await getContactPageDisplay()
  return display.content
}

/** @deprecated Usar getContactPageDisplay */
export async function getContactDisplay() {
  return getContactPageDisplay()
}

export async function getContactHeroImage() {
  const display = await getContactPageDisplay()
  return display.heroImage ?? null
}

export function getLocalContactContent() {
  return getValidatedLocalContactContent()
}
