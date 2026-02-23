import ArmarCursos from './Ventanas/ArmarCursos/ArmarCursos'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useEffect, useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'
import { useParams } from 'react-router-dom'
import { obtenerIdDeSuscripcionPorNombreDeEmpresaAsync } from './Api/suscripciones'

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
    const [idSuscritor, setIdSuscriptor] = useState<ids | null>()

    const [seccion, setSeccion] = useState<'armar' | 'usuarios' | 'empresas' | 'cursos'>('armar')

    const [logo, setLogo] = useState<ids | null>()

    const { nombreEmpresa } = useParams()

    useEffect(() => {
        if (idSuscritor) {
            setLogo(idSuscritor)
        }
    }, [idSuscritor])

    useEffect(() => {
        if (!nombreEmpresa) return

        (async () => {
            try {
                const id: ids = await obtenerIdDeSuscripcionPorNombreDeEmpresaAsync(nombreEmpresa)
                setIdSuscriptor(id)
            } catch (e) {
                console.log(String(e))
                setMensaje('No se encontró la empresa.')
            }
        })()

    }, [nombreEmpresa])

    useEffect(() => {
        setMensaje(null)
    }, [idSuscritor])

    return idSuscritor ? (
        <div
            className="min-h-screen w-full bg-[#131516] flex justify-center"
        >
            {
                logo ? <ObtenerLogo id={logo} /> : null
            }

            <div
                className="
                    w-full max-w-7xl
                    px-4 sm:px-6 lg:px-8
                    py-6 sm:py-10
                    flex flex-col items-center
                    text-white
                "
            >
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-center">
                    Administrador
                </h1>

                {/* BOTONES DE SELECCIÓN */}
                <div className="flex gap-4 mt-10 flex-wrap justify-center">
                    <button
                        onClick={() => setSeccion('armar')}
                        className={`px-4 py-2 rounded cursor-pointer ${seccion === 'armar' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        Armar Cursos
                    </button>

                    <button
                        onClick={() => setSeccion('usuarios')}
                        className={`px-4 py-2 cursor-pointer rounded ${seccion === 'usuarios' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        Usuarios
                    </button>

                    <button
                        onClick={() => setSeccion('empresas')}
                        className={`px-4 py-2 cursor-pointer rounded ${seccion === 'empresas' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        Empresas
                    </button>

                    <button
                        onClick={() => setSeccion('cursos')}
                        className={`px-4 py-2 cursor-pointer rounded ${seccion === 'cursos' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        Cursos
                    </button>
                </div>

                <div className="w-full mt-10 mb-30">
                    <div className={seccion === 'armar' ? 'block' : 'hidden'}>
                        <ArmarCursos
                            idSuscriptor={idSuscritor}
                            usuarios={usuarios}
                            empresas={empresas}
                            cursos={cursos}
                            cursosArmados={cursosArmados}
                            setCursosArmados={setCursosArmados}
                        />
                    </div>

                    <div className={seccion === 'usuarios' ? 'block' : 'hidden'}>
                        <Usuarios idSuscriptor={idSuscritor}
                            empresas={empresas}
                            usuarios={usuarios}
                            setUsuarios={setUsuarios} />
                    </div>

                    <div className={seccion === 'empresas' ? 'block' : 'hidden'}>
                        <Empresas idSuscriptor={idSuscritor}
                            empresas={empresas}
                            setEmpresas={setEmpresas} />
                    </div>

                    <div className={seccion === 'cursos' ? 'block' : 'hidden'}>
                        <Cursos idSuscriptor={idSuscritor}
                            cursos={cursos}
                            setCursos={setCursos} />
                    </div>
                </div>
            </div>
        </div >
    ) : mensaje ? (
        <p className="text-center text-white mt-10">{mensaje}</p>
    ) : null
}
