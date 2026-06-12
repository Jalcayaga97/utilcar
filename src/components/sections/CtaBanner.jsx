import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { useGlobalServiceCta } from '@/hooks/useCms'
import { useHomeContent } from '@/contexts/HomeContentContext'

/**
 * Banner CTA Home — título/descripción editables; botones desde siteSettings.serviceCta.
 */
export function CtaBanner({ title, description }) {
  const defaults = useHomeContent().ctaBanner
  const globalCta = useGlobalServiceCta()

  const resolvedTitle = title ?? defaults.title
  const resolvedDescription = description ?? defaults.description

  return (
    <section className="border-y border-border bg-white py-section-sm lg:py-section">
      <Container>
        <div className="rounded-card border border-border bg-surface p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {resolvedTitle}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{resolvedDescription}</p>
            </div>
            <CtaButtonGroup
              variant="light"
              primaryLabel={globalCta.primaryLabel}
              primaryTo={globalCta.primaryTo}
              className="shrink-0 lg:flex-col lg:items-stretch xl:flex-row"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
