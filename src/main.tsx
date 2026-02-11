import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'

//import Certificado from './templates/Certificados/CP/Certificado'
import PanelAdministrador from './templates/PanelAdministrador/PanelAdministrador'
import Main from './templates/CursosEmpresa/Main'
import Layout from './templates/PanelAdministrador/Componentes/SideBar'
import Panel from './templates/PanelCursos/Panel'
import PanelProfesor from './templates/PanelCursos/PanelProfesor'
import PanelAlumno from './templates/PanelCursos/PanelAlumno'
import CertificadoBase from './templates/Certificados/CertificadoBase'
import PanelCertificados from './templates/ListaCertificados/PanelCertificados'
import LoginPage from './templates/Login/Login'
import ActivarCuentaPage from './templates/Login/Validate'
import ConfirmarActivacionPage from './templates/Login/Confirm'
import MisEmpresas from './templates/CursosEmpresa/Selector'
import MisSuscripciones from './templates/PanelAdministrador/Selector'
import NotFoundPage from './templates/NotFound/NotFound'
import ErrorPage from './Error/Error'
import { emitError, ErrorProvider } from './Error/ErrorContext'

const originalFetch = window.fetch;

window.fetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
) => {
  const token = localStorage.getItem('token');

  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res: any = await originalFetch(input, {
    ...init,
    headers,
  });

  if (res.status === 401 && token) {
    localStorage.removeItem('token');

    if (!window.location.pathname.includes('/login')) {
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
  }


  if (!res.ok) {
    try {
      const data = await res.clone().json()
      console.log(data)
      emitError(data?.message ?? 'Error inesperado')
    } catch {
      emitError('Error inesperado del servidor')
    }
  }

  return res;
};

const router = createBrowserRouter([

  {
    errorElement: <ErrorPage />,

    path: '/login',
    element: <LoginPage />
  },
  {
    errorElement: <ErrorPage />,

    path: '/activar-cuenta',
    element: <ActivarCuentaPage />
  },
  {
    errorElement: <ErrorPage />,

    path: '/confirmar-activacion',
    element: <ConfirmarActivacionPage />
  },

  {
    errorElement: <ErrorPage />,
    path: '/certificados/:token/:token_curso',
    element: <CertificadoBase />
  },

  {
    element: <Layout />, errorElement: <ErrorPage />, children: [{
      path: '*',
      element: <NotFoundPage />
    }, {
      path: '/',
      index: true
    },

    {
      element: <Panel />,
      path: '/mis-cursos-profesor',
      children: [
        {
          index: true,
          element: <PanelProfesor />
        }
      ]
    },
    {
      path: '/certificados',
      element: <PanelCertificados />
    },
    {
      path: '/mis-cursos-alumno',
      element: <Panel />,
      children: [
        {
          index: true,
          element: <PanelAlumno />
        }
      ]
    },

    {
      path: '/panelAdminitradorCursos',
      element: <MisSuscripciones />
    },

    {
      path: '/panelAdminitradorCursos/:nombreEmpresa',
      element: <PanelAdministrador />
    },

    {
      path: '/cursosEmpresa',
      element: <MisEmpresas />
    },

    {
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

    <ErrorProvider>
      <RouterProvider router={router} />

    </ErrorProvider>

  </StrictMode>,
)
