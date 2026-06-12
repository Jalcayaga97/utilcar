import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Grid } from '@/components/ui/Grid'
import { Card, CardIcon } from '@/components/ui/Card'
import { IMAGES } from '@/assets/images'
import { CmsPageSkeleton } from '@/components/cms/CmsPageSkeleton'
import { useAboutPageDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'

const ease = [0.25, 0.1, 0.25, 1]

export default function SobreNosotros() {
  const { content, heroImage, seo, source, isLoading } = useAboutPageDisplay()
  const features = content.features ?? { items: [] }

  useEffect(() => {
    if (isLoading) return
    logRuntime('about-page', {
      source,
      featureItems: features.items?.length ?? 0,
    })
  }, [source, features.items?.length, isLoading])

  if (isLoading) return <CmsPageSkeleton />

  const hero = content.hero ?? {}
  const historia = content.historia ?? { paragraphs: [] }
  const featuresSection = content.features ?? { items: [] }
  const cta = content.cta ?? {}

  return (
    <>
      <PageMeta page="sobre-nosotros" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={heroImage || IMAGES.talleres.hero}
        imageAlt={hero.imageAlt}
      />

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <SectionHeader
            eyebrow={historia.eyebrow}
            title={historia.title}
            className="mb-8"
          />
          <div className="space-y-5">
            {(historia.paragraphs ?? []).map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-relaxed text-ink-muted sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="bg-white">
        <SectionHeader
          eyebrow={featuresSection.eyebrow}
          title={featuresSection.title}
          description={featuresSection.description}
          align="center"
        />
        <Grid cols={3}>
          {(featuresSection.items ?? []).map((item, i) => (
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

      <ServiceCtaDark
        title={cta.title}
        description={cta.description}
        primaryLabel={cta.primaryLabel}
        primaryTo={cta.primaryTo}
      />
    </>
  )
}
