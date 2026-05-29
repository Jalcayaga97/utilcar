import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { Card, CardIcon } from '@/components/ui/Card'
import { WorkCardImage } from '@/components/ui/WorkCardImage'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Grid } from '@/components/ui/Grid'
import { Hero } from '@/components/sections/Hero'
import { MainServices } from '@/components/sections/MainServices'
import { EspecialidadesUtilcar } from '@/components/sections/EspecialidadesUtilcar'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { USE_BLOCK_RESOLVER, USE_SPECIALTIES_V2 } from '@/lib/cms/config'
import {
  getActiveHeroSection,
  getActivePortfolioSection,
  getActiveServicesSection,
  getActiveSpecialtiesSection,
  getActiveWhyUsSection,
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
import { useHighlights, useHomeContent, useTrabajosPreview } from '@/hooks/useCms'

export default function Home() {
  const homeContent = useHomeContent()
  const highlights = useHighlights()
  const trabajosWorkPage = useTrabajosPreview()
  const { highlights: highlightsSection, portfolioPreview, extensions } = homeContent

  const heroSection = useMemo(() => getActiveHeroSection(extensions), [extensions])

  const whyUsSection = useMemo(() => getActiveWhyUsSection(extensions), [extensions])
  const whyUsMeta = whyUsSection ?? highlightsSection
  const whyUsItems = whyUsSection?.items ?? highlights

  const servicesSection = useMemo(() => getActiveServicesSection(extensions), [extensions])

  const portfolioSection = useMemo(
    () => getActivePortfolioSection(extensions),
    [extensions],
  )

  const specialtiesSection = useMemo(
    () => getActiveSpecialtiesSection(extensions),
    [extensions],
  )

  const portfolioMeta = portfolioSection ?? portfolioPreview
  const trabajos = portfolioSection?.items ?? trabajosWorkPage
  const previewCount = portfolioMeta.previewCount ?? 3

  const portfolioSourceRef = useRef(null)
  const whyUsSourceRef = useRef(null)
  const servicesSourceRef = useRef(null)
  const heroSourceRef = useRef(null)
  const specialtiesSourceRef = useRef(null)

  useEffect(() => {
    if (!USE_BLOCK_RESOLVER) return

    const source = heroSection ? 'heroBlock-full' : 'legacy-fallback'
    if (heroSourceRef.current === source) return
    heroSourceRef.current = source

    if (heroSection) {
      logHeroBlockFullSection({
        title: heroSection.title,
        imageSource: heroSection.image?.url ? 'cms' : 'legacy-fallback',
        highlightCount: heroSection.highlights.length,
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
    if (!USE_BLOCK_RESOLVER) return

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
    if (!USE_BLOCK_RESOLVER) return

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
    if (!USE_BLOCK_RESOLVER || !USE_SPECIALTIES_V2) return

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

  return (
    <>
      <PageMeta page="home" />

      <Hero activeSection={heroSection} />

      <MainServices activeSection={servicesSection} />

      <EspecialidadesUtilcar activeSection={specialtiesSection} />

      <Section>
        <SectionHeader
          eyebrow={whyUsMeta.eyebrow}
          title={whyUsMeta.title}
          align="center"
        />
        <Grid cols={3}>
          {whyUsItems.map((item, i) => (
            <motion.div
              key={item._key ?? item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center">
                {item.icon ? <CardIcon icon={item.icon} className="mx-auto" /> : null}
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </Grid>
      </Section>

      <Section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow={portfolioMeta.eyebrow}
            title={portfolioMeta.title}
            description={portfolioMeta.description}
            className="mb-0"
          />
          <Button to={portfolioMeta.ctaTo} variant="outline" className="shrink-0">
            {portfolioMeta.ctaLabel}
          </Button>
        </div>
        <Grid cols={3} className="mt-10">
          {trabajos.slice(0, previewCount).map((trabajo) => (
            <Card key={trabajo.id} hover className="flex h-full flex-col">
              <WorkCardImage
                imageKey={trabajo.imageKey}
                src={trabajo.imageUrl}
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

      <CtaBanner />
    </>
  )
}
