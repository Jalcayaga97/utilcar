import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { IMAGES } from '@/assets/images'
import { useButacasContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

function SpecBlock({ title: blockTitle, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {blockTitle}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
              <Check className="h-3 w-3 text-ink" strokeWidth={2} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Butacas() {
  const { hero, intro, specs, gallery, cta } = useButacasContent()
  const { title, paragraphs } = intro

  return (
    <>
      <PageMeta page="butacas" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={IMAGES.butacas.hero}
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
          eyebrow={specs.eyebrow}
          title={specs.title}
          description={specs.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {specs.sections.map((block) => (
            <SpecBlock key={block.title} title={block.title} items={block.items} />
          ))}
        </motion.div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          description={gallery.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease }}
          className="mt-12"
        >
          <ImageGallery images={IMAGES.butacas.gallery} />
        </motion.div>
      </Section>

      <ServiceCtaDark title={cta.title} description={cta.description} />
    </>
  )
}
