/** Enlaces del dropdown Servicios */
export const SERVICE_LINKS = [
  { label: 'Talleres móviles', path: '/talleres-moviles' },
  { label: 'Ventanas y Lunetas', path: '/ventanas-lunetas' },
  { label: 'Equipamiento Escolar', path: '/equipamiento-escolar' },
  { label: 'Banquetas', path: '/banquetas' },
  { label: 'Butacas', path: '/butacas' },
  { label: 'Accesorios', path: '/accesorios' },
]

/** Navegación principal (sin servicios — van en dropdown) */
export const MAIN_NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Trabajos', path: '/trabajos-realizados' },
  { label: 'Contacto', path: '/contacto' },
]

/** Rutas de servicios para estado activo del dropdown */
export const SERVICE_PATHS = SERVICE_LINKS.map((link) => link.path)
