import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { AccesoriosCategoryPanel } from '@/components/sections/AccesoriosCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'
import { useAccesoriosContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

export default function Accesorios() {
  const { hero, intro, catalog, cta } = useAccesoriosContent()
  const { title, paragraphs } = intro
  return (
    <>
      <PageMeta page="accesorios" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={IMAGES.accesorios.hero}
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
            eyebrow={intro.eyebrow}
            title={title}
            className="mb-8"
          />
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
          eyebrow={catalog.eyebrow}
          title={catalog.title}
          description={catalog.description}
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
          <AccesoriosCategoryPanel />
        </motion.div>
      </Section>

      <ServiceCtaDark title={cta.title} description={cta.description} />
    </>
  )
}
