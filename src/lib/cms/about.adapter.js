import { isAboutCmsActive, isSanityEnabled } from '@/lib/cms/config'

import { loadCached } from '@/lib/cms/adapterCache'

import { getValidatedLocalAboutContent } from '@/lib/cms/localContent'

import {

  emptyAboutPageContent,

  mapAboutPageRuntime,

} from '@/lib/cms/resolvers/aboutPageResolver'

import { validateContent } from '@/lib/cms/validate'

import { AboutContentSchema } from '@/lib/schemas'

import { fetchAboutPage } from '@/lib/sanity/fetch'



const CACHE_KEY = 'cms:about-page'



async function loadAboutPageFromSanity() {

  const remote = await fetchAboutPage()

  if (!remote) return null



  const resolved = {

    extensions: remote.extensions ?? {},

    _pageSource: remote._pageSource,

  }



  return mapAboutPageRuntime(emptyAboutPageContent(), resolved)

}



async function resolveAboutPageBundle() {

  if (!isSanityEnabled()) {

    return mapAboutPageRuntime(getValidatedLocalAboutContent(), {}, {})

  }



  if (!isAboutCmsActive()) {

    return mapAboutPageRuntime(getValidatedLocalAboutContent(), {}, {})

  }



  try {

    return await loadCached(CACHE_KEY, loadAboutPageFromSanity)

  } catch {

    return null

  }

}



function localAboutPageDisplay() {

  const content = getValidatedLocalAboutContent()

  return {

    content,

    heroImage: null,

    seo: null,

    source: 'legacy',

    isLoading: false,

  }

}



export async function getAboutPageDisplay() {

  if (!isAboutCmsActive()) {

    return localAboutPageDisplay()

  }



  const bundle = await resolveAboutPageBundle()

  if (!bundle || bundle._aboutSource !== 'cms') {

    return null

  }



  const validated = validateContent(

    AboutContentSchema,

    bundle.content,

    emptyAboutPageContent(),

    'sanity:about-page',

  )



  return {

    content: validated,

    heroImage: bundle.heroImage ?? null,

    seo: bundle.seo ?? null,

    source: 'cms',

    isLoading: false,

  }

}



export function getLocalAboutContent() {

  return getValidatedLocalAboutContent()

}

