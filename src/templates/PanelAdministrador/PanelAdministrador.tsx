import ArmarCursos from './Ventanas/ArmarCursos/ArmarCursos'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useCallback, useEffect, useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'
import { useParams } from 'react-router-dom'
import {
    obtenerCursosDeSuscriptorAsync,
    obtenerCursosArmadosDeSuscriptorAsync,
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
import { useSubscriptionRealtime } from '../../realtime'
import type { SubscriptionRealtimeEvent } from '../../socket'

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
    const [usuariosConectados, setUsuariosConectados] = useState<{ correo: string }[]>([])

    const { nombreEmpresa } = useParams()
    const setCurrentSubscription = useSusbcriptonStore((x) => x.setCurrentSusbscription)

    useEffect(() => {
        if (!identificadoresSuscriptor) return
        setCurrentSubscription(identificadoresSuscriptor.id)
        return () => setCurrentSubscription(null)
    }, [identificadoresSuscriptor])

    const cargarUsuarios = useCallback(async () => {
        if (!identificadoresSuscriptor) return
        const u = await obtenerUsuariosDeSuscriptorAsync(identificadoresSuscriptor.id)
        setUsuarios(u)
    }, [identificadoresSuscriptor])

    const cargarCursos = useCallback(async () => {
        if (!identificadoresSuscriptor) return
        const c = await obtenerCursosDeSuscriptorAsync(identificadoresSuscriptor.id)
        setCursos(c)
    }, [identificadoresSuscriptor])

    const cargarEmpresas = useCallback(async () => {
        if (!identificadoresSuscriptor) return
        const e = await obtenerEmpresasDeSuscriptorAsync(identificadoresSuscriptor.id)
        setEmpresas(e)
    }, [identificadoresSuscriptor])

    const cargarCursosArmados = useCallback(async () => {
        if (!identificadoresSuscriptor) return
        const ca = await obtenerCursosArmadosDeSuscriptorAsync(identificadoresSuscriptor.id)
        setCursosArmados(ca)
    }, [identificadoresSuscriptor])

    const cargarParametros = useCallback(async () => {
        if (!identificadoresSuscriptor) return
        const parametros = await obtenerParametrosDeSuscriptorAsync(identificadoresSuscriptor.id)
        setLogoKey(parametros.logo)
    }, [identificadoresSuscriptor])

    useEffect(() => {
        cargarUsuarios().catch(() => null)
    }, [cargarUsuarios])

    useEffect(() => {
        cargarCursos().catch(() => null)
    }, [cargarCursos])

    useEffect(() => {
        cargarEmpresas().catch(() => null)
    }, [cargarEmpresas])

    useEffect(() => {
        cargarCursosArmados().catch(() => null)
    }, [cargarCursosArmados])

    // Carga el logo en cuanto se conoce el suscriptor, sin esperar a entrar a Parámetros
    useEffect(() => {
        cargarParametros().catch(() => null)
    }, [cargarParametros])

    const handleRealtimeChange = useCallback((event: SubscriptionRealtimeEvent) => {
        const jobs: Promise<unknown>[] = []

        if (event.resource === 'cursosArmados') {
            if (event.action === 'bulk-deleted' && event.affectedIds?.length) {
                const ids = new Set(event.affectedIds.map(id => Number(id)))
                setCursosArmados(prev => prev.filter(curso => curso.curso_armado_id == null || !ids.has(curso.curso_armado_id)))
            } else if (event.action === 'deleted' && event.entityId != null) {
                const id = Number(event.entityId)
                setCursosArmados(prev => prev.filter(curso => curso.curso_armado_id !== id))
            }
        }

        if (event.resource === 'usuarios') {
            if (event.action === 'bulk-deleted' && event.affectedIds?.length) {
                const ids = new Set(event.affectedIds.map(id => Number(id)))
                setUsuarios(prev => prev.filter(usuario => usuario.id == null || !ids.has(usuario.id)))
            } else if (event.action === 'deleted' && event.entityId != null) {
                const id = Number(event.entityId)
                setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
            }
        }

        if (event.resource === 'usuarios') {
            jobs.push(cargarUsuarios())
            setRefreshKeyUsuarios(key => key + 1)
        }
        if (event.resource === 'empresas') {
            jobs.push(cargarEmpresas())
            setRefreshKeyEmpresas(key => key + 1)
        }
        if (event.resource === 'cursos') jobs.push(cargarCursos())
        if (event.resource === 'cursosArmados' || event.resource === 'inscripciones') jobs.push(cargarCursosArmados())
        if (event.resource === 'parametros') {
            jobs.push(cargarParametros())
        }

        Promise.all(jobs).catch(() => null)
    }, [cargarCursos, cargarCursosArmados, cargarEmpresas, cargarParametros, cargarUsuarios])

    const handlePresence = useCallback((event: { usuarios: { correo: string }[] }) => {
        setUsuariosConectados(event.usuarios)
    }, [])

    useSubscriptionRealtime(
        identificadoresSuscriptor?.id,
        handleRealtimeChange,
        handlePresence,
    )

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

                <section className="mt-5 w-full max-w-3xl rounded-lg border border-zinc-700 bg-zinc-900/70 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-zinc-200">Usuarios conectados</h2>
                        <span className="text-xs text-zinc-500">{usuariosConectados.length}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {usuariosConectados.length ? usuariosConectados.map(({ correo }) => (
                            <span
                                key={correo}
                                className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200"
                            >
                                {correo}
                            </span>
                        )) : (
                            <span className="text-xs text-zinc-500">Sin otros usuarios conectados.</span>
                        )}
                    </div>
                </section>

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
