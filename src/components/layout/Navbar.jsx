import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCompanyInfo, useMainNavLinks, useServiceLinks } from '@/hooks/useCms'
import { Logo } from '@/components/brand/Logo'
import { NavServicesDropdown } from '@/components/layout/NavServicesDropdown'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

const navItemClass = (isActive) =>
  cn(
    'inline-flex h-14 items-center rounded-md px-4 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-ink/[0.05] text-ink'
      : 'text-ink-muted hover:bg-ink/[0.03] hover:text-ink',
  )

const socialButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-white text-ink transition-colors hover:border-ink/20 hover:text-ink focus-visible:outline-offset-2'

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 22v-8h2.7l.5-3.2H13.5V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.5H7.8v3.2h2.7v8h2.9z" />
    </svg>
  )
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function NavbarSocialLinks({ instagramUrl, facebookUrl, className }) {
  if (!instagramUrl && !facebookUrl) return null

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {instagramUrl ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Seguir a Utilcar en Instagram"
          className={socialButtonClass}
        >
          <InstagramIcon className="h-[1.125rem] w-[1.125rem]" />
        </a>
      ) : null}
      {facebookUrl ? (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Seguir a Utilcar en Facebook"
          className={socialButtonClass}
        >
          <FacebookIcon className="h-[1.125rem] w-[1.125rem]" />
        </a>
      ) : null}
    </div>
  )
}

function NavbarWhatsAppCta({ whatsappUrl, className, onClick, fullLabel = false }) {
  if (!whatsappUrl) return null

  return (
    <Button
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant="primary"
      size="sm"
      aria-label="Cotizar por WhatsApp"
      className={cn('shrink-0', className)}
      onClick={onClick}
    >
      {fullLabel ? (
        <span>Cotizar por WhatsApp</span>
      ) : (
        <>
          <WhatsAppIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline lg:hidden">WhatsApp</span>
          <span className="hidden lg:inline">Cotizar por WhatsApp</span>
        </>
      )}
    </Button>
  )
}

export function Navbar() {
  const mainNavLinks = useMainNavLinks()
  const serviceLinks = useServiceLinks()
  const company = useCompanyInfo()
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const closeMobile = () => {
    setOpen(false)
    setServicesOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-button focus:border focus:border-border focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
    >
      Saltar al contenido principal
    </a>
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-border bg-white/95 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-surface/90 backdrop-blur-sm',
      )}
    >
      <Container>
        <div className="flex h-14 items-center gap-4 sm:gap-6">
          <Logo variant="navbar" onClick={closeMobile} />

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
            aria-label="Principal"
          >
            <ul className="flex items-center gap-0.5">
              <li>
                <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
                  Inicio
                </NavLink>
              </li>

              <NavServicesDropdown />

              {mainNavLinks.filter((l) => l.path !== '/').map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <NavbarSocialLinks
              instagramUrl={company.instagramUrl}
              facebookUrl={company.facebookUrl}
              className="hidden sm:flex"
            />

            <NavbarWhatsAppCta whatsappUrl={company.whatsappUrl} className="inline-flex" />

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-ink transition-colors hover:border-ink/20 lg:hidden"
              aria-expanded={open}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
              ) : (
                <Menu className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <Container className="py-3">
              <nav className="flex flex-col gap-0.5" aria-label="Móvil">
                <NavLink
                  to="/"
                  end
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-ink/5 text-ink' : 'text-ink-muted',
                    )
                  }
                >
                  Inicio
                </NavLink>

                <div>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      servicesOpen ? 'bg-ink/5 text-ink' : 'text-ink-muted',
                    )}
                    aria-expanded={servicesOpen}
                    onClick={() => setServicesOpen((v) => !v)}
                  >
                    Servicios
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        servicesOpen && 'rotate-180',
                      )}
                      strokeWidth={1.75}
                    />
                  </button>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-0.5 space-y-0.5 border-l border-border py-1 pl-3 ml-3">
                          {serviceLinks.map((link) => (
                            <li key={link.path}>
                              <NavLink
                                to={link.path}
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                  cn(
                                    'block rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                      ? 'font-medium text-ink'
                                      : 'text-ink-muted hover:text-ink',
                                  )
                                }
                              >
                                {link.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {mainNavLinks.filter((l) => l.path !== '/').map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-ink/5 text-ink' : 'text-ink-muted',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <NavbarSocialLinks
                  instagramUrl={company.instagramUrl}
                  facebookUrl={company.facebookUrl}
                  className="sm:hidden"
                />
                <NavbarWhatsAppCta
                  whatsappUrl={company.whatsappUrl}
                  className="w-full"
                  fullLabel
                  onClick={closeMobile}
                />
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  )
}
