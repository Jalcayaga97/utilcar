/**
 * Wrapper: ejecuta la migración desde utilcar-web (importa services.js).
 *
 * Uso (desde utilcar-web/utilcar-studio):
 *   npm run migrate:services
 *   npm run migrate:services:dry
 */
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const webScript = join(__dirname, '../../scripts/migrate-services-content.mjs')
const args = process.argv.slice(2)

const child = spawn(process.execPath, [webScript, ...args], {
  stdio: 'inherit',
  cwd: join(__dirname, '../..'), // utilcar-web
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 1))
