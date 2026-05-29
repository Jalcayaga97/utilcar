/**
 * Combina clases condicionales de forma segura.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
