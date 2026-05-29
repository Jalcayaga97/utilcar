import { ENV, whatsappUrlFromNumber } from '@/constants/env'

export const BRAND = {
  logo: '/logo.jpg',
  logoAlt: 'Logotipo Utilcar Conversiones — conversiones automotrices Santiago',
}

export const SITE = {
  name: 'Utilcar Conversiones',
  legalName: 'Utilcar Ltda.',
  tagline: 'Ingeniería aplicada a conversiones automotrices',
  description:
    'Especialistas en conversiones para vans y utilitarios: ventanas, lunetas, banquetas, butacas, equipamiento escolar y talleres móviles.',
  url: ENV.siteUrl,
  locale: 'es_CL',
  ogImage: `${ENV.siteUrl}/og-image.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  email: ENV.contactEmail,
  emails: [ENV.contactEmail, 'borisjara@utilcar.cl'],
  phone: '+56 9 4286 8395',
  phoneDisplay: '+56 9 4286 8395',
  phoneTel: '+56942868395',
  address: 'Antonio Ebner 1551, Quinta Normal, Santiago',
  addressStreet: 'Antonio Ebner 1551',
  addressLocality: 'Quinta Normal',
  addressRegion: 'Región Metropolitana',
  addressCountry: 'CL',
  addressCity: 'Quinta Normal, Santiago',
  geo: {
    latitude: -33.4372,
    longitude: -70.6944,
  },
  metro: 'Metro Estación Lourdes',
  whatsapp: ENV.whatsappNumber,
  whatsappUrl: whatsappUrlFromNumber(ENV.whatsappNumber),
  mapsQuery: 'Antonio+Ebner+1551,+Quinta+Normal,+Santiago,+Chile',
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: '18:00',
    },
    { days: ['Saturday'], opens: '09:00', closes: '13:00' },
  ],
}
