/**
 * Reporte consolidado de auditorías de assets y servicios.
 * npm run audit:all-assets
 */
import { runAudit as runServiceImages } from './audit-service-images.mjs'
import { runAudit as runServiceSeo } from './audit-service-seo.mjs'
import { runAudit as runImageFormats } from './audit-image-formats.mjs'
import { runAudit as runWebpReadiness } from './audit-webp-readiness.mjs'
import { runAudit as runLocalImages } from './audit-local-images.mjs'
import { formatBytes, SERVICE_SUB_PAGE_KEYS } from './lib/imageAuditShared.mjs'

const images = await runServiceImages()
const seo = await runServiceSeo()
const formats = await runImageFormats()
const webp = await runWebpReadiness()
const local = await runLocalImages()

console.info('\n================================================')
console.info('REPORTE CONSOLIDADO — ASSETS & SERVICIOS')
console.info('================================================\n')

console.info('SERVICES')
console.info('========')
console.info(`Services audited: ${SERVICE_SUB_PAGE_KEYS.length}`)
console.info(`Passed: ${images.servicesPassed ?? SERVICE_SUB_PAGE_KEYS.length}`)
console.info(`Warnings: ${images.warnings}`)
console.info(`Errors: ${images.errors}`)

console.info('\nSEO')
console.info('===')
console.info(`Pages audited: ${seo.pages}`)
console.info(`Warnings: ${seo.warnings}`)
console.info(`Errors: ${seo.errors}`)

console.info('\nIMAGES')
console.info('======')
console.info(`Assets checked: ${images.imagesChecked}`)
console.info('')
console.info(`webp: ${formats.counts.webp ?? 0}`)
console.info(`jpg: ${formats.counts.jpg ?? 0}`)
console.info(`jpeg: ${formats.counts.jpeg ?? 0}`)
console.info(`png: ${formats.counts.png ?? 0}`)
console.info('')
console.info(`Potential savings: ~${formatBytes(formats.savingsBytes)}`)
console.info(`Image audit warnings: ${images.warnings}`)
console.info(`Image audit errors: ${images.errors}`)

console.info('\nWEBP READINESS')
console.info('==============')
console.info(`Sanity: ${webp.sanityReady ? 'READY' : 'NOT READY'}`)
console.info(`Local assets pending: ${local.pending}`)

const totalErrors = seo.errors + images.errors + webp.errors
const totalWarnings = seo.warnings + images.warnings + webp.warnings

console.info('\n================================================')
console.info(`TOTAL ERRORS: ${totalErrors}`)
console.info(`TOTAL WARNINGS: ${totalWarnings}`)
console.info('================================================\n')

if (totalErrors > 0) process.exit(1)
