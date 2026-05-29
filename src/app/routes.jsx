import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LazyRoute } from '@/app/LazyRoute'
import {
  Home,
  TalleresMoviles,
  VentanasLunetas,
  EquipamientoEscolar,
  Banquetas,
  Butacas,
  Accesorios,
  Trabajos,
  Contacto,
  NotFound,
} from '@/app/lazyPages'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyRoute>
            <Home />
          </LazyRoute>
        ),
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
        path: 'trabajos-realizados',
        element: (
          <LazyRoute>
            <Trabajos />
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
