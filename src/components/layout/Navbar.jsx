import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useMainNavLinks, useServiceLinks } from '@/hooks/useCms'
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

export function Navbar() {
  const mainNavLinks = useMainNavLinks()
  const serviceLinks = useServiceLinks()
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

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <Button
              to="/contacto"
              variant="primary"
              size="sm"
              className="hidden shrink-0 lg:inline-flex"
            >
              Cotizar
            </Button>

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

              <div className="mt-3 border-t border-border pt-3">
                <Button
                  to="/contacto"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={closeMobile}
                >
                  Cotizar
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  )
}
