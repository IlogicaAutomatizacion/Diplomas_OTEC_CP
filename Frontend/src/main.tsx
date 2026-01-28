import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Error from './Error/Error'

//import Certificado from './templates/Certificados/CP/Certificado'
import PanelAdministrador from './templates/PanelAdministrador/PanelAdministrador'
import Main from './templates/CursosEmpresa/Main'
import Layout from './templates/PanelAdministrador/Componentes/SideBar'
import Panel from './templates/PanelCursos/Panel'
import PanelProfesor from './templates/PanelCursos/PanelProfesor'
import PanelAlumno from './templates/PanelCursos/PanelAlumno'

const router = createBrowserRouter([

  {
    element: <Layout children />, children: [{
      path: '/',
      errorElement: <Error />
    },
    {
      element: <Panel />,
      path: '/mis-cursos-profesor/:id_usuario',
      children: [
        {
          index: true,
          element: <PanelProfesor />
        }
      ]
    },
    {
      path: '/mis-cursos-alumno/:id_usuario',
      element: <Panel />,
      children: [
        {
          index:true,
          element: <PanelAlumno />
        }
      ]
    },
    // {
    //   path: '/certificados/:token/:token_curso',
    //   element: <Certificado />
    // },
    {
      path: '/panelAdminitradorCursos',
      element: <PanelAdministrador />
    }, {
      path: '/cursosEmpresa/:id_empresa',
      element: <Main />
    }
    ]
  }

], {
  basename: '/Diplomas_OTEC_CP'
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <RouterProvider router={router} />

  </StrictMode>,
)
