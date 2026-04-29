import ArmarCursos from './Ventanas/ArmarCursos/ArmarCursos'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useEffect, useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'
import { useParams } from 'react-router-dom'
import {
    obtenerCursosDeSuscriptorAsync,
    obtenerEmpresasDeSuscriptorAsync,
    obtenerIdentificadoresDeSuscripcionPorNombreDeEmpresaAsync,
    obtenerParametrosDeSuscriptorAsync,
    obtenerUsuariosDeSuscriptorAsync,
} from './Api/suscripciones'

import Usuarios from './Ventanas/Usuarios/Usuarios'
import Parametros from './Ventanas/Parametros'
import ReportesCursos from './Ventanas/Reportescursos'

import { useSusbcriptonStore } from './Stores/SubscriptionContextStore'
import { b2Url, b2UsuarioBucket } from '../../vars'

type Seccion = 'armar' | 'usuarios' | 'empresas' | 'cursos' | 'parametros' | 'reportes'

const NAV_ITEMS: { key: Seccion; label: string }[] = [
    { key: 'parametros', label: 'Parámetros' },
    { key: 'armar', label: 'Gestionar cursos' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'empresas', label: 'Empresas' },
    { key: 'cursos', label: 'Cursos' },
    { key: 'reportes', label: 'Reportes de cursos' },
]

