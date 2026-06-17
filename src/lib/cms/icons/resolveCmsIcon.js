import {
  Award,
  BedDouble,
  Bus,
  CheckCircle,
  GraduationCap,
  Layers,
  LayoutGrid,
  RotateCcw,
  Scissors,
  Settings,
  Shield,
  Shirt,
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
  shield: Shield,
  layers: Layers,
  'rotate-ccw': RotateCcw,
  rotateccw: RotateCcw,
  shirt: Shirt,
  'bed-double': BedDouble,
  beddouble: BedDouble,
  scissors: Scissors,
  tapiceria: Scissors,
}

function isRenderableIcon(value) {
  if (!value) return false
  if (typeof value === 'function') return true
  if (typeof value === 'object' && typeof value.render === 'function') return true
  return false
}

/**
 * @param {string | import('react').ComponentType | null | undefined} name
 * @returns {import('react').ComponentType | null}
 */
export function resolveCmsIcon(name) {
  if (!name) return null
  if (typeof name === 'string') {
    const key = name.toLowerCase().trim().replace(/\s+/g, '-')
    return CMS_ICON_MAP[key] ?? CMS_ICON_MAP[key.replace(/-/g, '')] ?? null
  }
  if (isRenderableIcon(name)) return name
  return null
}

/** Componente Lucide → clave string (para snapshots JSON). */
export function cmsIconToKey(icon) {
  if (typeof icon === 'string') return icon
  if (!isRenderableIcon(icon)) return null
  for (const [key, comp] of Object.entries(CMS_ICON_MAP)) {
    if (comp === icon) return key
  }
  return null
}
