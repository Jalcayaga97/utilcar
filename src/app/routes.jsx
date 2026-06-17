import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LazyRoute } from '@/app/LazyRoute'
import Home from '@/pages/Home'
import {
  TalleresMoviles,
  VentanasLunetas,
  EquipamientoEscolar,
  Banquetas,
  Butacas,
  Accesorios,
  ProteccionCabina,
  CambioPisos,
  Reclinaciones,
  Fundas,
  Literas,
  Tapiceria,
  Trabajos,
  Contacto,
  SobreNosotros,
  NotFound,
} from '@/app/lazyPages'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'talleres-moviles',
        element: (
          <LazyRoute>
            <TalleresMoviles />
          </LazyRoute>
        ),
      },
      {
        path: 'ventanas-lunetas',
        element: (
          <LazyRoute>
            <VentanasLunetas />
          </LazyRoute>
        ),
      },
      {
        path: 'equipamiento-escolar',
        element: (
          <LazyRoute>
            <EquipamientoEscolar />
          </LazyRoute>
        ),
      },
      {
        path: 'banquetas',
        element: (
          <LazyRoute>
            <Banquetas />
          </LazyRoute>
        ),
      },
      {
        path: 'butacas',
        element: (
          <LazyRoute>
            <Butacas />
          </LazyRoute>
        ),
      },
      {
        path: 'accesorios',
        element: (
          <LazyRoute>
            <Accesorios />
          </LazyRoute>
        ),
      },
      {
        path: 'proteccion-cabina',
        element: (
          <LazyRoute>
            <ProteccionCabina />
          </LazyRoute>
        ),
      },
      {
        path: 'cambio-pisos',
        element: (
          <LazyRoute>
            <CambioPisos />
          </LazyRoute>
        ),
      },
      {
        path: 'reclinaciones',
        element: (
          <LazyRoute>
            <Reclinaciones />
          </LazyRoute>
        ),
      },
      {
        path: 'fundas',
        element: (
          <LazyRoute>
            <Fundas />
          </LazyRoute>
        ),
      },
      {
        path: 'literas',
        element: (
          <LazyRoute>
            <Literas />
          </LazyRoute>
        ),
      },
      {
        path: 'tapiceria',
        element: (
          <LazyRoute>
            <Tapiceria />
          </LazyRoute>
        ),
      },
      {
        path: 'trabajos-realizados',
        element: (
          <LazyRoute>
            <Trabajos />
          </LazyRoute>
        ),
      },
      {
        path: 'sobre-nosotros',
        element: (
          <LazyRoute>
            <SobreNosotros />
          </LazyRoute>
        ),
      },
      {
        path: 'contacto',
        element: (
          <LazyRoute>
            <Contacto />
          </LazyRoute>
        ),
      },
      {
        path: '*',
        element: (
          <LazyRoute>
            <NotFound />
          </LazyRoute>
        ),
      },
    ],
  },
])
