import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Grid } from '@/components/ui/Grid'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WorkCardImage } from '@/components/ui/WorkCardImage'
import {
  getServicePortfolioItemLimit,
  buildServicePortfolioTrabajosLink,
} from '@/constants/servicePortfolio'
import { logServicePortfolioAudit } from '@/lib/cms/servicePageAuditLog'

const ease = [0.25, 0.1, 0.25, 1]

const SERVICE_PORTFOLIO_CTA_LABEL = 'Ver todos los trabajos'

/**
 * Trabajos realizados en páginas de servicio — tarjetas workProject (mismo patrón que Home).
 * @param {string} pageKey — slug de servicio (ej. talleres-moviles) para el CTA al catálogo.
 */
export function ServicePagePortfolio({
  pageKey,
  eyebrow,
  title,
  description,
  projects = [],
}) {
  const hasHeader = Boolean(String(title ?? '').trim())
  const totalCount = projects.length
  const maxItems = getServicePortfolioItemLimit(pageKey)
  const visibleProjects = useMemo(
    () => projects.slice(0, maxItems),
    [projects, maxItems],
  )
  const showCta = Boolean(String(pageKey ?? '').trim())
  const trabajosLink = buildServicePortfolioTrabajosLink(pageKey)

  useEffect(() => {
    logServicePortfolioAudit({
      pageKey: pageKey ?? '',
      layer: 'ServicePagePortfolio',
      hasHeader,
      projectCount: totalCount,
      visibleCount: visibleProjects.length,
      showCta,
      renderCards: visibleProjects.length > 0,
      projects: visibleProjects.map((p) => ({
        id: p.id,
        title: p.title,
        hasImage: Boolean(p.image),
      })),
    })
  }, [hasHeader, pageKey, showCta, totalCount, visibleProjects])

  if (!hasHeader && totalCount === 0) return null

  return (
    <Section>
      {hasHeader ? (
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          className="mx-auto max-w-2xl"
        />
      ) : null}
      {visibleProjects.length > 0 ? (
        <Grid cols={3} className={hasHeader ? 'mt-12' : undefined}>
          {visibleProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.24), ease }}
            >
              <Card hover className="flex h-full flex-col">
                <WorkCardImage
                  src={project.image}
                  imageKey={project.imageKey}
                  alt={project.imageAlt}
                  className="mb-4"
                />
                {project.category ? (
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                    {project.category}
                  </p>
                ) : null}
                <h3 className="mt-2 text-lg font-semibold text-ink">{project.title}</h3>
                {project.description ? (
                  <p className="mt-2 text-sm text-ink-muted">{project.description}</p>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </Grid>
      ) : null}
      {showCta ? (
        <div
          className={`flex justify-center${visibleProjects.length > 0 || hasHeader ? ' mt-12' : ''}`}
        >
          <Button to={trabajosLink} variant="outline" size="md">
            {SERVICE_PORTFOLIO_CTA_LABEL}
          </Button>
        </div>
      ) : null}
    </Section>
  )
}
