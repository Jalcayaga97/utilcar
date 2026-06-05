import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { useGlobalServiceCta } from '@/hooks/useCms'

/**
 * Banner CTA inferior.
 * Páginas de servicio: sin props → siteSettings.serviceCta (fallback legacy).
 * Contacto/Trabajos pueden pasar props para override puntual.
 */
export function ServiceCtaDark({
  title,
  description,
  primaryLabel,
  primaryTo,
  showWhatsApp = true,
}) {
  const global = useGlobalServiceCta()

  const resolvedTitle = title ?? global.title
  const resolvedDescription = description ?? global.description
  const resolvedPrimaryLabel = primaryLabel ?? global.primaryLabel
  const resolvedPrimaryTo = primaryTo ?? global.primaryTo

  return (
    <section className="border-t border-ink/10 bg-accent py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {global.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {global.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {resolvedTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">{resolvedDescription}</p>
          <CtaButtonGroup
            variant="dark"
            primaryLabel={resolvedPrimaryLabel}
            primaryTo={resolvedPrimaryTo}
            showWhatsApp={showWhatsApp}
            className="mt-10"
          />
        </div>
      </Container>
    </section>
  )
}
