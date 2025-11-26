import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Error from './Error/Error'

import User from './templates/User'
import Profesor from './templates/Profesor'
import Certificado from './templates/Certificado'

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
  
], {
  basename: '/Diplomas_OTEC_VF'
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
