/**
 * Consolidado producción — npm run audit:production-readiness
 */
import { runAudit as runAllServices } from './audit-all-services.mjs'
import { runAudit as runServiceImages } from './audit-service-images.mjs'
import { runAudit as runServiceSeo } from './audit-service-seo.mjs'
import { runAudit as runHome } from './audit-home.mjs'
import { runAudit as runHomeShowcase } from './audit-home-showcase.mjs'
import { runAudit as runHomeServices } from './audit-home-services.mjs'
import { runAudit as runHomeBrands } from './audit-home-brands.mjs'
import { runAudit as runContact } from './audit-contact.mjs'
import { runAudit as runCmsLive } from './audit-cms-live.mjs'
import { runAudit as runWebp } from './audit-webp-readiness.mjs'

const sections = [
  { label: 'Services', run: runAllServices },
  { label: 'Images', run: runServiceImages },
  { label: 'SEO', run: runServiceSeo },
  { label: 'Home', run: runHome },
  { label: 'HomeShowcase', run: runHomeShowcase },
  { label: 'HomeServices', run: runHomeServices },
  { label: 'HomeBrands', run: runHomeBrands },
  { label: 'Contact', run: runContact },
  { label: 'CMSLive', run: runCmsLive },
  { label: 'WebP', run: runWebp },
]

const results = []
for (const section of sections) {
  results.push({ label: section.label, ...(await section.run()) })
}

const totalErrors = results.reduce((n, r) => n + (r.errors ?? 0), 0)
const totalWarnings = results.reduce((n, r) => n + (r.warnings ?? 0), 0)

console.info('\nUTILCAR PRODUCTION READINESS\n')
for (const r of results) {
  const pass = (r.errors ?? 0) === 0
  console.info(`${r.label.padEnd(14)} ${pass ? 'PASS' : 'FAIL'}`)
}
console.info('')
console.info(`TOTAL ERRORS: ${totalErrors}`)
console.info(`TOTAL WARNINGS: ${totalWarnings}`)
console.info('')

if (totalErrors === 0 && totalWarnings === 0) {
  console.info('READY FOR PRODUCTION\n')
} else if (totalErrors === 0) {
  console.info('READY FOR PRODUCTION (con warnings menores)\n')
} else {
  console.info('NOT READY — corregir errores\n')
  process.exit(1)
}

if (totalWarnings > 0) process.exit(0)
