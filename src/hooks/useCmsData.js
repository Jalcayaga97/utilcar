import { useEffect, useRef, useState } from 'react'
import { isSanityEnabled } from '@/lib/cms/config'

/**
 * Fetch CMS con estado estable: sin loop loading→ready y sin deps inestables en fallback.
 */
export function useCmsData(localValue, fetcher, resetKey = null) {
  const sanityOn = isSanityEnabled()
  const localRef = useRef(localValue)
  localRef.current = localValue

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const resetKeyRef = useRef(resetKey)

  const [state, setState] = useState(() => ({
    data: sanityOn ? null : localValue,
    status: sanityOn ? 'loading' : 'ready',
  }))

  useEffect(() => {
    if (!sanityOn) return

    let cancelled = false
    const resetKeyChanged = resetKeyRef.current !== resetKey
    resetKeyRef.current = resetKey

    setState((prev) => {
      if (!resetKeyChanged && prev.status === 'ready' && prev.data != null) return prev
      if (!resetKeyChanged && prev.status === 'loading') return prev
      return { data: null, status: 'loading' }
    })

    fetcherRef
      .current()
      .then((next) => {
        if (cancelled) return
        if (next == null) {
          setState({ data: localRef.current, status: 'error' })
          return
        }
        setState({ data: next, status: 'ready' })
      })
      .catch(() => {
        if (!cancelled) setState({ data: localRef.current, status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [sanityOn, resetKey])

  const isLoading = sanityOn && state.status === 'loading'
  const data = state.status === 'ready' || state.status === 'error' ? state.data : null

  return {
    data: isLoading ? null : (data ?? (sanityOn ? null : localValue)),
    isLoading,
    isError: state.status === 'error',
  }
}
