import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Error from './Error/Error'

import User from './templates/User'
import Profesor from './templates/Profesor'
import Certificado from './templates/Certificado'
import PanelAdministrador from './templates/PanelAdministrador'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <Error />
  },
  {
    path: '/:usuario',
    element: <User />
  },
  {
    path: '/profesor/:profesor',
    element: <Profesor />
  },
  {
    path: '/certificados/:token/:token_curso',
    element: <Certificado />
  },
  {
    path: '/panelAdm',
    element: <PanelAdministrador />
  }
  
], {
  basename: '/Diplomas_OTEC_CP'
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
