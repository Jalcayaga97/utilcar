import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { resolveHomeHeroImages } from '@/lib/cms/assets/resolveHeroAssets'
import {
  buildResponsiveSrcSet,
  HOME_HERO_PRIMARY_SIZES,
  HOME_HERO_SECONDARY_SIZES,
  optimizeImageUrl,
} from '@/lib/images/responsiveImage'
import { useGlobalServiceCta } from '@/hooks/useCms'
import { useHomeContent } from '@/contexts/HomeContentContext'
import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/cn'

const heroImageFitClass = {
  primary: 'h-full w-full object-contain object-center',
  secondary: 'h-full w-full object-contain object-center',
}

const heroImageBoxClass = {
  primary:
    'aspect-[1280/669] w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]',
  secondary:
    'aspect-[1342/1172] w-full max-w-[180px] sm:max-w-[200px] md:max-w-[240px]',
}

function HeroBrandLogo({
  src,
  alt,
  label,
  variant = 'primary',
  width,
  height,
  srcSet,
  sizes,
  priority = false,
}) {
  const wrapClass =
    variant === 'primary'
      ? 'flex w-full items-center justify-center md:w-auto md:justify-end'
      : 'flex w-full shrink-0 items-center justify-center md:w-auto md:justify-start'

  if (!src) {
    return (
      <div
        className={cn(wrapClass, heroImageBoxClass[variant], 'min-h-28')}
        aria-hidden={!label}
      >
        <span className="text-sm text-ink-muted">{label ?? 'Imagen pendiente'}</span>
      </div>
    )
  }

  const optimizedSrc = optimizeImageUrl(src, {
    width: variant === 'primary' ? 640 : 480,
  })

  return (
    <div className={wrapClass}>
      <div className={heroImageBoxClass[variant]}>
        <SmartImage
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={heroImageFitClass[variant]}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </div>
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

  const primarySrcSet = useMemo(
    () => buildResponsiveSrcSet(heroImages.primary.src, [280, 480, 640, 960]),
    [heroImages.primary.src],
  )
  const secondarySrcSet = useMemo(
    () => buildResponsiveSrcSet(heroImages.secondary.src, [180, 280, 480]),
    [heroImages.secondary.src],
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
          <h1
            className={cn(
              'mt-4 max-w-6xl text-balance text-xl font-semibold leading-[1.15] tracking-tight text-ink',
              'sm:text-2xl sm:leading-[1.12] lg:text-3xl xl:text-[2.125rem] xl:leading-[1.1]',
            )}
          >
            {hero.title}
          </h1>

          <div className="mt-4 flex w-full flex-col items-center gap-6 sm:mt-5 md:flex-row md:items-center md:justify-center md:gap-4 lg:gap-5">
            <HeroBrandLogo
              variant="primary"
              src={heroImages.primary.src}
              alt={heroImages.primary.alt}
              width={400}
              height={209}
              srcSet={primarySrcSet}
              sizes={HOME_HERO_PRIMARY_SIZES}
              priority
            />
            <HeroBrandLogo
              variant="secondary"
              src={heroImages.secondary.src}
              alt={heroImages.secondary.alt}
              label="Distintivo / aniversario"
              width={240}
              height={210}
              srcSet={secondarySrcSet}
              sizes={HOME_HERO_SECONDARY_SIZES}
            />
          </div>

          <div className="mt-8 flex w-full flex-col items-center sm:mt-10">
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
          </div>
        </div>
      </Container>
    </section>
  )
}
