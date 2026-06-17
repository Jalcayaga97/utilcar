import { createContext, useContext } from 'react'

const HomeIsrContext = createContext(null)

export function HomeIsrProvider({ snapshot, children }) {
  return <HomeIsrContext.Provider value={snapshot}>{children}</HomeIsrContext.Provider>
}

export function useHomeIsrSnapshot() {
  return useContext(HomeIsrContext)
}
