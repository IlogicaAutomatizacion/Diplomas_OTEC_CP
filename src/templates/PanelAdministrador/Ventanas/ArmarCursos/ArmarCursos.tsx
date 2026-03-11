import React, { useContext, useEffect, useState } from "react"
import type { usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import type { curso } from "../../Api/cursos"
import { type cursoArmado } from "../../Api/cursos-armados"
import { crearCursoArmadoDeSuscriptorAsync, obtenerCursosArmadosDeSuscriptorAsync } from "../../Api/suscripciones"
import { ErrorContext } from "../../../../Error/ErrorContext"
import CursoArmadoCard from "./ArmarCursoCard"
import ArmarCursoPanel from "./ArmarCursoPanel"

export default ({ usuarios, empresas, cursos, idSuscriptor, cursosArmados, setCursosArmados }: {
    usuarios: usuario[],
    empresas: empresa[],
    cursos: curso[],

    idSuscriptor: number,

    cursosArmados: cursoArmado[],
    setCursosArmados: React.Dispatch<React.SetStateAction<cursoArmado[]>>
}) => {
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    const { setError } = useContext(ErrorContext)!

    const [busqueda, setBusqueda] = useState('');

    const [cursoArmadoAVisualizar, setCursoArmadoAVisualizar] = useState<cursoArmado | null>(null)

    useEffect(() => {

        (async () => {
            try {
                const cursos = await obtenerCursosArmadosDeSuscriptorAsync(idSuscriptor)

                setCursosArmados(cursos)
            } catch (e: any) {
                //   setError(e?.message ?? `Hubo un error al obtener los cursos.`);

                //  setMensajeCursos(`Hubo un error al obtener los cursos: ${String(e)}`)
            }
        })()
    }, [empresas, cursos, usuarios])

    useEffect(() => {
        setMensajeBoton(null)
    }, [cursosArmados])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const cursoNuevo = await crearCursoArmadoDeSuscriptorAsync(idSuscriptor)

            setCursosArmados((last) => {
                return [...last, cursoNuevo]
            })
        } catch (e: any) {
            setError(e?.message ?? `Hubo un problema al crear el curso armado.`);

            setMensajeBoton('Hubo un problema al crear el curso armado.')

            setTimeout(() => {
                setMensajeBoton(null)
            }, 2000);
        }
    }

    const cursosFiltrados = cursosArmados.filter(ca => {
        if (!busqueda.trim()) return true
        const texto = busqueda.toLowerCase()
        return (
            ca.curso?.nombre?.toLowerCase().includes(texto) ||
            ca.empresa?.nombre?.toLowerCase().includes(texto)
        )
    })

    return <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold">
                Armar cursos <span className="opacity-70">({cursosArmados.length})</span>
            </h2>

            {/* INPUT DE BÚSQUEDA */}

            <button
                onClick={handleAddButton}
                className="
        bg-green-600
        hover:bg-green-700
        text-white
        px-4
        py-2
        rounded
        transition
        w-full
        sm:w-auto
      "
            >
                {mensajeBoton ?? 'Agregar'}
            </button>
        </div>

        <div className="mt-6 w-full flex justify-center">
            <input
                type="text"
                placeholder="Buscar usuario por nombre, rut, correo, especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="
                w-full
                sm:w-1/2
                p-2
                bg-slate-800
                border border-slate-700
                rounded
                text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
            "
            />
        </div>

        {cursoArmadoAVisualizar ? <div className="
           mt-6
        w-full
        gap-4
        overflow-y-auto
        p-2
        ">
            <ArmarCursoPanel setCursoArmadoAVisualizar={setCursoArmadoAVisualizar} cursoArmado={cursoArmadoAVisualizar} cursos={cursos} empresas={empresas} setCursosArmadosState={setCursosArmados} usuarios={usuarios} />
        </div> : <div
            id="tabla-cursos-armados"
            className="
      mt-6
      w-full
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-4
      overflow-y-auto
      p-2
      overscroll-none
    "
        >

            {cursosFiltrados.map(cursoArmado => (
                <CursoArmadoCard
                    key={cursoArmado.curso_armado_id}
                    cursoArmado={cursoArmado}
                    setCursoArmadoAVisualizar={setCursoArmadoAVisualizar}
                />
            ))}
        </div>}
    </div>
}