import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// Carga diferida
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  }
]
