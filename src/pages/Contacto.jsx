import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { ContactForm } from '@/components/sections/ContactForm'
import { ContactFaq } from '@/components/sections/ContactFaq'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'
import { CmsPageSkeleton } from '@/components/cms/CmsPageSkeleton'
import { useCompanyInfo, useContactPageDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-white p-5 transition-colors duration-300',
        'hover:border-ink/15',
      )}
    >
      <Icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 space-y-1 text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  )
}

export default function Contacto() {
  const { content, heroImage, seo, source, isLoading } = useContactPageDisplay()
  const company = useCompanyInfo()

  useEffect(() => {
    if (isLoading) return
    logRuntime('contact-page', {
      source,
      companySource: company.source,
      faqItems: content.faqItems?.length ?? 0,
    })
  }, [source, company.source, content.faqItems?.length, isLoading])

  if (isLoading) return <CmsPageSkeleton />

  const hero = content.hero ?? {}
  const intro = content.intro ?? { paragraphs: [] }
  const details = content.details ?? { cards: {} }
  const cta = content.cta ?? {}
  const map = content.map
  const faq = content.faq ?? {}
  const detailsCards = details.cards ?? {}
  const phoneCard = detailsCards.phone ?? {}
  const emailCard = detailsCards.email ?? {}
  const addressCard = detailsCards.address ?? {}
  const hoursCard = detailsCards.hours ?? {}
  const isDetailCardVisible = (card) => card?.enabled !== false

  return (
    <>
      <PageMeta page="contacto" cmsSeo={seo ?? undefined} />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={heroImage || IMAGES.talleres.hero}
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
          {intro.paragraphs?.length ? (
            intro.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-relaxed text-ink-muted sm:text-lg"
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
              Para mayor información puede contactarnos al correo{' '}
              <a
                href={`mailto:${company.primaryEmail}`}
                className="font-medium text-ink underline-offset-2 hover:underline"
              >
                {company.primaryEmail}
              </a>
              {company.secondaryEmail ? (
                <>
                  {' '}
                  o{' '}
                  <a
                    href={`mailto:${company.secondaryEmail}`}
                    className="font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {company.secondaryEmail}
                  </a>
                </>
              ) : null}{' '}
              al teléfono{' '}
              <a
                href={company.phoneTel}
                className="font-medium text-ink underline-offset-2 hover:underline"
              >
                {company.phoneDisplay}
              </a>
              .
            </p>
          )}
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            {intro.formHint}
          </p>
        </motion.div>
      </Section>

      <Section id="formulario" className="scroll-mt-24 bg-white">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {details.title ?? ''}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {details.description ?? ''}
              </p>
            </div>

            {isDetailCardVisible(phoneCard) ? (
              <ContactCard icon={Phone} title={phoneCard.title ?? 'Teléfono'}>
                <a
                  href={company.phoneTel}
                  className="block font-medium text-ink hover:text-ink-muted"
                >
                  {company.phoneDisplay}
                </a>
                {company.secondaryPhone ? (
                  <a
                    href={company.secondaryPhoneTel}
                    className="block font-medium text-ink hover:text-ink-muted"
                  >
                    {company.secondaryPhone}
                  </a>
                ) : null}
              </ContactCard>
            ) : null}

            {isDetailCardVisible(emailCard) ? (
              <ContactCard icon={Mail} title={emailCard.title ?? 'Correos'}>
                {(company.emails ?? []).map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="block font-medium text-ink hover:text-ink-muted"
                  >
                    {email}
                  </a>
                ))}
              </ContactCard>
            ) : null}

            {isDetailCardVisible(addressCard) ? (
              <ContactCard icon={MapPin} title={addressCard.title ?? 'Dirección'}>
                <p className="font-medium text-ink">{company.addressStreet}</p>
                <p>{company.addressCity}</p>
                <p className="text-ink-subtle">{company.metro}</p>
              </ContactCard>
            ) : null}

            {isDetailCardVisible(hoursCard) ? (
              <ContactCard icon={Clock} title={hoursCard.title ?? 'Horario'}>
                {(company.openingHoursLines ?? []).map((line) => (
                  <p
                    key={line}
                    className={
                      line === company.openingHoursLines?.[0] ? 'font-medium text-ink' : ''
                    }
                  >
                    {line}
                  </p>
                ))}
              </ContactCard>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
          >
            <ContactForm form={content.form} servicios={content.servicios} />
          </motion.div>
        </div>
      </Section>

      <ServiceCtaDark
        title={cta.title}
        description={cta.description}
        primaryLabel={cta.primaryLabel}
        primaryTo={cta.primaryTo}
      />

      {map != null ? (
        <Section>
          <SectionHeader
            eyebrow={map.eyebrow}
            title={map.title}
            align="center"
            className="mx-auto max-w-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="mt-10"
          >
            <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
              <div className="aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[2.2/1]">
                <iframe
                  title={map.iframeTitle}
                  src={`https://maps.google.com/maps?q=${map.embedQuery || company.mapsEmbedQuery}&hl=es&z=16&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="border-t border-border px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-sm font-semibold text-ink">{company.legalName}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {company.addressStreet}, {company.addressCity}.
                </p>
                <p className="mt-1 text-sm text-ink-subtle">{company.metro}</p>
              </div>
            </div>
          </motion.div>
        </Section>
      ) : null}

      <Section className="bg-white">
        <SectionHeader
          eyebrow={faq.eyebrow}
          title={faq.title}
          description={faq.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
          className="mt-10"
        >
          <ContactFaq faqItems={content.faqItems} />
        </motion.div>
      </Section>
    </>
  )
}
