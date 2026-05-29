import { cn } from '@/lib/cn'
import { Container } from './Container'

export function Section({
  id,
  className,
  containerClassName,
  size = 'default',
  children,
  ...props
}) {
  return (
    <section id={id} className={cn('py-section-sm lg:py-section', className)} {...props}>
      <Container size={size} className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}) {
  return (
    <div
      className={cn(
        'mb-10 max-w-2xl lg:mb-14',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
