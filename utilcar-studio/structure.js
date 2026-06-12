import { isStudioAdmin } from './schemas/governance/studioAdmin.js'
import {
  HOME_DOCUMENT_ID,
  HOME_DOCUMENT_PANE_ID,
  HOME_BUILDER_VIEW_ID,
} from './schemas/presentation/studioNavigation.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from './schemas/content/serviceSubPage.js'
import { SITE_SETTINGS_DOCUMENT_ID } from './schemas/content/siteSettings.js'
import { SERVICE_LINKS_MANIFEST } from '../scripts/lib/serviceCatalogManifest.mjs'

const HOME_ID = HOME_DOCUMENT_ID

/** Documentos deprecated o espejos técnicos — solo administrator. */
const LEGACY_ADMIN_PAGES = []

function homeViews(S) {
  return [S.view.form().id(HOME_BUILDER_VIEW_ID).title('Inicio')]
}

function singleton(S, { listId, title, schemaType, documentId, documentTitle, paneId, views }) {
  const document = S.document()
    .id(paneId ?? documentId)
    .title(documentTitle ?? title)
    .schemaType(schemaType)
    .documentId(documentId)

  if (views?.length) {
    document.views(views)
  }

  return S.listItem().title(title).id(listId).child(document)
}

function pageSingleton(S, { listId, title, schemaType, documentId }) {
  return singleton(S, {
    listId,
    title,
    schemaType,
    documentId,
    documentTitle: title,
  })
}

/** Mismo orden que Navbar/Footer (SERVICE_LINKS → SERVICE_LINKS_MANIFEST). */
function orderedServiceSubPageEntries() {
  const byPageKey = new Map(SERVICE_SUB_PAGE_KEYS.map((entry) => [entry.value, entry]))
  return SERVICE_LINKS_MANIFEST.map((link) => {
    const pageKey = link.path.replace(/^\//, '')
    const entry = byPageKey.get(pageKey)
    if (!entry) return null
    return { value: entry.value, title: entry.title ?? link.label }
  }).filter(Boolean)
}

function servicesSection(S) {
  const subPages = orderedServiceSubPageEntries().map(({ value, title }) =>
    pageSingleton(S, {
      listId: `service-${value}`,
      title,
      schemaType: 'serviceSubPage',
      documentId: serviceSubPageDocumentId(value),
    }),
  )

  return S.listItem()
    .title('Servicios')
    .id('services')
    .child(
      S.list()
        .title('Servicios')
        .items([
          pageSingleton(S, {
            listId: 'services-hub',
            title: 'Hub de navegación',
            schemaType: 'servicesPage',
            documentId: 'servicesPage',
          }),
          S.divider(),
          ...subPages,
        ]),
    )
}

function siteSettingsEntry(S) {
  return pageSingleton(S, {
    listId: 'site-settings',
    title: 'Configuración del sitio',
    schemaType: 'siteSettings',
    documentId: SITE_SETTINGS_DOCUMENT_ID,
    documentTitle: 'Configuración del sitio',
  })
}

export const structure = (S, context) => {
  const admin = isStudioAdmin(context?.currentUser)

  const mainItems = [
    singleton(S, {
      listId: 'home',
      title: 'Inicio',
      schemaType: 'homePage',
      documentId: HOME_ID,
      paneId: HOME_DOCUMENT_PANE_ID,
      views: homeViews(S),
    }),
    servicesSection(S),
    siteSettingsEntry(S),
    S.listItem()
      .title('Trabajos')
      .id('work')
      .child(
        S.list()
          .title('Trabajos realizados')
          .items([
            pageSingleton(S, {
              listId: 'work-page',
              title: 'Página Trabajos',
              schemaType: 'workPage',
              documentId: 'workPage',
            }),
            S.documentTypeListItem('workProject').title('Proyectos'),
          ]),
      ),
    S.listItem()
      .title('Empresa')
      .id('company')
      .child(
        S.list()
          .title('Empresa')
          .items([
            pageSingleton(S, {
              listId: 'about-page',
              title: 'Sobre Nosotros',
              schemaType: 'aboutPage',
              documentId: 'aboutPage',
            }),
          ]),
      ),
    pageSingleton(S, {
      listId: 'contact',
      title: 'Contacto',
      schemaType: 'contactPage',
      documentId: 'contactPage',
    }),
  ]

  const legacyItems = LEGACY_ADMIN_PAGES.map((page) =>
    pageSingleton(S, {
      listId: page.id,
      title: page.title,
      schemaType: page.schemaType,
      documentId: page.id,
    }),
  )

  if (!admin) {
    return S.list().title('Utilcar').items(mainItems)
  }

  const items = [
    ...mainItems,
    S.divider(),
    S.listItem()
      .title('Páginas legacy (admin)')
      .id('legacy-pages')
      .child(S.list().title('Legacy').items(legacyItems)),
  ]

  return S.list().title('Utilcar').items(items)
}
