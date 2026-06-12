import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Wrench } from 'lucide-react'
import { cn } from '@/lib/cn'
import { mapContractItemsForMainServices } from '@/lib/cms/contracts/servicesContract'
import { resolveCmsIcon } from '@/lib/cms/icons/resolveCmsIcon'
import { buildMainServiceCards } from '@/lib/services/serviceCatalog'
import { useServiceLinks, useServices } from '@/hooks/useCms'
import { useHomeContent } from '@/contexts/HomeContentContext'
import { getServiceImage } from '@/assets/images'
import { Section, SectionHeader } from '@/components/ui/Section'

const ease = [0.25, 0.1, 0.25, 1]
const FALLBACK_ICON = Wrench

function ServiceCard({ service, index, cardLinkLabel }) {
  const Icon = resolveCmsIcon(service.icon) ?? FALLBACK_ICON
  const image = service.imageUrl ?? getServiceImage(service.id)
  const linkLabel = service.cardLinkLabel ?? cardLinkLabel

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease }}
      className="h-full"
    >
      <Link to={service.path} className="group flex h-full flex-col">
        <article
          className={cn(
            'flex h-full flex-col overflow-hidden rounded-card border border-border bg-white',
            'shadow-card transition-[border-color,box-shadow,transform] duration-300',
            'hover:-translate-y-0.5 hover:border-ink/10 hover:shadow-elevated',
          )}
        >
          <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface">
            {image ? (
              <>
                <img
                  src={image}
                  alt={service.imageAlt || ''}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.12] to-transparent"
                  aria-hidden
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center" aria-hidden>
                <Icon
                  className="h-10 w-10 text-ink/[0.08] transition-colors duration-300 group-hover:text-ink/[0.12]"
                  strokeWidth={1}
                />
              </div>
            )}
            <div
              className={cn(
                'absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-md',
                'border border-border/80 bg-white/95 text-ink backdrop-blur-sm',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
              {service.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
              {service.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              {linkLabel}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </span>
          </div>
        </article>
      </Link>
    </motion.li>
  )
}

/**
 * @param {{ activeSection?: object | null }} props
 * activeSection — getActiveServicesSection(extensions) desde Home cuando resolver ON.
 */
export function MainServices({ activeSection = null }) {
  const { services: legacyServicesMeta } = useHomeContent()
  const serviceLinks = useServiceLinks()
  const servicesCatalog = useServices()

  const sectionMeta = activeSection ?? legacyServicesMeta
  const defaultCardLinkLabel = sectionMeta.cardLinkLabel || 'Ver más'

  const services = useMemo(() => {
    const cmsByPath = activeSection?.items?.length
      ? Object.fromEntries(
          mapContractItemsForMainServices(activeSection.items, defaultCardLinkLabel).map(
            (item) => [item.path, item],
          ),
        )
      : {}

    return buildMainServiceCards({
      serviceLinks,
      services: servicesCatalog,
      cmsByPath,
      cardLinkLabel: defaultCardLinkLabel,
    }).map((item) => ({
      ...item,
      icon: typeof item.icon === 'string' ? resolveCmsIcon(item.icon) : item.icon,
    }))
  }, [serviceLinks, servicesCatalog, activeSection?.items, defaultCardLinkLabel])

  return (
    <Section className="bg-white">
      <SectionHeader
        eyebrow={sectionMeta.eyebrow}
        title={sectionMeta?.title ?? ''}
        description={sectionMeta?.description ?? ''}
      />

      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            cardLinkLabel={defaultCardLinkLabel}
          />
        ))}
      </ul>
    </Section>
  )
}
