import { cn } from '@/lib/cn'

/** Reserva espacio durante lazy-load — evita CLS. */
export function SectionPlaceholder({ className, minHeight = '12rem' }) {
  return (
    <div
      className={cn('w-full animate-pulse rounded-lg bg-ink/[0.04]', className)}
      style={{ minHeight }}
      aria-hidden
    />
  )
}
