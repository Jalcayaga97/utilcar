import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { TrabajosPortfolio } from '@/components/sections/TrabajosPortfolio'
import { Section, SectionHeader } from '@/components/ui/Section'
import { useTrabajosPageHero, useWorkContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

export default function Trabajos() {
  const workContent = useWorkContent()
  const trabajosPageHero = useTrabajosPageHero()
  const { page } = workContent
  const { title, paragraphs } = page.intro

  return (
    <>
      <PageMeta page="trabajos-realizados" />

      <ServicePageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        image={trabajosPageHero}
        imageAlt={page.hero.imageAlt}
      />

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <SectionHeader eyebrow={page.intro.eyebrow} title={title} className="mb-8" />
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
          eyebrow={page.projects.eyebrow}
          title={page.projects.title}
          description={page.projects.description}
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
        title={page.cta.title}
        description={page.cta.description}
      />
    </>
  )
}
