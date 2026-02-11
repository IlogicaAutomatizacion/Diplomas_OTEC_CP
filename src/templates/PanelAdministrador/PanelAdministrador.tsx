import ArmarCursos from './Ventanas/ArmarCursos'
import Usuarios from './Ventanas/Usuarios'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useEffect, useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'
import { useParams } from 'react-router-dom'
import { obtenerIdDeSuscripcionPorNombreDeEmpresaAsync } from './Api/suscripciones'




export default () => {

    const [cursos, setCursos] = useState<curso[]>([])
    const [usuarios, setUsuarios] = useState<usuario[]>([])
    const [empresas, setEmpresas] = useState<empresa[]>([])
    const [cursosArmados, setCursosArmados] = useState<cursoArmado[]>([])

    const [mensaje, setMensaje] = useState<string | null>('Cargando...')

    const [idSuscritor, setIdSuscriptor] = useState<number | null>()

    const { nombreEmpresa } = useParams()

    useEffect(() => {
        if (!nombreEmpresa) { return }

        (async () => {
            try {
                const id: number = await obtenerIdDeSuscripcionPorNombreDeEmpresaAsync(nombreEmpresa)

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
            id="fondo"
            className="min-h-screen w-full bg-[#131516] flex justify-center"
        >
            <div
                id="contenedor-principal"
                className="
        w-full
        max-w-7xl
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-10
        flex flex-col items-center
        text-white
      "
            >
                <h1
                    id="titulo"
                    className="
          text-3xl
          sm:text-4xl
          md:text-6xl
          lg:text-7xl
          font-semibold
          text-center
        "
                >
                    Administrador de usuarios
                </h1>

                <div
                    className="
          w-full
          mt-8 sm:mt-10
          flex flex-col
          gap-10
        "
                >

                        <ArmarCursos
                            idSuscriptor={idSuscritor}
                            usuarios={usuarios}
                            empresas={empresas}
                            cursos={cursos}
                            cursosArmados={cursosArmados}
                            setCursosArmados={setCursosArmados}
                        />

                        <Usuarios
                            idSuscriptor={idSuscritor}
                            empresas={empresas}
                            usuarios={usuarios}
                            setUsuarios={setUsuarios}
                        />

                        <Empresas
                            idSuscriptor={idSuscritor}
                            empresas={empresas}
                            setEmpresas={setEmpresas}
                        />

                        <Cursos
                            idSuscriptor={idSuscritor}
                            cursos={cursos}
                            setCursos={setCursos}
                        />

                </div>
            </div>
        </div>
    ) : mensaje ? (
        <p className="text-center text-white mt-10">{mensaje}</p>
    ) : null;

}