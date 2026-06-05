import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { TrabajosPortfolio } from '@/components/sections/TrabajosPortfolio'
import { Section, SectionHeader } from '@/components/ui/Section'
import { useWorkPageDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'

const ease = [0.25, 0.1, 0.25, 1]

export default function Trabajos() {
  const { content, heroImage, seo, source } = useWorkPageDisplay()
  const { hero, intro, projects, cta } = content
  const { title, paragraphs } = intro

  useEffect(() => {
    logRuntime('work-page', { source, hasHeroImage: Boolean(heroImage) })
  }, [source, heroImage])

  return (
    <>
      <PageMeta page="trabajos-realizados" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={heroImage}
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
          <SectionHeader eyebrow={intro.eyebrow} title={title} className="mb-8" />
          <div className="space-y-5">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph}
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
          eyebrow={projects.eyebrow}
          title={projects.title}
          description={projects.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12"
        >
          <TrabajosPortfolio />
        </motion.div>
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
