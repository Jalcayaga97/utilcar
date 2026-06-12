import { createContext, useContext, useMemo, useCallback } from 'react'
import { EMPTY_HOME_EXTENSIONS, getHomeContent } from '@/lib/cms/home.adapter'
import { getValidatedLocalHomeContent } from '@/lib/cms/localContent'
import { useCmsData } from '@/hooks/useCmsData'

const HomeContentContext = createContext(null)

function getLocalHomeContentWithExtensions() {
  return {
    ...getValidatedLocalHomeContent(),
    extensions: EMPTY_HOME_EXTENSIONS,
    isLoading: false,
  }
}

function useHomeContentState() {
  const local = useMemo(() => getLocalHomeContentWithExtensions(), [])
  const loadingSnapshot = useMemo(
    () => ({ ...local, isLoading: true, extensions: EMPTY_HOME_EXTENSIONS }),
    [local],
  )
  const fetcher = useCallback(() => getHomeContent(), [])
  const { data, isLoading } = useCmsData(local, fetcher)

  return useMemo(() => {
    if (isLoading) return loadingSnapshot
    if (!data) return { ...local, isLoading: false, extensions: EMPTY_HOME_EXTENSIONS }
    return { ...data, isLoading: false }
  }, [isLoading, loadingSnapshot, local, data])
}

export function HomeContentProvider({ children }) {
  const value = useHomeContentState()
  return <HomeContentContext.Provider value={value}>{children}</HomeContentContext.Provider>
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext)
  if (!ctx) {
    throw new Error('useHomeContent debe usarse dentro de HomeContentProvider')
  }
  return ctx
}
