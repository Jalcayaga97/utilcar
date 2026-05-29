import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { SITE } from '@/constants/site'
import { useMainNavLinks, useServiceLinks } from '@/hooks/useCms'
import { Container } from '@/components/ui/Container'

export function Footer() {
  const mainNavLinks = useMainNavLinks()
  const serviceLinks = useServiceLinks()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-white">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="text-base font-semibold tracking-tight text-ink">
              {SITE.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              {SITE.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
              Servicios
            </h3>
            <ul className="mt-4 space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
              Empresa
            </h3>
            <ul className="mt-4 space-y-2.5">
              {mainNavLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="flex items-start gap-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-start gap-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-ink-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                {SITE.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle">
            © {year} {SITE.name}. Todos los derechos reservados.
          </p>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar a Utilcar por WhatsApp"
            className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            WhatsApp
          </a>
        </div>
      </Container>
    </footer>
  )
}
