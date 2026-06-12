import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

function Bone({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-ink/[0.06]', className)}
      aria-hidden
    />
  )
}

/**
 * Placeholder sin contenido editorial — evita flash local→CMS.
 * @param {{ variant?: 'editorial' | 'home' | 'service' }} props
 */
export function CmsPageSkeleton({ variant = 'editorial' }) {
  if (variant === 'home') {
    return (
      <div className="animate-pulse" aria-busy="true" aria-label="Cargando contenido">
        <div className="border-b border-border bg-surface py-16">
          <Container className="flex flex-col items-center gap-6">
            <Bone className="h-8 w-2/3 max-w-xl" />
            <Bone className="h-32 w-full max-w-lg" />
            <Bone className="h-10 w-48" />
          </Container>
        </div>
        <Container className="py-16 space-y-8">
          <Bone className="h-48 w-full" />
          <Bone className="h-48 w-full" />
        </Container>
      </div>
    )
  }

  if (variant === 'service') {
    return (
      <div className="animate-pulse" aria-busy="true" aria-label="Cargando contenido">
        <div className="border-b border-border bg-surface py-12 lg:py-16">
          <Container>
            <Bone className="h-4 w-24" />
            <Bone className="mt-4 h-10 w-2/3 max-w-lg" />
            <Bone className="mt-3 h-5 w-full max-w-xl" />
          </Container>
        </div>
        <Container className="py-14 space-y-6">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
          <Bone className="h-4 w-4/6" />
          <Bone className="mt-8 h-64 w-full" />
        </Container>
      </div>
    )
  }

  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Cargando contenido">
      <div className="border-b border-border bg-surface py-12 lg:py-16">
        <Container>
          <Bone className="h-4 w-20" />
          <Bone className="mt-4 h-10 w-1/2 max-w-md" />
          <Bone className="mt-3 h-5 w-2/3 max-w-lg" />
        </Container>
      </div>
      <Container className="py-14">
        <Bone className="mx-auto h-6 w-48" />
        <div className="mx-auto mt-8 max-w-3xl space-y-4">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
        </div>
      </Container>
    </div>
  )
}
