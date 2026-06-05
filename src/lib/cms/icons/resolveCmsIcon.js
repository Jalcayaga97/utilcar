import {
  Award,
  Bus,
  CheckCircle,
  GraduationCap,
  LayoutGrid,
  Settings,
  Sofa,
  Star,
  Truck,
  Users,
  Wrench,
  AppWindow,
} from 'lucide-react'

/** Mapa icono string (Sanity) → componente Lucide. */
const CMS_ICON_MAP = {
  wrench: Wrench,
  settings: Settings,
  bus: Bus,
  star: Star,
  users: Users,
  truck: Truck,
  award: Award,
  'check-circle': CheckCircle,
  checkcircle: CheckCircle,
  graduationcap: GraduationCap,
  escolar: GraduationCap,
  appwindow: AppWindow,
  ventanas: AppWindow,
  sofa: Sofa,
  banquetas: Sofa,
  layoutgrid: LayoutGrid,
  butacas: LayoutGrid,
}

/**
 * @param {string | import('react').ComponentType | null | undefined} name
 * @returns {import('react').ComponentType | null}
 */
export function resolveCmsIcon(name) {
  if (!name) return null
  if (typeof name !== 'string') return name
  const key = name.toLowerCase().trim().replace(/\s+/g, '-')
  return CMS_ICON_MAP[key] ?? CMS_ICON_MAP[key.replace(/-/g, '')] ?? null
}
