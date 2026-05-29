import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useServiceLinks, useServicePaths } from '@/hooks/useCms'
import { useClickOutside } from '@/hooks/useClickOutside'

const triggerClass = (active, open) =>
  cn(
    'inline-flex h-14 items-center gap-1 rounded-md px-4 text-sm font-medium transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    active || open
      ? 'bg-ink/[0.05] text-ink'
      : 'text-ink-muted hover:bg-ink/[0.03] hover:text-ink',
  )

export function NavServicesDropdown({ onNavigate }) {
  const serviceLinks = useServiceLinks()
  const servicePaths = useServicePaths()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const closeTimer = useRef(null)
  const menuId = useId()
  const { pathname } = useLocation()

  const isActive = servicePaths.includes(pathname)

  const close = useCallback(() => setOpen(false), [])
  const openMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }, [])
  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }, [])

  useClickOutside(containerRef, close)

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      close()
      e.currentTarget.blur()
    }
  }

  return (
    <li
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        className={triggerClass(isActive, open)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
      >
        Servicios
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-labelledby={`${menuId}-trigger`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute left-0 top-full z-50 mt-0.5 min-w-[13.5rem] rounded-card border border-border bg-white py-1.5"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <ul className="flex flex-col">
              {serviceLinks.map((link) => (
                <li key={link.path} role="none">
                  <NavLink
                    to={link.path}
                    role="menuitem"
                    onClick={() => {
                      close()
                      onNavigate?.()
                    }}
                    className={({ isActive: itemActive }) =>
                      cn(
                        'block px-4 py-2.5 text-sm transition-colors duration-150',
                        itemActive
                          ? 'bg-ink/[0.05] font-medium text-ink'
                          : 'text-ink-muted hover:bg-ink/[0.03] hover:text-ink',
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
    </li>
  )
}
