import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServicePageShowcaseSection } from '@/components/sections/ServicePageShowcaseSection'
import { ServicePagePortfolio } from '@/components/sections/ServicePagePortfolio'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BanquetasCategoryPanel } from '@/components/sections/BanquetasCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { CmsPageSkeleton } from '@/components/cms/CmsPageSkeleton'
import { useServicePageDisplay } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

function hasRichTextContent(intro) {
  if (!intro) return false
  const hasEyebrow = Boolean(String(intro.eyebrow ?? '').trim())
  const hasTitle = Boolean(String(intro.title ?? '').trim())
  const hasParagraphs = (intro.paragraphs ?? []).some((p) => String(p).trim())
  return hasEyebrow || hasTitle || hasParagraphs
}

export default function Banquetas() {
  const { content, heroImage, portfolioProjects, tabs, seo, source, showcaseImages, isLoading } =
    useServicePageDisplay('banquetas')
  const { hero, intro, gallery, categories } = content
  const isCms = source === 'cms'
  const showIntro = hasRichTextContent(intro)

  if (isLoading) return <CmsPageSkeleton variant="service" />

  return (
    <>
      <PageMeta page="banquetas" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        highlights={hero.highlights}
        image={heroImage}
        imageAlt={hero.imageAlt}
      />

      <ServicePageShowcaseSection showcase={content.showcase} images={showcaseImages} />

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
            eyebrow={categories.eyebrow}
            title={categories.title}
            description={categories.description}
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
            <BanquetasCategoryPanel tabs={tabs} cmsFirst={isCms} />
          </motion.div>
        </Section>
      ) : null}

      <ServicePagePortfolio
        pageKey="banquetas"
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        description={gallery.description}
        projects={portfolioProjects ?? []}
      />

      <ServiceCtaDark {...(isCms ? content.cta : undefined)} />
    </>
  )
}
