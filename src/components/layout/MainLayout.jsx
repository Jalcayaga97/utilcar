import { Outlet, ScrollRestoration } from 'react-router-dom'
import { StructuredData } from '@/components/seo/StructuredData'
import { FloatingWhatsAppButton } from '@/components/common/FloatingWhatsAppButton'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <ScrollRestoration />
    </div>
  )
}
