import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { IMAGES } from '@/assets/images'
import { ESCOLAR_INTRO, ESCOLAR_SECTIONS } from '@/data/equipamientoEscolar'

const ease = [0.25, 0.1, 0.25, 1]

function SpecBlock({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
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

export default function EquipamientoEscolar() {
  const { title, paragraphs } = ESCOLAR_INTRO

  return (
    <>
      <PageMeta page="equipamiento-escolar" />

      <ServicePageHero
        eyebrow="Servicios"
        title="Equipamiento Escolar"
        subtitle="Transformación y equipamiento de vehículos escolares según normativas y requerimientos de transporte."
        image={IMAGES.escolar.hero}
        imageAlt="Equipamiento escolar instalado en vehículo de transporte de pasajeros por Utilcar"
      />

      {/* Introducción técnica */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <SectionHeader
            eyebrow="Especialidad"
            title={title}
            className="mb-8"
          />
          <div className="space-y-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-ink-muted sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Bloques técnicos */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="Especificaciones"
          title="Alcance del equipamiento"
          description="Soluciones integrales para transporte escolar: seguridad, interior, configuración y opcionales según normativa vigente."
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-6"
        >
          {ESCOLAR_SECTIONS.map((block) => (
            <SpecBlock key={block.title} title={block.title} items={block.items} />
          ))}
        </motion.div>
      </Section>

      {/* Galería */}
      <Section>
        <SectionHeader
          eyebrow="Galería"
          title="Trabajos de equipamiento escolar"
          description="Registro visual de conversiones reales: butacas, distribución interior, señalética y terminaciones en taller Utilcar."
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
          <ImageGallery images={IMAGES.escolar.gallery} />
        </motion.div>
      </Section>

      <ServiceCtaDark
        title="Solicite equipamiento escolar a medida"
        description="Relevamos su vehículo, definimos la distribución de plazas, materiales y señalética según normativa, y fabricamos con instalación en taller Utilcar."
      />
    </>
  )
}
