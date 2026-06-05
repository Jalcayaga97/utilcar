# Sanity runtime — utilcar-web monorepo

Utilidades compartidas para scripts de migración, snapshot y diagnóstico sin depender de variables en PowerShell ni rutas fijas al Studio.

## Estructura

```
utilcar-web/
├── .env.local                    # Recomendado: token + project id (frontend + scripts)
├── package.json                  # npm run dev → web + studio
├── scripts/                      # Migraciones, seed, audit
├── src/lib/sanity/runtime/       # loadSanityEnv, findSanityStudioRoot
└── utilcar-studio/               # Única fuente de verdad del CMS Studio
    ├── sanity.config.js
    ├── sanity.cli.cjs
    ├── schemas/
    └── .env                      # Opcional (Studio dev / seed)
```

## Variables de entorno

`loadSanityEnv()` lee en este orden (último archivo gana; `process.env` gana sobre archivos):

1. `utilcar-web/.env.local`
2. `utilcar-web/.env`
3. `utilcar-web/utilcar-studio/.env.local`
4. `utilcar-web/utilcar-studio/.env`

| Variable | Alias aceptados | Requerida |
|----------|-----------------|-----------|
| Project ID | `SANITY_PROJECT_ID`, `SANITY_STUDIO_PROJECT_ID`, `VITE_SANITY_PROJECT_ID` | Sí |
| Dataset | `SANITY_DATASET`, `SANITY_STUDIO_DATASET`, `VITE_SANITY_DATASET` | No (default `production`) |
| Token | `SANITY_API_TOKEN`, `SANITY_AUTH_TOKEN` | Migraciones / snapshot |

Ejemplo `utilcar-web/.env.local`:

```env
VITE_SANITY_PROJECT_ID=tu_project_id
VITE_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
```

## Detección del Studio

`findSanityStudioRoot()` busca, en orden:

1. `utilcar-web/utilcar-studio/` — **única ubicación soportada**
2. Directorio actual y padres (p. ej. ejecutar desde `utilcar-studio/`)

Archivos reconocidos: `sanity.cli.cjs`, `sanity.cli.js`, `sanity.config.js`, etc.

**Snapshot / export:** el Studio usa `"type": "module"`, por lo que el CLI de Sanity no puede `require()` un `sanity.cli.js` ESM. `runSanityDatasetExport()` genera un **sandbox CJS temporal** con `api.projectId` / `dataset` ya resueltos por `loadSanityEnv()`.

## Comandos

Desde **utilcar-web** (raíz del workspace):

```bash
npm install                        # Instala web + studio (postinstall)
npm run dev                        # Frontend (Vite) + Studio (Sanity) en paralelo
npm run dev:web                    # Solo frontend
npm run dev:studio                 # Solo Studio

npm run sanity:doctor              # Diagnóstico (env + Studio + lectura API)
npm run migrate:services:verify      # Checklist previo sin escribir
npm run migrate:services:snapshot  # Export dataset + migrar servicios
npm run migrate:services           # Migrar sin snapshot
npm run seed:services              # Crear 6 serviceSubPage vacíos
npm run seed:site-settings           # CTA global siteSettings
npm run audit:service-subpages     # Auditoría editorial
npm run test:sanity-runtime        # Tests unitarios del runtime
npm run build:studio               # Build producción Studio
```

Desde **utilcar-web/utilcar-studio**: wrappers locales (`migrate:services`, `seed`, etc.) delegan a `utilcar-web/scripts/` o schemas internos.

## Snapshot

`migrate:services:snapshot` exporta el dataset completo a:

`utilcar-web/backups/sanity-{dataset}-{timestamp}.tar.gz`

antes de publicar documentos.

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `No CLI config found` | Verificar `utilcar-web/utilcar-studio/sanity.cli.cjs`. |
| `Falta SANITY_API_TOKEN` | Añadir token en `utilcar-web/.env.local`. |
| `No se encontró utilcar-web` | `cd utilcar-web` antes de `npm run …`. |
| Studio no levanta con `npm run dev` | Ejecutar `npm run install:studio` o `npm install` en raíz. |
| Scripts no ven `.env` | No hace falta exportar en PowerShell; `loadSanityEnv` carga archivos. |
