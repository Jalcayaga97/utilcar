import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { resolveHomeHeroImages } from '@/lib/cms/assets/resolveHeroAssets'
import { useGlobalServiceCta } from '@/hooks/useCms'
import { useHomeContent } from '@/contexts/HomeContentContext'
import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
})

const heroImageFitClass = {
  primary:
    'h-auto w-full max-w-full object-contain object-center max-h-[10rem] sm:max-h-[11.5rem] md:max-h-[13rem] lg:max-h-[15rem] xl:max-h-[17rem]',
  secondary:
    'h-auto w-full max-w-[90%] object-contain object-center max-h-40 sm:max-h-44 md:max-h-48 lg:max-h-52',
}

function HeroBrandLogo({ src, alt, label, variant = 'primary' }) {
  const wrapClass =
    variant === 'primary'
      ? 'flex w-full items-center justify-center md:w-auto md:justify-end'
      : 'flex w-full shrink-0 items-center justify-center md:w-auto md:justify-start'

  if (!src) {
    return (
      <div
        className={cn(
          wrapClass,
          'min-h-28 md:min-h-36 lg:min-h-44',
        )}
        aria-hidden={!label}
      >
        <span className="text-sm text-ink-muted">{label ?? 'Imagen pendiente'}</span>
      </div>
    )
  }

  return (
    <div className={wrapClass}>
      <img
        src={src}
        alt={alt}
        className={heroImageFitClass[variant]}
        loading="eager"
        decoding="async"
        fetchPriority={variant === 'primary' ? 'high' : 'auto'}
      />
    </div>
  )
}

/**
 * @param {{ activeSection?: object | null }} props
 * activeSection — getActiveHeroSection(extensions) desde Home cuando resolver ON.
 */
export function Hero({ activeSection = null }) {
  const { hero: legacyHero } = useHomeContent()
  const globalCta = useGlobalServiceCta()

  const hero = activeSection ?? legacyHero
  const textLink = activeSection?.textLink ?? legacyHero.secondaryLink

  const heroImages = useMemo(
    () =>
      resolveHomeHeroImages(
        activeSection ?? {
          primaryImage: { url: null, alt: legacyHero.imageAlt },
          secondaryImage: { url: null, alt: legacyHero.secondaryImageAlt },
        },
        legacyHero,
      ),
    [activeSection, legacyHero],
  )

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
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
        <div className="flex flex-col items-center py-10 text-center sm:py-12 lg:py-14">
          <motion.h1
            {...fadeUp(0)}
            className={cn(
              'mt-4 max-w-6xl text-balance text-xl font-semibold leading-[1.15] tracking-tight text-ink',
              'sm:text-2xl sm:leading-[1.12] lg:text-3xl xl:text-[2.125rem] xl:leading-[1.1]',
            )}
          >
            {hero.title}
          </motion.h1>

          <motion.div
            {...fadeUp(0.12)}
            className="mt-4 flex w-full flex-col items-center gap-6 sm:mt-5 md:flex-row md:items-center md:justify-center md:gap-4 lg:gap-5"
          >
            <HeroBrandLogo
              variant="primary"
              src={heroImages.primary.src}
              alt={heroImages.primary.alt}
            />
            <HeroBrandLogo
              variant="secondary"
              src={heroImages.secondary.src}
              alt={heroImages.secondary.alt}
              label="Distintivo / aniversario"
            />
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="mt-8 flex w-full flex-col items-center sm:mt-10">
            <CtaButtonGroup
              variant="hero"
              align="center"
              primaryLabel={globalCta.primaryLabel}
              primaryTo={globalCta.primaryTo}
            />
            {textLink?.label && textLink?.to ? (
              <Link
                to={textLink.to}
                aria-label={textLink.ariaLabel ?? textLink.label}
                className={cn(
                  'mt-5 inline-flex items-center gap-1.5 text-sm text-ink-muted',
                  'transition-colors duration-300 hover:text-ink',
                  'underline-offset-4 hover:underline',
                )}
              >
                {textLink.label}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </Link>
            ) : null}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
