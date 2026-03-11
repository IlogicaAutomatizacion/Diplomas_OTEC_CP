import { useEffect, useState, type SetStateAction } from "react"
import { obtenerCursosParaPanelProfesor, type PanelProfesor } from "../PanelAdministrador/Api/usuarios"
import { convertirFecha } from "./Panel"
import { actualizarPropiedadDeCursoArmadoAsync, checarSiPuedeFinalizar, type cursoArmado } from "../PanelAdministrador/Api/cursos-armados"
import { editarInscripcionAsync, type inscripcion } from "../PanelAdministrador/Api/inscripciones"

const ProfesorCard = ({ curso, setPanel }: { curso: cursoArmado, setPanel: React.Dispatch<SetStateAction<PanelProfesor | null>> }) => {

    const [cursoLocal, setCursoLocal] = useState(curso)

    const [inscripciones, setInscripciones] = useState(curso.inscripciones)

    const [puedeFinalizar, setPuedeFinalizar] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            const result = await checarSiPuedeFinalizar(curso.curso_armado_id)

            console.log(result)

            setPuedeFinalizar(result)
        })()
    }, [curso])

    useEffect(() => {
        setCursoLocal(last => {
            return { ...last, inscripciones }
        })
    }, [inscripciones])

    async function handleBotonAsistencias(activar: boolean) {
        try {
            const cursoArmadoActualizado: cursoArmado = await actualizarPropiedadDeCursoArmadoAsync(cursoLocal.curso_armado_id, 'en_clase', activar)

            console.log(cursoArmadoActualizado)

            setCursoLocal(cursoArmadoActualizado)
        } catch (e) {
            console.log(e)
        }
    }

    async function handlerFinalizar() {
        try {
            const cursoArmadoActualizado: cursoArmado = await actualizarPropiedadDeCursoArmadoAsync(cursoLocal.curso_armado_id, 'estado', 'FINALIZADO')

            console.log(cursoArmadoActualizado)

            setCursoLocal(cursoArmadoActualizado)
        } catch (e) {
            console.log(e)
        }

    }
    // useEffect(() => {
    //     setPanel(last => {
    //         if (!last) { return last }

    //         return {
    //             ...last, cursosArmados: last?.cursosArmados.map(cursoArmado => {
    //                 return cursoArmado.curso_armado_id === curso.curso_armado_id ? cursoLocal : cursoArmado
    //             })
    //         }
    //     })
    // }, [cursoLocal])

    return <div
        key={curso.curso_armado_id}
        className="bg-[#1c1f21] border border-white/10 rounded-2xl p-5 flex flex-col shadow-lg hover:scale-[1.02] transition"
    >
        {/* Título */}
        <h2 className="text-xl font-semibold text-center">
            {cursoLocal.curso?.nombre}
        </h2>

        <div className="flex justify-center mt-2 flex-col gap-y-2 items-center">
            <span className={`px-3 py-1 text-sm rounded-full ${cursoLocal.en_clase ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-500/20 text-slate-400'}`}>
                {cursoLocal.en_clase ? 'EN CLASE' : 'NO HAY CLASE ACTIVA'}
            </span>

            <span className={`px-3 py-1 text-sm rounded-full ${cursoLocal.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-400'
                : cursoLocal.estado === 'INACTIVO' ? 'bg-slate-500/20 text-slate-400' :
                    cursoLocal.estado === 'FINALIZADO' ? 'bg-blue-500/20 text-blue-400' : null
                }`}>
                {cursoLocal.estado}
            </span>
        </div>

        {/* Info rápida */}
        <div className="mt-4 text-sm bg-black/20 rounded-xl p-3 space-y-1 ">
            <p>
                <span className="text-white/60">Duración:</span>{" "}
                <span className="text-green-400">
                    {cursoLocal.curso?.duracion} hrs
                </span>
            </p>

            <p>
                <span className="text-white/60">Inicio:</span>{" "}
                <span className="text-green-400">
                    {convertirFecha(cursoLocal.fecha_inicio)}
                </span>
            </p>
            <p>
                <span className="text-white/60">Finaliza:</span>{" "}
                <span className="text-green-400">
                    {convertirFecha(cursoLocal.fecha_finalizacion)}
                </span>
            </p>
        </div>

        {<div className="mt-4 bg-black/20 rounded-xl p-3 flex-1 flex flex-col text-center max-h-70 overflow-y-auto">
            <h3 className="text-blue-400 font-semibold mb-2">
                Alumnos
            </h3>

            <div className="grid grid-cols-3 gap-2">
                <p className="text-sm bg-black/40 rounded-xl p-3 text-white/80  max-h-60 whitespace-pre-line">
                    Nombre
                </p>
                <p className="text-sm bg-black/40 rounded-xl p-3 text-white/80 max-h-60 whitespace-pre-line">
                    Asistencias
                </p>
                <p className="text-sm bg-black/40 rounded-xl p-3 text-white/80  max-h-60 whitespace-pre-line">
                    Calificacion
                </p>
                {
                    inscripciones.map(inscripcion => {
                        if (!inscripcion?.usuario) { return }

                        return <>
                            <p className="text-sm bg-slate-500/20 text-slate-400 border rounded-2xl p-1 max-h-60 whitespace-pre-line">
                                {inscripcion.usuario.nombre}
                            </p>
                            <input disabled={
                                cursoLocal.estado !== 'ACTIVO' ? true : false
                            } onBlur={async (e) => {
                                if (!inscripcion?.id_inscripcion) { return }
                                try {
                                    if (isNaN(parseFloat(e.target.value))) { throw new Error('Las asistencias no son válidas.') }

                                    const inscripcionF = curso.inscripciones.find(inscripcionF => {
                                        return inscripcionF.id_inscripcion === inscripcion.id_inscripcion
                                    })

                                    if (inscripcionF?.asistencias === inscripcion.asistencias) { console.log('Son iguales'); return }


                                    await editarInscripcionAsync(inscripcion.id_inscripcion, { asistencias: parseInt(e.target.value) })

                                    setPanel(last => {
                                        if (!last) { return last }

                                        return {
                                            ...last, cursosArmados: last?.cursosArmados.map(cursoArmado => {
                                                return cursoArmado.curso_armado_id === curso.curso_armado_id ? cursoLocal : cursoArmado
                                            })
                                        }
                                    })
                                } catch (e) {
                                    setInscripciones(curso.inscripciones)
                                }
                            }} onChange={(e) => {
                                setInscripciones((last) => {
                                    return last.map(inscripcionM => {
                                        if (isNaN(parseFloat(e.target.value))) { return inscripcionM }

                                        const inscripcionActualizada: inscripcion = { ...inscripcionM, asistencias: parseFloat(e.target.value) }

                                        return inscripcionM.id_inscripcion === inscripcion.id_inscripcion ? inscripcionActualizada : inscripcionM
                                    })
                                })
                            }} type="number" defaultValue={cursoLocal.estado === 'ACTIVO' ? inscripcion.asistencias : undefined} placeholder={cursoLocal.estado !== 'ACTIVO' ? String(inscripcion.asistencias) : undefined} className="border rounded-2xl p-1" />


                            <input disabled={
                                cursoLocal.estado !== 'ACTIVO' ? true : false
                            } type="number" defaultValue={cursoLocal.estado === 'ACTIVO' ? inscripcion.calificacion : undefined} placeholder={cursoLocal.estado !== 'ACTIVO' ? String(inscripcion.calificacion) : undefined}
                                onBlur={async (e) => {
                                    if (!inscripcion?.id_inscripcion) { return }

                                    try {
                                        if (isNaN(parseFloat(e.target.value))) { throw new Error('La calificación no es válida.') }

                                        const inscripcionF = curso.inscripciones.find(inscripcionF => {
                                            return inscripcionF.id_inscripcion === inscripcion.id_inscripcion
                                        })

                                        if (inscripcionF?.calificacion === inscripcion.calificacion) { console.log('Son iguales'); return }


                                        await editarInscripcionAsync(inscripcion.id_inscripcion, { calificacion: parseFloat(e.target.value) })

                                        setPanel(last => {
                                            if (!last) { return last }

                                            return {
                                                ...last, cursosArmados: last?.cursosArmados.map(cursoArmado => {
                                                    return cursoArmado.curso_armado_id === curso.curso_armado_id ? cursoLocal : cursoArmado
                                                })
                                            }
                                        })
                                    } catch (e) {
                                        setInscripciones(curso.inscripciones)
                                    }
                                }} onChange={(e) => {
                                    setInscripciones((last) => {
                                        return last.map(inscripcionM => {
                                            if (isNaN(parseFloat(e.target.value))) { return inscripcionM }

                                            const inscripcionActualizada: inscripcion = { ...inscripcionM, calificacion: parseFloat(e.target.value) }

                                            return inscripcionM.id_inscripcion === inscripcion.id_inscripcion ? inscripcionActualizada : inscripcionM
                                        })
                                    })
                                }} className="border rounded-2xl p-1" />
                        </>
                    })
                }
            </div>

        </div>}


        <div className="mt-5 flex flex-col gap-y-2">

            <button onClick={async () => {
                if (cursoLocal.estado !== 'ACTIVO') { return }

                handleBotonAsistencias(!cursoLocal.en_clase)
            }} className={`w-full py-3 rounded-xl cursor-pointer 
                              ${!cursoLocal.en_clase && cursoLocal.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-400 transition-colors duration-200 cursor-pointer' : null}
                              ${cursoLocal.estado !== 'ACTIVO' ? 'bg-slate-500/40 text-slate-400/90 transition-colors duration-200 cursor-not-allowed' : null}
                              ${cursoLocal.estado === 'ACTIVO' && cursoLocal.en_clase ? 'bg-red-500/40 text-red-400/90 transition-colors duration-200 cursor-pointer' : null}
                 `}
            >
                {!cursoLocal.en_clase && cursoLocal.estado === 'ACTIVO' ? 'Iniciar nueva clase' : cursoLocal.estado === 'FINALIZADO' ? 'Curso finalizado' : cursoLocal.estado === 'INACTIVO' ? 'Curso inactivo' : 'Terminar clase'}
            </button>


            <button onClick={async () => {
                if (cursoLocal.estado !== 'ACTIVO' || cursoLocal.en_clase && puedeFinalizar) { return }

                handlerFinalizar()
            }} className={`w-full py-3 transition-colors duration-200 rounded-xl cursor-pointer 
                ${cursoLocal.estado !== 'ACTIVO' || cursoLocal.en_clase || !puedeFinalizar ? 'bg-slate-500/40 text-slate-400/90 cursor-not-allowed' : 'bg-red-500/40 text-red-400/90 cursor-pointer'} `}
            >
                {'Finalizar curso'}
            </button>
        </div>
    </div >
}

export default () => {
    const [panel, setPanel] = useState<PanelProfesor | null>(null)
    const [mensaje, setMensaje] = useState<string | null>('Cargando...')


    useEffect(() => {
        (async () => {
            try {
                const panel = await obtenerCursosParaPanelProfesor();

                console.log(panel)
                setPanel(panel);
                setMensaje(null);
            } catch (er: any) {
                console.log(er)

                setMensaje(er?.message ?? 'Error al obtener los cursos.');
            }
        })();
    }, []);


    useEffect(() => {
        setMensaje(null)
    }, [panel])

    return <div>
        {
            mensaje ? <p className="text-white/60 text-xl">{mensaje}</p> : panel ? <>
                {/* Encabezado */}
                <div className="text-center mb-10">
                    <p className="text-xl text-white/60">Profesor</p>
                    <h1 className="text-4xl font-bold">{panel.nombre}</h1>
                    <h2 className="text-2xl mt-3 text-blue-400">Mis cursos</h2>
                </div>

                {/* Grid cursos */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3" >
                    {panel?.cursosArmados?.map((curso) => (
                        <ProfesorCard key={curso.curso_armado_id} setPanel={setPanel} curso={curso} />
                    ))}
                </div>
            </> : null
        }
    </div>
}