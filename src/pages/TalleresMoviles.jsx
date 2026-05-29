import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { IMAGES } from '@/assets/images'
import { useTalleresMovilesContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

function BulletList({ items, title }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 sm:p-7">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
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

export default function TalleresMoviles() {
  const { hero, intro, scope, gallery } = useTalleresMovilesContent()

  return (
    <>
      <PageMeta page="talleres-moviles" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={IMAGES.talleres.hero}
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
            title={intro.title}
            className="mb-8"
          />
          <div className="space-y-5">
            {intro.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-ink-muted sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="bg-white">
        <SectionHeader
          eyebrow={scope.eyebrow}
          title={scope.title}
          description={scope.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          <BulletList
            title={scope.lists.soluciones.title}
            items={scope.lists.soluciones.items}
          />
          <BulletList
            title={scope.lists.caracteristicas.title}
            items={scope.lists.caracteristicas.items}
          />
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
          <ImageGallery images={IMAGES.talleres.gallery} />
        </motion.div>
      </Section>

      <ServiceCtaDark />
    </>
  )
}
