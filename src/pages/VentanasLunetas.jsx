import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServicePagePortfolio } from '@/components/sections/ServicePagePortfolio'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BrandEquipmentPanel } from '@/components/sections/BrandEquipmentPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { useServicePageDisplay } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

export default function VentanasLunetas() {
  const { content, heroImage, portfolioProjects, tabs, seo, source } =
    useServicePageDisplay('ventanas-lunetas')
  const { hero, intro, gallery, brands } = content
  const { title, paragraphs, procesoTemplado, especificaciones } = intro
  const isCms = source === 'cms'

  return (
    <>
      <PageMeta page="ventanas-lunetas" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        highlights={hero.highlights}
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
          {paragraphs?.[0] ? (
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
              {paragraphs[0]}
            </p>
          ) : null}

          {procesoTemplado?.title ? (
            <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                {procesoTemplado.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                {procesoTemplado.text}
              </p>
            </div>
          ) : null}

          {especificaciones?.length ? (
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
          ) : null}
        </motion.div>
      </Section>

      {tabs?.length ? (
        <Section>
          <SectionHeader
            eyebrow={brands.eyebrow}
            title={brands.title}
            description={brands.description}
            align="center"
            className="mx-auto max-w-2xl"
          />
          <div className="mt-12">
            <BrandEquipmentPanel tabs={tabs} cmsFirst={isCms} />
          </div>
        </Section>
      ) : null}

      <ServicePagePortfolio
        pageKey="ventanas-lunetas"
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        description={gallery.description}
        projects={portfolioProjects ?? []}
      />

      <ServiceCtaDark />
    </>
  )
}
