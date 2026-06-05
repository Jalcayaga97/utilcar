import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServicePagePortfolio } from '@/components/sections/ServicePagePortfolio'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { AccesoriosCategoryPanel } from '@/components/sections/AccesoriosCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { useServicePageDisplay } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

function hasRichTextContent(intro) {
  if (!intro) return false
  const hasEyebrow = Boolean(String(intro.eyebrow ?? '').trim())
  const hasTitle = Boolean(String(intro.title ?? '').trim())
  const hasParagraphs = (intro.paragraphs ?? []).some((p) => String(p).trim())
  return hasEyebrow || hasTitle || hasParagraphs
}

export default function Accesorios() {
  const { content, heroImage, portfolioProjects, tabs, seo, source } =
    useServicePageDisplay('accesorios')
  const { hero, intro, gallery, catalog } = content
  const isCms = source === 'cms'
  const showIntro = hasRichTextContent(intro)

  return (
    <>
      <PageMeta page="accesorios" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        highlights={hero.highlights}
        image={heroImage}
        imageAlt={hero.imageAlt}
      />

      {showIntro ? (
        <Section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-3xl"
          >
            <SectionHeader eyebrow={intro.eyebrow} title={intro.title} className="mb-8" />
            <div className="space-y-5">
              {(intro.paragraphs ?? []).map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink-muted sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </Section>
      ) : null}

      {tabs?.length ? (
        <Section className={showIntro ? 'bg-white' : undefined}>
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
            <AccesoriosCategoryPanel tabs={tabs} cmsFirst={isCms} />
          </motion.div>
        </Section>
      ) : null}

      <ServicePagePortfolio
        pageKey="accesorios"
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        description={gallery.description}
        projects={portfolioProjects ?? []}
      />

      <ServiceCtaDark />
    </>
  )
}
