import ArmarCursos from './Ventanas/ArmarCursos/ArmarCursos'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useEffect, useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'
import { useParams } from 'react-router-dom'
import { obtenerCursosDeSuscriptorAsync, obtenerEmpresasDeSuscriptorAsync, obtenerIdentificadoresDeSuscripcionPorNombreDeEmpresaAsync, obtenerUsuariosDeSuscriptorAsync } from './Api/suscripciones'

import FormarteLogo from '../../Diseño/Formarte/FormarteLogo'
import CPLogo from '../../Diseño/CP/CPLogo'
import Usuarios from './Ventanas/Usuarios/Usuarios'

type ids = 2 | 3

const map: Record<ids, any> = {
    2: FormarteLogo,
    3: CPLogo
}

const ObtenerLogo = ({ id }: { id: ids }) => {
    const Logo = map[id]
    return <Logo />
}

export default () => {
    const [cursos, setCursos] = useState<curso[]>([])
    const [usuarios, setUsuarios] = useState<usuario[]>([])
    const [empresas, setEmpresas] = useState<empresa[]>([])
    const [cursosArmados, setCursosArmados] = useState<cursoArmado[]>([])

    const [mensaje, setMensaje] = useState<string | null>('Cargando...')

    const [identificadoresSuscriptor, setIdentificadoresSuscriptor] = useState<{ id: ids, uuidSuscriptor: string } | null>(null)


    const [seccion, setSeccion] = useState<'armar' | 'usuarios' | 'empresas' | 'cursos'>('armar')

    const [logo, setLogo] = useState<ids | null>(null)
    const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null)

    const [refreshKeyUsuarios, setRefreshKeyUsuarios] = useState(0)
    const [refreshKeyEmpresas, setRefreshKeyEmpresas] = useState(0)

    const { nombreEmpresa } = useParams()


    useEffect(() => {
        if (identificadoresSuscriptor) setLogo(identificadoresSuscriptor.id)
    }, [identificadoresSuscriptor])


    useEffect(() => {
        (async () => {
            if (!identificadoresSuscriptor) { return }

            try {
                const usuarios = await obtenerUsuariosDeSuscriptorAsync(identificadoresSuscriptor.id)

                setUsuarios(usuarios)
            } catch (e) {
                //      setMensajeUsuarios(`Hubo un error al obtener los usuarios: ${String(e)}`)
            }
        })()
    }, [identificadoresSuscriptor])


    useEffect(() => {
        (async () => {
            if (!identificadoresSuscriptor) { return }

            try {
                const cursos = await obtenerCursosDeSuscriptorAsync(identificadoresSuscriptor.id)

                console.log(cursos)
                setCursos(cursos)
            } catch (e) {
                //setMensajeCursos(`Hubo un error al obtener los cursos: ${String(e)}`)
            }
        })()
    }, [identificadoresSuscriptor])

    useEffect(() => {
        ; (async () => {
            if (!identificadoresSuscriptor) { return }

            try {
                const empresas = await obtenerEmpresasDeSuscriptorAsync(identificadoresSuscriptor.id)
                setEmpresas(empresas)
            } catch (e) { }
        })()
    }, [identificadoresSuscriptor])

    useEffect(() => {
        if (!nombreEmpresa) return
            ; (async () => {
                try {
                    const identificadores = await obtenerIdentificadoresDeSuscripcionPorNombreDeEmpresaAsync(nombreEmpresa)

                    setIdentificadoresSuscriptor(identificadores as {
                        id: ids,
                        uuidSuscriptor: string,
                    })

                } catch (e) {
                    console.log(String(e))
                    setMensaje('No se encontró la empresa.')
                }
            })()
    }, [nombreEmpresa])

    useEffect(() => {
        if (identificadoresSuscriptor) setMensaje(null)
    }, [identificadoresSuscriptor])

    function cambiarSeccion(nueva: typeof seccion) {
        setSeccion(nueva)

        if (nueva === 'usuarios') setRefreshKeyUsuarios(k => k + 1)
        if (nueva === 'empresas') setRefreshKeyEmpresas(k => k + 1)
    }

    return identificadoresSuscriptor ? (
        <div className="min-h-screen w-full bg-[#131516] flex justify-center">
            {logo ? <ObtenerLogo id={logo} /> : null}

            <div className="w-full max-w-7xl px-4 py-6 flex flex-col items-center text-white">
                <h1 className="text-4xl font-semibold text-center">
                    Administrador
                </h1>

                <div className="flex gap-4 mt-10 flex-wrap justify-center">
                    <button onClick={() => cambiarSeccion('armar')} className={seccion === 'armar' ? 'bg-blue-600 px-4 py-2' : 'bg-gray-700 px-4 py-2'}>
                        Gestionar cursos
                    </button>

                    <button onClick={() => cambiarSeccion('usuarios')} className={seccion === 'usuarios' ? 'bg-blue-600 px-4 py-2' : 'bg-gray-700 px-4 py-2'}>
                        Usuarios
                    </button>

                    <button onClick={() => cambiarSeccion('empresas')} className={seccion === 'empresas' ? 'bg-blue-600 px-4 py-2' : 'bg-gray-700 px-4 py-2'}>
                        Empresas
                    </button>

                    <button onClick={() => cambiarSeccion('cursos')} className={seccion === 'cursos' ? 'bg-blue-600 px-4 py-2' : 'bg-gray-700 px-4 py-2'}>
                        Cursos
                    </button>
                </div>

                <div className="w-full mt-10">
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
                </div>
            </div>
        </div>
    ) : mensaje ? (
        <p className="text-center text-white mt-10">{mensaje}</p>
    ) : null
}