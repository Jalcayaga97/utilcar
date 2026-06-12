/** Normaliza SVG de marca a viewBox 240×80 con área útil al 80%. */
export const BRAND_VIEW_W = 240
export const BRAND_VIEW_H = 80
export const BRAND_FILL_RATIO = 0.8

/**
 * Envuelve un path simple-icons (24×24) en un lienzo corporativo uniforme.
 * @param {{ title: string, path: string, hex: string }} icon
 */
export function svgFromSimpleIcon(icon) {
  const maxW = BRAND_VIEW_W * BRAND_FILL_RATIO
  const maxH = BRAND_VIEW_H * BRAND_FILL_RATIO
  const iconSize = 24
  const scale = Math.min(maxW / iconSize, maxH / iconSize)
  const scaled = iconSize * scale
  const x = (BRAND_VIEW_W - scaled) / 2
  const y = (BRAND_VIEW_H - scaled) / 2
  const title = icon.title ?? 'Brand'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BRAND_VIEW_W} ${BRAND_VIEW_H}" role="img" aria-label="${title}">
  <title>${title}</title>
  <g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path d="${icon.path}" fill="#${icon.hex}"/>
  </g>
</svg>`
}

/**
 * Envuelve contenido SVG arbitrario (paths/text) centrado en el lienzo estándar.
 * @param {{ title: string, inner: string, viewBox?: string }} params
 */
export function svgFromCustomContent({ title, inner, viewBox = `0 0 ${BRAND_VIEW_W} ${BRAND_VIEW_H}` }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">
  <title>${title}</title>
  ${inner}
</svg>`
}
