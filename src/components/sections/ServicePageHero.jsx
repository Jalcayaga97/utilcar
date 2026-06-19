import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

export function ServicePageHero({
  eyebrow = 'Servicios',
  title,
  subtitle,
  highlights = [],
  image,
  imageAlt,
}) {
  const highlightList = Array.isArray(highlights)
    ? highlights.map((item) => String(item ?? '').trim()).filter(Boolean)
    : []

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <Container className="relative py-12 sm:py-14 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
              {subtitle}
            </p>

            {highlightList.length > 0 ? (
              <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
                {highlightList.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink-muted">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-white">
                      <Check className="h-3 w-3 text-ink" strokeWidth={2} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-card border border-border bg-white shadow-card">
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-surface sm:aspect-video">
                {image ? (
                  <img
                    src={image}
                    alt={imageAlt || ''}
                    className="h-full w-full max-h-full max-w-full object-contain object-center"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-ink-muted">
                    Sin imagen
                  </div>
                )}
              </div>
              <div
                className={cn(
                  'pointer-events-none absolute inset-0',
                  'bg-gradient-to-t from-ink/[0.12] via-ink/[0.02] to-transparent',
                )}
                aria-hidden
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