export default function PanelAdministrador() {
    const [cursos, setCursos] = useState<curso[]>([])
    const [usuarios, setUsuarios] = useState<usuario[]>([])
    const [empresas, setEmpresas] = useState<empresa[]>([])
    const [cursosArmados, setCursosArmados] = useState<cursoArmado[]>([])
    const [mensaje, setMensaje] = useState<string | null>('Cargando...')
    const [seccion, setSeccion] = useState<Seccion>('armar')
    const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null)
    const [refreshKeyUsuarios, setRefreshKeyUsuarios] = useState(0)
    const [refreshKeyEmpresas, setRefreshKeyEmpresas] = useState(0)
    const [identificadoresSuscriptor, setIdentificadoresSuscriptor] = useState<{
        id: number
        uuidSuscriptor: string
    } | null>(null)
    const [logoKey, setLogoKey] = useState<string | null>(null)

    const { nombreEmpresa } = useParams()
    const setCurrentSubscription = useSusbcriptonStore((x) => x.setCurrentSusbscription)

    useEffect(() => {
        if (!identificadoresSuscriptor) return
        setCurrentSubscription(identificadoresSuscriptor.id)
        return () => setCurrentSubscription(null)
    }, [identificadoresSuscriptor])

    useEffect(() => {
        if (!identificadoresSuscriptor) return
            ; (async () => {
                try {
                    const u = await obtenerUsuariosDeSuscriptorAsync(identificadoresSuscriptor.id)
                    setUsuarios(u)
                } catch { }
            })()
    }, [identificadoresSuscriptor])

    useEffect(() => {
        if (!identificadoresSuscriptor) return
            ; (async () => {
                try {
                    const c = await obtenerCursosDeSuscriptorAsync(identificadoresSuscriptor.id)
                    setCursos(c)
                } catch { }
            })()
    }, [identificadoresSuscriptor])

    useEffect(() => {
        if (!identificadoresSuscriptor) return
            ; (async () => {
                try {
                    const e = await obtenerEmpresasDeSuscriptorAsync(identificadoresSuscriptor.id)
                    setEmpresas(e)
                } catch { }
            })()
    }, [identificadoresSuscriptor])

    // Carga el logo en cuanto se conoce el suscriptor, sin esperar a entrar a Parámetros
    useEffect(() => {
        if (!identificadoresSuscriptor) return
            ; (async () => {
                try {
                    const parametros = await obtenerParametrosDeSuscriptorAsync(identificadoresSuscriptor.id)
                    setLogoKey(parametros.logo)
                } catch { }
            })()
    }, [identificadoresSuscriptor])

    useEffect(() => {
        if (!nombreEmpresa) return
            ; (async () => {
                try {
                    const identificadores = await obtenerIdentificadoresDeSuscripcionPorNombreDeEmpresaAsync(nombreEmpresa)
                    setIdentificadoresSuscriptor(identificadores)
                } catch (e) {
                    setMensaje('No se encontró la empresa.')
                }
            })()
    }, [nombreEmpresa])

    useEffect(() => {
        if (identificadoresSuscriptor) setMensaje(null)
    }, [identificadoresSuscriptor])

    function cambiarSeccion(nueva: Seccion) {
        setSeccion(nueva)
        if (nueva === 'usuarios') setRefreshKeyUsuarios(k => k + 1)
        if (nueva === 'empresas') setRefreshKeyEmpresas(k => k + 1)
    }

    return identificadoresSuscriptor ? (
        <div className="min-h-screen w-full bg-[#131516] flex justify-center">

            {/* Logo dinámico desde B2 */}
            {logoKey && (
                <img
                    src={`https://${b2UsuarioBucket}.${b2Url}/${logoKey}`}
                    alt="Logo"
                    className="fixed top-3 right-4 h-10 sm:h-14 max-w-[140px] sm:max-w-[200px] object-contain z-50 drop-shadow-lg"
                />
            )}

            <div className="w-full max-w-7xl px-4 py-6 flex flex-col items-center text-white">
                <h1 className="text-4xl font-semibold text-center">Administrador</h1>

                <nav className="flex gap-2 mt-10 flex-wrap justify-center">
                    {NAV_ITEMS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => cambiarSeccion(key)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
                                ${seccion === key
                                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'}
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="w-full mt-10">
                    {seccion === 'reportes' && (
                        <ReportesCursos
                            cursos={cursos}
                            empresas={empresas}
                            cursosArmados={cursosArmados}
                            usuarios={usuarios}
                        />
                    )}

                    {seccion === 'armar' && (
                        <ArmarCursos
                            uuidSuscriptor={identificadoresSuscriptor.uuidSuscriptor}
                            idSuscriptor={identificadoresSuscriptor.id}
                            usuarios={usuarios}
                            empresas={empresas}
                            cursos={cursos}
                            cursosArmados={cursosArmados}
                            setCursosArmados={setCursosArmados}
                        />
                    )}

                    {seccion === 'usuarios' && (
                        <Usuarios
                            idSuscriptor={identificadoresSuscriptor.id}
                            empresas={empresas}
                            usuarios={usuarios}
                            setUsuarios={setUsuarios}
                            refreshKey={refreshKeyUsuarios}
                            onVinculacionChange={() => {
                                setRefreshKeyEmpresas(k => k + 1)
                                setRefreshKeyUsuarios(k => k + 1)
                            }}
                            usuarioSeleccionadoId={usuarioSeleccionadoId}
                            setUsuarioSeleccionadoId={setUsuarioSeleccionadoId}
                        />
                    )}

                    {seccion === 'empresas' && (
                        <Empresas
                            idSuscriptor={identificadoresSuscriptor.id}
                            empresas={empresas}
                            setEmpresas={setEmpresas}
                            usuarios={usuarios}
                            refreshKey={refreshKeyEmpresas}
                            onVinculacionChange={() => {
                                setRefreshKeyUsuarios(k => k + 1)
                                setRefreshKeyEmpresas(k => k + 1)
                            }}
                            setUsuarios={setUsuarios}
                        />
                    )}

                    {seccion === 'cursos' && (
                        <Cursos
                            idSuscriptor={identificadoresSuscriptor.id}
                            cursos={cursos}
                            setCursos={setCursos}
                        />
                    )}

                    {seccion === 'parametros' && (
                        <Parametros
                            idSuscriptor={identificadoresSuscriptor.id}
                            usuarios={usuarios}
                            onLogoChange={setLogoKey}  // 👈 sincroniza el logo al header
                        />
                    )}
                </div>
            </div>
        </div>
    ) : mensaje ? (
        <p className="text-center text-white mt-10">{mensaje}</p>
    ) : null
}