import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ESPECIALIDADES } from '@/data/especialidades'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

const ease = [0.25, 0.1, 0.25, 1]

function TechnicalList({ items, className }) {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]"
        >
          <span
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SpecGroup({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h4>
      <TechnicalList items={items} className="mt-4" />
    </div>
  )
}

function EspecialidadBlock({ item, reverse, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.05, ease }}
      className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20"
    >
      <div className={cn('relative lg:sticky lg:top-24', reverse ? 'lg:order-1' : 'lg:order-2')}>
        <div className="relative overflow-hidden rounded-card border border-border bg-white shadow-card">
          <div className="aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
            <img
              src={item.image}
              alt={item.imageAlt || ''}
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div className={cn('min-w-0', reverse ? 'lg:order-2' : 'lg:order-1')}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
          Especialidad {String(index + 1).padStart(2, '0')}
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {item.title}
        </h3>

        <p className="mt-2 text-lg font-medium tracking-tight text-ink/80 sm:text-xl">
          {item.subtitle}
        </p>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
          {item.intro}
        </p>

        <div className="mt-6 space-y-4">
          {item.specGroups.map((group) => (
            <SpecGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <Button to={item.cta.path} variant="outline" size="md">
            {item.cta.label}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export function EspecialidadesUtilcar() {
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Especialidades"
        title="Especialidades Utilcar"
        description="Ingeniería, fabricación e instalación con materiales certificados, procesos controlados y cumplimiento normativo."
        align="center"
        className="mx-auto max-w-2xl"
      />

      <div className="mt-14 space-y-20 sm:mt-16 sm:space-y-24 lg:mt-20 lg:space-y-28">
        {ESPECIALIDADES.map((item, index) => (
          <EspecialidadBlock
            key={item.id}
            item={item}
            index={index}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </Section>
  )
}
