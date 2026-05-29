import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { resolveHeroAssets } from '@/lib/cms/assets/resolveHeroAssets'
import { SITE } from '@/constants/site'
import { useHomeContent } from '@/hooks/useCms'
import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
})

/**
 * @param {{ activeSection?: object | null }} props
 * activeSection — getActiveHeroSection(extensions) desde Home cuando resolver ON.
 */
export function Hero({ activeSection = null }) {
  const { hero: legacyHero } = useHomeContent()

  const hero = activeSection ?? legacyHero
  const secondaryLink = activeSection
    ? {
        label: activeSection.secondaryCta.label,
        to: activeSection.secondaryCta.to,
        ariaLabel: activeSection.secondaryCta.ariaLabel,
      }
    : legacyHero.secondaryLink

  const primaryCta = activeSection?.primaryCta
  const primaryLabel = sanitizeOptional(primaryCta?.label)
  const primaryTo = sanitizeOptional(primaryCta?.to)

  const heroAssets = useMemo(
    () =>
      resolveHeroAssets(
        activeSection ?? { image: { url: null, alt: legacyHero.imageAlt } },
        legacyHero,
      ),
    [activeSection, legacyHero],
  )

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      {/* Fondo sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(to right, #f5f5f3 0%, transparent 50%), linear-gradient(to bottom, transparent 0%, #ebebea 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        aria-hidden
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 80px, #e5e5e5 80px, #e5e5e5 81px)',
        }}
      />

      <Container className="relative">
        <div className="grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20 xl:gap-20 xl:py-24">
          {/* Contenido */}
          <div className="max-w-xl lg:max-w-none">
            <motion.p
              {...fadeUp(0)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle"
            >
              {SITE.tagline}
            </motion.p>

            <motion.h1
              {...fadeUp(0.06)}
              className="mt-4 text-3xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1] xl:text-5xl"
            >
              {hero.title}
            </motion.h1>

            <motion.p
              {...fadeUp(0.12)}
              className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            <motion.ul
              {...fadeUp(0.18)}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3"
            >
              {hero.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-ink-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-white">
                    <Check className="h-3 w-3 text-ink" strokeWidth={2} />
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div {...fadeUp(0.24)} className="mt-10">
              <CtaButtonGroup
                variant="hero"
                align="start"
                {...(primaryLabel ? { primaryLabel } : {})}
                {...(primaryTo ? { primaryTo } : {})}
              />
              <Link
                to={secondaryLink.to}
                aria-label={secondaryLink.ariaLabel}
                className={cn(
                  'mt-5 inline-flex items-center gap-1.5 text-sm text-ink-muted',
                  'transition-colors duration-300 hover:text-ink',
                  'underline-offset-4 hover:underline',
                )}
              >
                {secondaryLink.label}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </motion.div>
          </div>

          {/* Imagen */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end"
          >
            <div className="relative overflow-hidden rounded-card border border-border bg-white shadow-card">
              <div className="aspect-[16/10] sm:aspect-video lg:aspect-[16/10]">
                <img
                  src={heroAssets.src}
                  alt={heroAssets.alt}
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              {/* Overlay suave en borde inferior */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.06] via-transparent to-transparent"
                aria-hidden
              />
            </div>

            {/* Detalle decorativo minimal */}
            <div
              className={cn(
                'absolute -bottom-3 -left-3 hidden h-24 w-24 rounded-card border border-border bg-surface sm:block',
                'lg:-bottom-4 lg:-left-4',
              )}
              aria-hidden
            />
            <div
              className="absolute -right-2 -top-2 h-16 w-16 rounded-full border border-border bg-white/80 sm:-right-3 sm:-top-3"
              aria-hidden
            />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

function sanitizeOptional(value) {
  if (value == null) return ''
  return String(value).trim()
}
