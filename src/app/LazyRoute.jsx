import { Suspense } from 'react'
import { PageLoader } from '@/components/common/PageLoader'

export function LazyRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}
