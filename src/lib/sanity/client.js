import { createClient } from '@sanity/client'
import { isSanityEnabled, SANITY_CONFIG } from '@/lib/cms/config'

let client = null

/**
 * Cliente Sanity (null si CMS deshabilitado o sin projectId).
 */
export function getSanityClient() {
  if (!isSanityEnabled()) return null

  if (!client) {
    client = createClient({
      projectId: SANITY_CONFIG.projectId,
      dataset: SANITY_CONFIG.dataset,
      apiVersion: SANITY_CONFIG.apiVersion,
      useCdn: SANITY_CONFIG.useCdn,
    })
  }

  return client
}
