import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

export function ServicePageHero({
  eyebrow = 'Servicios',
  title,
  subtitle,
  image,
  imageAlt,
}) {
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-card border border-border bg-white shadow-card">
              <div className="aspect-[16/10] sm:aspect-video">
                <img
                  src={image}
                  alt={imageAlt || ''}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
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
