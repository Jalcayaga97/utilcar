import { useEffect, useRef, useState } from 'react'
import { isSanityEnabled } from '@/lib/cms/config'

/**
 * Fetch CMS con estado estable: sin loop loading→ready y sin deps inestables en fallback.
 *
 * @param {unknown} localValue
 * @param {() => Promise<unknown>} fetcher
 * @param {unknown} [resetKey]
 * @param {{ initialData?: unknown, revalidate?: boolean }} [options]
 */
export function useCmsData(localValue, fetcher, resetKey = null, options = null) {
  const { initialData = null, revalidate = false } = options ?? {}
  const sanityOn = isSanityEnabled()
  const localRef = useRef(localValue)
  localRef.current = localValue

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const resetKeyRef = useRef(resetKey)

  const [state, setState] = useState(() => {
    if (!sanityOn) return { data: localValue, status: 'ready' }
    if (initialData != null) return { data: initialData, status: 'ready' }
    return { data: null, status: 'loading' }
  })

  useEffect(() => {
    if (!sanityOn) return

    let cancelled = false
    const resetKeyChanged = resetKeyRef.current !== resetKey
    resetKeyRef.current = resetKey

    setState((prev) => {
      if (!resetKeyChanged && prev.status === 'ready' && prev.data != null && !revalidate) return prev
      if (!resetKeyChanged && prev.status === 'loading' && prev.data == null) return prev
      if (revalidate && prev.data != null) return prev
      return { data: null, status: 'loading' }
    })

    fetcherRef
      .current()
      .then((next) => {
        if (cancelled) return
        if (next == null) {
          setState((prev) => ({
            data: prev.data ?? localRef.current,
            status: 'error',
          }))
          return
        }
        setState({ data: next, status: 'ready' })
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({
            data: prev.data ?? localRef.current,
            status: 'error',
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [sanityOn, resetKey, revalidate])

  const isLoading = sanityOn && state.status === 'loading' && state.data == null
  const data =
    state.status === 'ready' || state.status === 'error' || (state.status === 'loading' && state.data != null)
      ? state.data
      : null

  return {
    data: isLoading ? null : (data ?? (sanityOn ? null : localValue)),
    isLoading,
    isError: state.status === 'error',
  }
}
