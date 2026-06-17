import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { Card, CardIcon } from '@/components/ui/Card'
import { WorkCardImage } from '@/components/ui/WorkCardImage'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Grid } from '@/components/ui/Grid'
import { SectionPlaceholder } from '@/components/ui/SectionPlaceholder'
import { Hero } from '@/components/sections/Hero'
import { USE_BLOCK_RESOLVER, USE_SPECIALTIES_V2, isSanityEnabled } from '@/lib/cms/config'
import { logHomeRuntime } from '@/lib/cms/homeRuntimeLog'
import { buildHomeSourceMap } from '@/lib/cms/homeSourceMap'
import {
  getActiveHeroSection,
  getActiveShowcaseCarouselSection,
  getActivePortfolioSection,
  getActiveServicesSection,
  getActiveSpecialtiesSection,
  getActiveWhyUsSection,
  getActiveBrandCarouselSection,
} from '@/lib/cms/homeResolver'
import {
  logHeroBlockFullSection,
  warnHeroBlockLegacyFallback,
} from '@/lib/cms/heroBlockLog'
import {
  logPortfolioBlockFullSection,
  warnPortfolioBlockLegacyFallback,
} from '@/lib/cms/portfolioBlockLog'
import {
  logServicesBlockFullSection,
  warnServicesBlockItemOmitted,
  warnServicesBlockLegacyFallback,
} from '@/lib/cms/servicesBlockLog'
import {
  logWhyUsBlockFullSection,
  warnWhyUsBlockLegacyFallback,
} from '@/lib/cms/whyUsBlockLog'
import {
  logSpecialtiesBlockFullSection,
  warnSpecialtiesBlockLegacyFallback,
} from '@/lib/cms/specialtiesBlockLog'
import { EMPTY_ARRAY, useHighlights, useHomePortfolioCards } from '@/hooks/useCms'
import { HomeContentProvider, useHomeContent } from '@/contexts/HomeContentContext'
import { HomeIsrProvider } from '@/contexts/HomeIsrContext'
import homeIsrSnapshot from '@/generated/home-isr.snapshot.json'

const HomeShowcaseSection = lazy(() =>
  import('@/components/sections/HomeShowcaseSection').then((m) => ({
    default: m.HomeShowcaseSection,
  })),
)
const MainServices = lazy(() =>
  import('@/components/sections/MainServices').then((m) => ({ default: m.MainServices })),
)
const EspecialidadesUtilcar = lazy(() =>
  import('@/components/sections/EspecialidadesUtilcar').then((m) => ({
    default: m.EspecialidadesUtilcar,
  })),
)
const BrandCarouselSection = lazy(() =>
  import('@/components/sections/BrandCarouselSection').then((m) => ({
    default: m.BrandCarouselSection,
  })),
)
const CtaBanner = lazy(() =>
  import('@/components/sections/CtaBanner').then((m) => ({ default: m.CtaBanner })),
)

function PortfolioCardSkeleton() {
  return (
    <Card className="flex h-full min-h-[18rem] flex-col">
      <div className="mb-4 aspect-[16/10] w-full animate-pulse rounded-lg bg-ink/[0.04]" aria-hidden />
      <div className="h-3 w-24 animate-pulse rounded bg-ink/[0.04]" aria-hidden />
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-ink/[0.04]" aria-hidden />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-ink/[0.04]" aria-hidden />
    </Card>
  )
}

export default function Home() {
  return (
    <HomeIsrProvider snapshot={homeIsrSnapshot}>
      <HomeContentProvider>
        <HomePage />
      </HomeContentProvider>
    </HomeIsrProvider>
  )
}

