import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BrandEquipmentPanel } from '@/components/sections/BrandEquipmentPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { IMAGES } from '@/assets/images'
import { VENTANAS_INTRO } from '@/data/ventanasLunetas'

const ease = [0.25, 0.1, 0.25, 1]

export default function VentanasLunetas() {
  const { title, paragraphs, procesoTemplado, especificaciones } = VENTANAS_INTRO

  return (
    <>
      <PageMeta page="ventanas-lunetas" />

      <ServicePageHero
        eyebrow="Servicios"
        title="Ventanas y Lunetas"
        subtitle="Instalación y fabricación de ventanas para vehículos utilitarios, minibuses y transporte especializado."
        image={IMAGES.ventanas.hero}
        imageAlt="Ventanas y lunetas instaladas en vehículo utilitario por Utilcar"
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
            eyebrow="Especificaciones"
            title={title}
            className="mb-8"
          />
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {paragraphs[0]}
          </p>

          <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              {procesoTemplado.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {procesoTemplado.text}
            </p>
          </div>

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
        </motion.div>
      </Section>

      {/* Galería */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="Galería"
          title="Trabajos de ventanas y lunetas"
          description="Instalaciones realizadas con marco de aluminio electropintado, vidrios templados y terminación profesional."
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
          <ImageGallery images={IMAGES.ventanas.gallery} />
        </motion.div>
      </Section>

      {/* Equipamiento por marca */}
      <Section>
        <SectionHeader
          eyebrow="Por marca"
          title="Equipamiento por marca"
          description="Soluciones de ventanas, asientos, seguridad, interior y opcionales organizadas según cada fabricante."
          align="center"
          className="mx-auto max-w-2xl"
        />
        <div className="mt-12">
          <BrandEquipmentPanel />
        </div>
      </Section>

      <ServiceCtaDark
        title="Solicite una solución personalizada para su operación"
        description="Relevamos su vehículo, definimos el kit de ventanas o equipamiento y fabricamos con materiales certificados e instalación en taller Utilcar."
      />
    </>
  )
}
