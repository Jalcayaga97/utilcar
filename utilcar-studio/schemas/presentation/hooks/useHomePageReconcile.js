import { useCallback, useRef } from 'react'
import { PatchEvent } from 'sanity'
import { useToast } from '@sanity/ui'
import {
  applyHomePagePatches,
  patchesForHomePageReconcile,
} from '../../governance/homePageSync.js'
import { PAGE_BUILDER_COPY } from '../pageBuilderCopy.js'

/** onChange: blocks escribe; campos planos solo sincronizan (sin escritura dual). */
export function useHomePageReconcile(value, onChange) {
  const toast = useToast()
  const toastShownRef = useRef(false)

  return useCallback(
    (event) => {
      const mergedPatches = [...event.patches]
      const after = applyHomePagePatches(value, mergedPatches)
      const { patches, flatEditRejected } = patchesForHomePageReconcile(value, after)

      if (patches.length) {
        onChange(PatchEvent.from([...mergedPatches, ...patches]))
        if (flatEditRejected && !toastShownRef.current) {
          toastShownRef.current = true
          toast.push({
            status: 'warning',
            title: PAGE_BUILDER_COPY.flatEditRejected,
            duration: 8000,
          })
          setTimeout(() => {
            toastShownRef.current = false
          }, 8500)
        }
        return
      }

      onChange(event)
    },
    [onChange, toast, value],
  )
}