function HomePage() {
  const homeContent = useHomeContent()
  const highlights = useHighlights()
  const trabajosCatalog = useHomePortfolioCards()
  const { highlights: highlightsSection, portfolioPreview, extensions } = homeContent

  const heroSection = useMemo(() => getActiveHeroSection(extensions), [extensions])

  const showcaseSection = useMemo(
    () => getActiveShowcaseCarouselSection(extensions),
    [extensions],
  )
  const showcaseImages = showcaseSection?.images ?? EMPTY_ARRAY

  const whyUsSection = useMemo(() => getActiveWhyUsSection(extensions), [extensions])
  const whyUsMeta = whyUsSection ?? highlightsSection ?? {}
  const whyUsItems = whyUsSection?.items?.length ? whyUsSection.items : (highlights ?? [])
  const whyUsSource = whyUsSection?.items?.length ? 'cms' : 'legacy'

  const servicesSection = useMemo(() => getActiveServicesSection(extensions), [extensions])

  const portfolioSection = useMemo(
    () => getActivePortfolioSection(extensions),
    [extensions],
  )

  const brandCarouselSection = useMemo(
    () => getActiveBrandCarouselSection(extensions),
    [extensions],
  )

  const specialtiesSection = useMemo(
    () => getActiveSpecialtiesSection(extensions),
    [extensions],
  )

  const portfolioMeta = portfolioSection ?? portfolioPreview ?? {}
  const previewCount = portfolioMeta.previewCount ?? 3
  const trabajos = useMemo(
    () => trabajosCatalog.slice(0, previewCount),
    [trabajosCatalog, previewCount],
  )
  const portfolioSource = useMemo(() => {
    if (!trabajos.length) return 'empty'
    if ((portfolioSection?.selectedProjects?.length ?? 0) > 0) return 'cms-selected'
    if ((portfolioSection?.featuredProjectIds?.length ?? 0) > 0) return 'cms-featured-refs'
    return 'cms-featured-flags'
  }, [trabajos.length, portfolioSection?.selectedProjects?.length, portfolioSection?.featuredProjectIds?.length])

  const portfolioSourceRef = useRef(null)
  const whyUsSourceRef = useRef(null)
  const servicesSourceRef = useRef(null)
  const heroSourceRef = useRef(null)
  const specialtiesSourceRef = useRef(null)

  useEffect(() => {
    if (!import.meta.env.DEV || !USE_BLOCK_RESOLVER) return

    const source = heroSection ? 'heroBlock-full' : 'legacy-fallback'
    if (heroSourceRef.current === source) return
    heroSourceRef.current = source

    if (heroSection) {
      logHeroBlockFullSection({
        title: heroSection.title,
        imageSource: heroSection.image?.url ? 'cms' : 'legacy-fallback',
        hasPrimaryImage: Boolean(heroSection.primaryImage?.url ?? heroSection.image?.url),
        hasSecondaryImage: Boolean(heroSection.secondaryImage?.url),
      })
      return
    }

    warnHeroBlockLegacyFallback({
      hasRawSection: Boolean(extensions?.heroSection),
    })
  }, [heroSection, extensions?.heroSection])

  useEffect(() => {
    if (!USE_BLOCK_RESOLVER) return

    const source = servicesSection ? 'servicesBlock-full' : 'legacy-fallback'
    if (servicesSourceRef.current === source) return
    servicesSourceRef.current = source

    if (servicesSection) {
      logServicesBlockFullSection({
        itemCount: servicesSection.items.length,
        title: servicesSection.title,
      })
      const rawCount = extensions?.servicesSection?.items?.length ?? 0
      if (rawCount > servicesSection.items.length) {
        warnServicesBlockItemOmitted({
          rawCount,
          validCount: servicesSection.items.length,
          omitted: rawCount - servicesSection.items.length,
        })
      }
      return
    }

    warnServicesBlockLegacyFallback({
      rawItemCount: extensions?.servicesSection?.items?.length ?? 0,
    })
  }, [servicesSection, extensions?.servicesSection?.items?.length])

  useEffect(() => {
    if (!import.meta.env.DEV || !USE_BLOCK_RESOLVER) return

    const source = whyUsSection ? 'whyUsBlock-full' : 'legacy-fallback'
    if (whyUsSourceRef.current === source) return
    whyUsSourceRef.current = source

    if (whyUsSection) {
      logWhyUsBlockFullSection({
        itemCount: whyUsSection.items.length,
        title: whyUsSection.title,
      })
      return
    }

    warnWhyUsBlockLegacyFallback({
      rawItemCount: extensions?.whyUsSection?.items?.length ?? 0,
    })
  }, [whyUsSection, extensions?.whyUsSection?.items?.length])

  useEffect(() => {
    if (!import.meta.env.DEV || !USE_BLOCK_RESOLVER) return

    const source = portfolioSection ? 'portfolioBlock-full' : 'legacy-fallback'
    if (portfolioSourceRef.current === source) return
    portfolioSourceRef.current = source

    if (portfolioSection) {
      logPortfolioBlockFullSection({
        itemCount: portfolioSection.items.length,
        previewCount,
        title: portfolioSection.title,
      })
      return
    }

    warnPortfolioBlockLegacyFallback({
      rawItemCount: extensions?.portfolioSection?.items?.length ?? 0,
    })
  }, [portfolioSection, previewCount, extensions?.portfolioSection?.items?.length])

  useEffect(() => {
    if (!import.meta.env.DEV || !USE_BLOCK_RESOLVER || !USE_SPECIALTIES_V2) return

    const source = specialtiesSection ? 'specialtiesBlock-full' : 'legacy-fallback'
    if (specialtiesSourceRef.current === source) return
    specialtiesSourceRef.current = source

    if (specialtiesSection) {
      logSpecialtiesBlockFullSection({
        categoryCount: specialtiesSection.categories.length,
        title: specialtiesSection.title,
        brandCount: specialtiesSection.categories.reduce(
          (n, cat) => n + (cat.brands?.length ?? 0),
          0,
        ),
      })
      return
    }

    warnSpecialtiesBlockLegacyFallback({
      rawCategoryCount: extensions?.specialtiesSection?.categories?.length ?? 0,
    })
  }, [specialtiesSection, extensions?.specialtiesSection?.categories?.length])

  const runtimeLoggedRef = useRef(false)

  useEffect(() => {
    if (!import.meta.env.DEV || !USE_BLOCK_RESOLVER || homeContent.isLoading) return
    if (runtimeLoggedRef.current) return
    runtimeLoggedRef.current = true

    logHomeRuntime('hero', {
      blockFound: Boolean(extensions?.heroSection),
      source: heroSection ? 'cms' : 'legacy',
    })
    logHomeRuntime('showcase', {
      blockFound: Boolean(extensions?.showcaseCarouselSection),
      imageCount: showcaseImages.length,
      source: showcaseSection ? 'cms' : 'empty',
    })
    logHomeRuntime('services', {
      blockFound: Boolean(extensions?.servicesSection),
      itemsCount: servicesSection?.items?.length ?? 0,
      source: servicesSection ? 'cms' : 'legacy',
    })
    logHomeRuntime('specialties', {
      blockFound: Boolean(extensions?.specialtiesSection),
      categoriesCount: specialtiesSection?.categories?.length ?? 0,
      source: specialtiesSection ? 'cms' : 'legacy',
    })
    logHomeRuntime('why-utilcar', {
      blockFound: Boolean(extensions?.whyUsSection),
      itemsCount: whyUsSection?.items?.length ?? 0,
      source: whyUsSource,
    })
    logHomeRuntime('portfolio', {
      blockFound: Boolean(extensions?.portfolioSection),
      selectedProjectsCount: portfolioSection?.selectedProjects?.length ?? 0,
      featuredProjectsCount: portfolioSection?.featuredProjectIds?.length ?? 0,
      source: portfolioSource,
    })
    logHomeRuntime('brand-carousel', {
      blockFound: Boolean(extensions?.brandCarouselSection),
      brandCount: brandCarouselSection?.brands?.length ?? 0,
      source: brandCarouselSection ? 'cms' : 'empty',
    })
    logHomeRuntime('cta', {
      blockFound: Boolean(extensions),
      source: 'cms-mirror',
    })

    const map = buildHomeSourceMap({
      extensions,
      heroSection,
      servicesSection,
      specialtiesSection,
      whyUsSection,
      portfolioSection,
      sanityEnabled: isSanityEnabled(),
    })
    console.info('[home-source-map]', map)
  }, [homeContent.isLoading, extensions, heroSection, showcaseImages.length, servicesSection, specialtiesSection, whyUsSection, portfolioSection, brandCarouselSection, whyUsSource, portfolioSource])

  const portfolioItems = trabajos.slice(0, previewCount)
  const showPortfolioSkeleton = portfolioItems.length === 0 && previewCount > 0

  return (
    <>
      <PageMeta page="home" />

      <Hero activeSection={heroSection} />

      <Suspense fallback={<SectionPlaceholder className="mx-auto my-6 max-w-6xl" minHeight="270px" />}>
        <HomeShowcaseSection images={showcaseImages} />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder className="mx-auto my-10 max-w-6xl" minHeight="420px" />}>
        <MainServices activeSection={servicesSection} />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder className="mx-auto my-10 max-w-6xl" minHeight="360px" />}>
        <EspecialidadesUtilcar activeSection={specialtiesSection} />
      </Suspense>

      <Section>
        <SectionHeader
          eyebrow={whyUsMeta.eyebrow ?? ''}
          title={whyUsMeta.title ?? ''}
          description={whyUsMeta.description ?? ''}
          align="center"
        />
        <Grid cols={3}>
          {whyUsItems.map((item) => (
            <div key={item._key ?? item.title}>
              <Card className="min-h-[11.5rem] text-center">
                {item.icon ? <CardIcon icon={item.icon} className="mx-auto" /> : null}
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
              </Card>
            </div>
          ))}
        </Grid>
      </Section>

      <Section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow={portfolioMeta.eyebrow ?? ''}
            title={portfolioMeta.title ?? ''}
            description={portfolioMeta.description ?? ''}
            className="mb-0"
          />
          <Button to={portfolioMeta.ctaTo ?? '/trabajos-realizados'} variant="outline" className="shrink-0">
            {portfolioMeta.ctaLabel ?? 'Ver trabajos'}
          </Button>
        </div>
        <Grid cols={3} className="mt-10">
          {showPortfolioSkeleton
            ? Array.from({ length: previewCount }, (_, index) => (
                <PortfolioCardSkeleton key={`portfolio-skeleton-${index}`} />
              ))
            : portfolioItems.map((trabajo) => (
                <Card key={trabajo.id} hover className="flex min-h-[18rem] flex-col">
                  <WorkCardImage
                    imageKey={trabajo.imageKey}
                    src={trabajo.imageUrl ?? trabajo.image}
                    alt={trabajo.imageAlt}
                    className="mb-4"
                  />
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                    {trabajo.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{trabajo.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{trabajo.description}</p>
                </Card>
              ))}
        </Grid>
      </Section>

      <Suspense fallback={<SectionPlaceholder className="mx-auto my-10 max-w-6xl" minHeight="160px" />}>
        <BrandCarouselSection section={brandCarouselSection} />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder className="mx-auto my-10 max-w-6xl" minHeight="120px" />}>
        <CtaBanner />
      </Suspense>
    </>
  )
}
