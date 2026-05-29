import { cn } from '@/lib/cn'
import { getTrabajoImage } from '@/assets/images'

export function WorkCardImage({ imageKey, src: srcOverride, alt, className }) {
  const src = srcOverride ?? (imageKey ? getTrabajoImage(imageKey) : null)

  if (!src) {
    return (
      <div
        className={cn(
          'aspect-[16/10] rounded-lg bg-gradient-to-br from-surface to-border',
          className,
        )}
      />
    )
  }

  return (
    <div className={cn('relative aspect-[16/10] overflow-hidden rounded-lg bg-surface', className)}>
      <img
        src={src}
        alt={alt || ''}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.08] to-transparent"
        aria-hidden
      />
    </div>
  )
}
