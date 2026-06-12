/**
 * Auditoría maestra CMS — npm run audit:cms
 */
import { runAudit as runAllServices } from './audit-all-services.mjs'
import { runAudit as runServiceImages } from './audit-service-images.mjs'
import { runAudit as runServiceSeo } from './audit-service-seo.mjs'
import { runAudit as runHome } from './audit-home.mjs'
import { runAudit as runHomeHero } from './audit-home-hero.mjs'
import { runAudit as runContact } from './audit-contact.mjs'
import { runAudit as runImageFormats } from './audit-image-formats.mjs'
import { runAudit as runWebpReadiness } from './audit-webp-readiness.mjs'
import { runAudit as runLocalImages } from './audit-local-images.mjs'
import { runAudit as runServiceShowcases } from './audit-service-showcases.mjs'
import { runAudit as runHomeShowcase } from './audit-home-showcase.mjs'
import { runAudit as runHomeServices } from './audit-home-services.mjs'
import { runAudit as runHomeBrands } from './audit-home-brands.mjs'
import { runAudit as runCmsLive } from './audit-cms-live.mjs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { formatBytes, SERVICE_SUB_PAGE_KEYS } from './lib/imageAuditShared.mjs'

const services = await runAllServices()
const images = await runServiceImages()
const seo = await runServiceSeo()
const home = await runHome()
const homeHero = await runHomeHero()
const contact = await runContact()
const formats = await runImageFormats()
const webp = await runWebpReadiness()
const local = await runLocalImages()
const showcases = await runServiceShowcases()
const homeShowcase = await runHomeShowcase()
const homeServices = await runHomeServices()
const homeBrands = await runHomeBrands()

const integrityScript = join(dirname(fileURLToPath(import.meta.url)), 'audit-cms-integrity.mjs')
const integrityProc = spawnSync(process.execPath, [integrityScript], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
})
if (integrityProc.stdout) process.stdout.write(integrityProc.stdout)
if (integrityProc.stderr) process.stderr.write(integrityProc.stderr)
const cmsIntegrity = {
  errors: integrityProc.status ?? 1,
  warnings: 0,
  passed: (integrityProc.status ?? 1) === 0,
}

const sections = [
  { name: 'Services', errors: services.errors, warnings: services.warnings, passed: services.errors === 0 },
  { name: 'Showcases', errors: showcases.errors, warnings: showcases.warnings, passed: showcases.errors === 0 },
  { name: 'Images', errors: images.errors, warnings: images.warnings, passed: images.errors === 0 },
  { name: 'SEO', errors: seo.errors, warnings: seo.warnings, passed: seo.errors === 0 },
  { name: 'Home', errors: home.errors, warnings: home.warnings, passed: home.errors === 0 },
  { name: 'HomeHero', errors: homeHero.errors, warnings: homeHero.warnings, passed: homeHero.errors === 0 },
  { name: 'HomeShowcase', errors: homeShowcase.errors, warnings: homeShowcase.warnings, passed: homeShowcase.errors === 0 },
  { name: 'HomeServices', errors: homeServices.errors, warnings: homeServices.warnings, passed: homeServices.errors === 0 },
  { name: 'HomeBrands', errors: homeBrands.errors, warnings: homeBrands.warnings, passed: homeBrands.errors === 0 },
  { name: 'CMSIntegrity', errors: cmsIntegrity.errors, warnings: cmsIntegrity.warnings, passed: cmsIntegrity.passed },
]

const cmsLive = await runCmsLive()
const cmsLiveSection = {
  name: 'CMSLiveIntegrity',
  errors: cmsLive.errors,
  warnings: cmsLive.warnings,
  passed: cmsLive.passed,
}
sections.push(cmsLiveSection)
sections.push(
  { name: 'Contact', errors: contact.errors, warnings: contact.warnings, passed: contact.errors === 0 },
  { name: 'WebP', errors: webp.errors, warnings: webp.warnings, passed: webp.errors === 0 },
)

const totalErrors = sections.reduce((n, s) => n + s.errors, 0)
const totalWarnings = sections.reduce((n, s) => n + s.warnings, 0)

console.info('\n================================================')
console.info('CMS HEALTH REPORT')
console.info('================================================\n')

for (const section of sections) {
  console.info(section.name)
  console.info(`  Passed:   ${section.passed ? 'YES' : 'NO'}`)
  console.info(`  Warnings: ${section.warnings}`)
  console.info(`  Errors:   ${section.errors}`)
  console.info('')
}

console.info('Image formats')
console.info(`  webp: ${formats.counts.webp ?? 0}`)
console.info(`  jpg:  ${formats.counts.jpg ?? 0}`)
console.info(`  jpeg: ${formats.counts.jpeg ?? 0}`)
console.info(`  png:  ${formats.counts.png ?? 0}`)
console.info(`  Potential savings: ~${formatBytes(formats.savingsBytes)}`)
console.info(`  Local pending:     ${local.pending}`)
console.info('')
console.info(`Services audited: ${SERVICE_SUB_PAGE_KEYS.length}`)
console.info('================================================')
console.info(`TOTAL ERRORS:   ${totalErrors}`)
console.info(`TOTAL WARNINGS: ${totalWarnings}`)
console.info('================================================\n')

if (totalErrors > 0) process.exit(1)
