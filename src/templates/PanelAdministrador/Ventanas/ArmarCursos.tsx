import { useContext, useEffect, useState } from "react"
import { Example } from "../Componentes/DropdownMenu"
import type { usuario } from "../Api/usuarios"
import type { empresa } from "../Api/empresas"
import type { curso } from "../Api/cursos"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync, type cursoArmado } from "../Api/cursos-armados"
import { crearInscripcionAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../Api/inscripciones"
import { crearCursoArmadoDeSuscriptorAsync, obtenerCursosArmadosDeSuscriptorAsync } from "../Api/suscripciones"
import { ErrorContext } from "../../../Error/ErrorContext"

const CursoArmadoCard = ({
    cursoArmado,
    setCursosArmadosState,
    cursos,
    empresas,
    usuarios
}: {
    cursoArmado: cursoArmado,
    setCursosArmadosState: React.Dispatch<React.SetStateAction<cursoArmado[]>>,
    cursos: curso[],
    empresas: empresa[]
    usuarios: usuario[]
}) => {
    const [infoAbierta, setInfoAbierta] = useState(false)
    const [usuariosAbiertos, setUsuariosAbiertos] = useState(false)
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [cursoArmadoLocal, setCursoArmadoLocal] = useState<cursoArmado>(cursoArmado)


    /**
     * Sync SOLO cuando cambia el curso desde afuera
     */
    useEffect(() => {
        setCursoArmadoLocal(cursoArmado)
    }, [cursoArmado.curso_armado_id])

    /**
     * Propaga cambios locales al estado global
     * ⚠️ solo cuando cambia el ID o una referencia real
     */
    useEffect(() => {
        setCursosArmadosState(prev =>
            prev.map(c =>
                c.curso_armado_id === cursoArmadoLocal.curso_armado_id
                    ? cursoArmadoLocal
                    : c
            )
        )
    }, [cursoArmadoLocal.curso_armado_id, cursoArmadoLocal])

    async function handleDelete() {
        try {
            await borrarCursoArmadoAsync(cursoArmado.curso_armado_id)

            setCursosArmadosState(prev =>
                prev.filter(c => c.curso_armado_id !== cursoArmado.curso_armado_id)
            )
        } catch (e: any) {
            console.log(e)
        }
    }

    async function guardarParametro(
        nombreParametro: keyof cursoArmado,
        nuevoValor: string | number
    ) {
        const valorActual = cursoArmadoLocal[nombreParametro]

        const valorNormalizado =
            typeof nuevoValor === 'string' ? nuevoValor.trim() : nuevoValor

        if (valorActual === valorNormalizado) return

        // optimistic update
        setCursoArmadoLocal(prev => ({
            ...prev,
            [nombreParametro]: valorNormalizado
        }))

        try {
            await actualizarPropiedadDeCursoArmadoAsync(
                cursoArmadoLocal.curso_armado_id,
                nombreParametro,
                valorNormalizado
            )
        } catch (e: any) {
            console.log(e)

            // rollback
            setCursoArmadoLocal(prev => ({
                ...prev,
                [nombreParametro]: valorActual
            }))
        }
    }

    async function inscribirAlumno(usuario: usuario) {
        if (!usuario?.id) return

        try {
            const actualizado = await crearInscripcionAsync({
                cursoArmado: cursoArmadoLocal.curso_armado_id,
                usuario: usuario.id
            })

            setCursoArmadoLocal(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    async function eliminarInscripcion(id_inscripcion: number) {
        try {
            const actualizado = await eliminarInscripcionAsync(id_inscripcion)
            setCursoArmadoLocal(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    async function actualizarInscripcion(
        id_inscripcion: number,
        propiedad: keyof inscripcion,
        nuevoValor: any
    ) {
        if (nuevoValor === undefined || nuevoValor === null) return

        try {
            const inscripcionActualizada = await editarInscripcionAsync(
                id_inscripcion,
                { [propiedad]: nuevoValor }
            )

            setCursoArmadoLocal(prev => ({
                ...prev,
                inscripciones: prev.inscripciones.map(i =>
                    i.id_inscripcion === id_inscripcion
                        ? inscripcionActualizada
                        : i
                )
            }))
        } catch (e) {
            console.log(e)
        }
    }


    return <div className="border rounded p-3 flex flex-col gap-3 bg-[#131516]">
        {/* Título */}
        <h2
            onClick={() => {
                setInfoAbierta(last => {
                    const next = !last
                    if (!next) {
                        setUsuariosAbiertos(false)
                        setBotonesVisible(false)
                    }
                    return next
                })
            }}
            className="
      text-center
      font-medium
      cursor-pointer
      border-b
      pb-2
      hover:text-cyan-400
      transition
    "
        >
            {cursoArmadoLocal.curso?.nombre ?? 'Sin nombre'}
        </h2>

        {/* Info */}
        {infoAbierta && (
            <div
                onMouseEnter={() => setBotonesVisible(true)}
                onMouseLeave={() => setBotonesVisible(false)}
                className="
        flex
        flex-col
        gap-4
        max-h-[70vh]
        overflow-y-auto
        pr-1
        [&::-webkit-scrollbar]:hidden
      "
            >
                {/* Selectores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <span className="text-cyan-400 text-center">Curso</span>
                        <Example
                            seleccionado={cursoArmadoLocal.curso?.nombre}
                            callbackOnSelect={(e) => {
                                if (e?.curso_id) guardarParametro('curso', e.curso_id)
                            }}
                            opciones={cursos.map(c => ({ nombre: c.nombre, opcion: c }))}
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-cyan-400 text-center">Profesor</span>
                        <Example
                            seleccionado={cursoArmadoLocal.profesor?.nombre}
                            callbackOnSelect={(e) => {
                                if (e?.id) guardarParametro('profesor', e.id)
                            }}
                            opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-cyan-400 text-center">Empresa</span>
                        <Example
                            seleccionado={cursoArmadoLocal.empresa?.nombre}
                            callbackOnSelect={(e) => {
                                if (e?.id_empresa) guardarParametro('empresa', e.id_empresa)
                            }}
                            opciones={empresas.map(e => ({ nombre: e.nombre, opcion: e }))}
                        />
                    </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-cyan-400">Inicio</span>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_inicio ?? ''}
                            onChange={(e) => guardarParametro('fecha_inicio', e.target.value)}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-cyan-400">Finalización</span>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_finalizacion ?? ''}
                            onChange={(e) => guardarParametro('fecha_finalizacion', e.target.value)}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>
                </div>

                {/* Calificación */}
                <label className="flex flex-col gap-1">
                    <span className="text-cyan-200">Calificación aprobatoria</span>
                    <input
                        type="number"
                        defaultValue={cursoArmadoLocal.calificacion_aprobatoria ?? ''}
                        onBlur={(e) => {
                            const v = parseFloat(e.target.value)
                            if (!isNaN(v)) guardarParametro('calificacion_aprobatoria', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>

                {/* Estado */}
                <p
                    className={`
          font-semibold
          ${cursoArmadoLocal.estado === 'ACTIVO'
                            ? 'text-green-400'
                            : cursoArmadoLocal.estado === 'INACTIVO'
                                ? 'text-red-400'
                                : 'text-fuchsia-400'
                        }
        `}
                >
                    {cursoArmadoLocal.estado}
                </p>

                {/* Estudiantes */}
                <div className="border rounded p-2">
                    <div className="flex items-center gap-2">
                        <h3
                            onClick={() => setUsuariosAbiertos(v => !v)}
                            className="cursor-pointer font-medium"
                        >
                            Estudiantes ({cursoArmadoLocal.inscripciones.length})
                        </h3>

                        <Example
                            titulo="Agregar"
                            noCambiarNombreAlSeleccionar
                            callbackOnSelect={inscribirAlumno}
                            opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                        />
                    </div>

                    {usuariosAbiertos && (
                        <div className="mt-3 overflow-x-auto">
                            <div className="grid grid-cols-5 gap-2 text-center text-sm min-w-[500px]">
                                {['Nombre', 'Asist.', 'Nota', 'Notif.', ''].map(h => (
                                    <div key={h} className="bg-neutral-700 p-1 border">
                                        {h}
                                    </div>
                                ))}

                                {cursoArmadoLocal.inscripciones.map(i => (
                                    <>
                                        <div className="border p-1">{i.usuario.nombre}</div>

                                        <input
                                            type="number"
                                            defaultValue={i.asistencias}
                                            onBlur={e =>
                                                actualizarInscripcion(i.id_inscripcion, 'asistencias', Number(e.target.value))
                                            }
                                            className="border p-1"
                                        />

                                        <input
                                            type="number"
                                            defaultValue={i.calificacion}
                                            onBlur={e =>
                                                actualizarInscripcion(i.id_inscripcion, 'calificacion', Number(e.target.value))
                                            }
                                            className="border p-1"
                                        />

                                        <input
                                            type="checkbox"
                                            defaultChecked={i.notificar}
                                            onChange={e =>
                                                actualizarInscripcion(i.id_inscripcion, 'notificar', e.target.checked)
                                            }
                                        />

                                        <button
                                            onClick={() => eliminarInscripcion(i.id_inscripcion)}
                                            className="bg-red-500 hover:bg-red-600 transition text-white"
                                        >
                                            X
                                        </button>
                                    </>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className={`flex flex-col gap-2 ${botonesVisible ? '' : 'hidden'}`}>
                    <button onClick={() => guardarParametro('estado', 'ACTIVO')} className="btn bg-green-600">
                        Iniciar
                    </button>
                    <button onClick={() => guardarParametro('estado', 'INACTIVO')} className="btn bg-gray-500">
                        Desactivar
                    </button>
                    <button onClick={() => guardarParametro('estado', 'FINALIZADO')} className="btn bg-blue-500">
                        Finalizar
                    </button>
                    <button onClick={handleDelete} className="btn bg-red-500">
                        Eliminar
                    </button>
                </div>
            </div>
        )}
    </div>

}


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

    // const {
    //     datosImportados,
    //     mapeo,
    //     setMapeo,
    //     cargarArchivo,
    //     construirResultado
    // } = useExcelMapper<cursoArmado>(async (cursosExcel) => {
    //     const res = await crearCursosDeSuscriptorAsync(idSuscriptor, cursosExcel);
    //     setCursos(res);
    // });

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

    return <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold">
                Armar cursos <span className="opacity-70">({cursosArmados.length})</span>
            </h2>

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

        <div
            id="tabla-cursos-armados"
            className="
      mt-6
      w-full
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-4
      max-h-[60vh]
      overflow-y-auto
      p-2
    "
        >
            {cursosArmados.map(cursoArmado => (
                <CursoArmadoCard
                    key={cursoArmado.curso_armado_id}
                    empresas={empresas}
                    cursoArmado={cursoArmado}
                    cursos={cursos}
                    setCursosArmadosState={setCursosArmados}
                    usuarios={usuarios}
                />
            ))}
        </div>
    </div>

}