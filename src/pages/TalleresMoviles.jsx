import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServicePagePortfolio } from '@/components/sections/ServicePagePortfolio'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { Section, SectionHeader } from '@/components/ui/Section'
import { useServicePageDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'
import {
  logServiceHeroAudit,
  logServicePortfolioAudit,
  logServiceRichTextTrace,
} from '@/lib/cms/servicePageAuditLog'

const ease = [0.25, 0.1, 0.25, 1]

function BulletList({ items, title }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 sm:p-7">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">{title}</h3>
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
  const { content, heroImage, portfolioProjects, portfolioSource, seo, source } =
    useServicePageDisplay('talleres-moviles')
  const { hero, intro, scope, gallery } = content

  useEffect(() => {
    logRuntime('service-page', {
      pageKey: 'talleres-moviles',
      source,
      portfolioSource: portfolioSource ?? 'none',
      portfolioCount: portfolioProjects?.length ?? 0,
      highlightsCount: hero.highlights?.length ?? 0,
      hasHeroImage: Boolean(heroImage),
    })
    logServiceHeroAudit({
      pageKey: 'talleres-moviles',
      layer: 'TalleresMoviles.jsx',
      runtimeSource: source,
      highlightsComponent: hero.highlights ?? [],
      imageComponent: heroImage?.startsWith?.('data:') ? '(placeholder)' : heroImage ?? null,
    })
    logServicePortfolioAudit({
      pageKey: 'talleres-moviles',
      layer: 'TalleresMoviles.jsx',
      projectCount: portfolioProjects?.length ?? 0,
      source: portfolioSource ?? 'none',
      projects: (portfolioProjects ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        hasImage: Boolean(p.image),
      })),
    })
    logServiceRichTextTrace({
      pageKey: 'talleres-moviles',
      runtimeSource: source,
      hasRichTextBlock: Boolean(intro?.title || intro?.paragraphs?.length),
      title: intro?.title ?? '',
      eyebrow: intro?.eyebrow ?? '',
      contentLength: intro?.paragraphs?.length ?? 0,
      contentType: 'intro.paragraphs[]',
    })
  }, [source, portfolioSource, portfolioProjects, hero.highlights, heroImage, intro])

  return (
    <>
      <PageMeta page="talleres-moviles" cmsSeo={seo ?? undefined} />

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
            title={scope.lists?.soluciones?.title}
            items={scope.lists?.soluciones?.items ?? []}
          />
          <BulletList
            title={scope.lists?.caracteristicas?.title}
            items={scope.lists?.caracteristicas?.items ?? []}
          />
        </motion.div>
      </Section>

      <ServicePagePortfolio
        pageKey="talleres-moviles"
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        description={gallery.description}
        projects={portfolioProjects ?? []}
      />

      <ServiceCtaDark />
    </>
  )
}
