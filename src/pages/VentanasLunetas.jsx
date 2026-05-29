import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BrandEquipmentPanel } from '@/components/sections/BrandEquipmentPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { IMAGES } from '@/assets/images'
import { useVentanasLunetasContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

export default function VentanasLunetas() {
  const { hero, intro, gallery, brands, cta } = useVentanasLunetasContent()
  const { title, paragraphs, procesoTemplado, especificaciones } = intro
  return (
    <>
      <PageMeta page="ventanas-lunetas" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={IMAGES.ventanas.hero}
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
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {paragraphs[0]}
          </p>

          <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              {procesoTemplado.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {procesoTemplado.text}
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {especificaciones.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-muted"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-white">
                  <Check className="h-3 w-3 text-ink" strokeWidth={2} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </Section>

      <Section className="bg-white">
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
          <ImageGallery images={IMAGES.ventanas.gallery} />
        </motion.div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow={brands.eyebrow}
          title={brands.title}
          description={brands.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <div className="mt-12">
          <BrandEquipmentPanel />
        </div>
      </Section>

      <ServiceCtaDark title={cta.title} description={cta.description} />
    </>
  )
}
