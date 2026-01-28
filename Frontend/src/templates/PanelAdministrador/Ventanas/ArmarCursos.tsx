import { useEffect, useState } from "react"
import { Example } from "../Componentes/DropdownMenu"
import type { usuario } from "../Api/usuarios"
import type { empresa } from "../Api/empresas"
import type { curso } from "../Api/cursos"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync, crearCursoArmadoAsync, obtenerCursosArmadosAsync, type cursoArmado } from "../Api/cursos-armados"
import { crearInscripcionAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../Api/inscripciones"


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
    const [infoAbierta, setInfoAbierta] = useState<boolean>(false)

    const [usuariosAbiertos, setUsuariosAbiertos] = useState<boolean>(false)

    const [botonesVisible, setBotonesVisible] = useState<boolean>(false)

    const [cursoArmadoLocal, setCursoArmadoLocal] = useState<cursoArmado>(cursoArmado)

    useEffect(()=>{
        console.log(cursoArmado)
        setCursoArmadoLocal(cursoArmado)
    },[cursoArmado])

    useEffect(() => {
        console.log(cursoArmado)
        setCursosArmadosState(last => {
            return last.map((cursoArmadoObjeto) => {
                return cursoArmadoObjeto.curso_armado_id === cursoArmado.curso_armado_id ? cursoArmadoLocal : cursoArmadoObjeto
            })
        })
    }, [cursoArmadoLocal])


    async function handleDelete() {
        await borrarCursoArmadoAsync(cursoArmado.curso_armado_id)

        setCursosArmadosState(last => {
            const withoutDeleted = last.filter((cursoArmadoM) => {
                return cursoArmadoM.curso_armado_id !== cursoArmado.curso_armado_id
            })

            return withoutDeleted
        })
    }

    async function guardarParametro(nombreParametro: string, nuevoValor: string | number) {
        console.log(nombreParametro, nuevoValor)

        const ultimaVersion = cursoArmadoLocal[nombreParametro as keyof cursoArmado]
        const nuevaVersion = isNaN(nuevoValor as number) ? (nuevoValor as string).trim() : nuevoValor //cursoLocal[nombreParametro as keyof curso]

        console.log(ultimaVersion, nuevaVersion)
        if (ultimaVersion === nuevaVersion) { return }

        try {
            await actualizarPropiedadDeCursoArmadoAsync(cursoArmadoLocal.curso_armado_id, nombreParametro, nuevaVersion)
            setCursoArmadoLocal(last => {
                const cambiado = { ...last, [nombreParametro]: nuevaVersion }

                return cambiado
            })

        } catch (e) {
            console.log(e)

            setCursoArmadoLocal(last => {
                const cambiado = { ...last, [nombreParametro]: ultimaVersion }

                return cambiado
            })
        }
    }

    async function inscribirAlumno(usuario: usuario) {
        try {
            const cursoArmadoReformado: cursoArmado = await crearInscripcionAsync({
                cursoArmado: cursoArmado.curso_armado_id,
                usuario: usuario.id
            })

            setCursoArmadoLocal(cursoArmadoReformado)
        } catch (e) {
            console.log(e)
        }
    }

    async function eliminarInscripcion(id_inscripcion: number) {
        try {
            const cursoArmadoReformado: cursoArmado = await eliminarInscripcionAsync(id_inscripcion)

            setCursoArmadoLocal(cursoArmadoReformado)
        } catch (e) {
            console.log(e)
        }
    }

    async function actualizarInscripcion(id_inscripcion: number, propiedad: keyof inscripcion, nuevoValor: any) {
        console.log(propiedad, nuevoValor)

        try {
            if (nuevoValor === undefined || nuevoValor === null) {
                throw new Error('El valor no puede estar vacio.')
            }

            const inscripcionRenovada = await editarInscripcionAsync(id_inscripcion, {
                [propiedad]: nuevoValor
            })

            setCursoArmadoLocal(last => {
                const actualizado = {
                    ...last, inscripciones: last.inscripciones.map(inscripcion => {
                        return id_inscripcion === inscripcion.id_inscripcion ? inscripcionRenovada : inscripcion
                    })
                }

                return actualizado
            })

        } catch (e) {
            console.log(e)

            // setCursoArmadoLocal(last => {
            //     const cambiado = { ...last, [nombreParametro]: ultimaVersion }

            //     return cambiado
            // })
        }
    }

    return <div className={`border p-2 h-auto overflow-x-hidden  flex flex-col `}>

        <div className="flex flex-col h-auto gap-y-1 break-all">
            <h2 onClick={() => {
                setInfoAbierta(last => {
                    const df = !last

                    if (!df) {
                        setUsuariosAbiertos(false)
                        setBotonesVisible(false)
                    }

                    return !last
                })
            }} className="border-b cursor-pointer text-center">{'Sin nombre'}</h2>

            {infoAbierta ? <div onMouseEnter={() => {
                setBotonesVisible(true)
            }} onMouseLeave={() => {
                setBotonesVisible(false)
            }} className={` overflow-y-auto h-full border flex flex-col gap-y-3 p-2 [&::-webkit-scrollbar]:hidden whitespace-pre-line`}>
                <p><span className="text-cyan-400 ">Curso: </span> <span >{<Example seleccionado={cursoArmadoLocal.curso?.nombre} callbackOnSelect={(e) => {
                    guardarParametro('curso', e.curso_id)
                }} opciones={
                    cursos.map((curso) => (
                        {
                            nombre: curso.nombre,
                            opcion: curso
                        }
                    ))
                }
                />} </span> </p>
                <p><span className="text-cyan-400 ">Profesor: </span> <span>{<Example seleccionado={cursoArmadoLocal.profesor?.nombre} callbackOnSelect={(e) => {
                    guardarParametro('profesor', e.id)
                }} opciones={
                    usuarios.map((usuario) => (
                        {
                            nombre: usuario.nombre,
                            opcion: usuario
                        }
                    ))
                }
                />} </span> </p>


                <p><span className="text-cyan-400 ">Empresa: </span> <span>{<Example seleccionado={cursoArmadoLocal.empresa?.nombre} callbackOnSelect={(e) => {
                    guardarParametro('empresa', e.id_empresa)
                }} opciones={
                    empresas.map((empresa) => (
                        {
                            nombre: empresa.nombre,
                            opcion: empresa
                        }
                    ))
                }
                />} </span> </p>

                <p><span className="text-cyan-400 ">Fecha de inicio: </span> <input value={cursoArmadoLocal?.fecha_inicio ?? undefined} onChange={(e) => {
                    guardarParametro('fecha_inicio', e.target.value)
                }} className='border' type="date" /> </p>
                <p><span className="text-cyan-400 ">Fecha de finalización: </span> <input value={cursoArmadoLocal?.fecha_finalizacion ?? undefined} onChange={(e) => {
                    guardarParametro('fecha_finalizacion', e.target.value)
                }} className='border' type="date" /> </p>

                <p><span className="text-cyan-200 ">Calificacion aprobatoria: </span> <input inputMode="decimal" defaultValue={cursoArmadoLocal?.calificacion_aprobatoria ?? undefined} onBlur={(e) => {
                    if (isNaN(parseFloat(e.target.value))) { return }

                    guardarParametro('calificacion_aprobatoria', parseFloat(e.target.value) || 0)
                }} className='border' type="number" /> </p>


                <p className={`
                        ${cursoArmadoLocal.estado === 'ACTIVO'
                        ? 'text-green-400' : cursoArmadoLocal.estado === 'INACTIVO' ? 'text-red-400'
                            : cursoArmadoLocal.estado === 'FINALIZADO' ? 'text-fuchsia-400' : null}`}> {cursoArmadoLocal.estado} </p>

                <div className='w-full h-auto border p-2'>
                    <div className='cursor-pointer text-2xl flex flex-row w-full '>
                        <h2 onClick={() => {
                            setUsuariosAbiertos(last => !last)
                        }} className='ml-auto'>Estudiantes ({cursoArmadoLocal?.inscripciones?.length})</h2>
                        <span className='ml-auto'><Example titulo={'Agregar'} noCambiarNombreAlSeleccionar={true} callbackOnSelect={(opcion) => {

                            inscribirAlumno(opcion)

                        }} opciones={
                            usuarios.map((usuario) => (
                                {
                                    nombre: usuario.nombre,
                                    opcion: usuario
                                }
                            ))
                        } /></span>
                    </div>

                    {usuariosAbiertos ? <ul className='list-disc mt-3  max-h-60 text-center overflow-y-auto grid items-center justify-center grid-cols-5'>
                        <p className="bg-neutral-700 p-1 w-full h-full border">Nombre</p>
                        <p className="bg-neutral-700 p-1 w-full h-full border">Asistencias</p>
                        <p className="bg-neutral-700 p-1 w-full h-full border">Calificacion</p>
                        <p className="bg-neutral-700 p-1 w-full h-full border">Notificar</p>
                        <p className="bg-neutral-700 p-1 w-full h-full border">Borrar</p>

                        {
                            cursoArmadoLocal.inscripciones.map(({ usuario, asistencias, notificar, calificacion, id_inscripcion }) => {
                                return <>
                                    <p className='border p-1 mr-4 w-full hover:ring-2 ring-blue-500 '>{usuario.nombre} </p>

                                    <input type="number" onBlur={(e) => {
                                        actualizarInscripcion(id_inscripcion, 'asistencias', parseInt(e.target.value))
                                    }} defaultValue={asistencias} className="border h-full w-full p-1" />
                                    <input type="number" onBlur={(e) => {
                                        actualizarInscripcion(id_inscripcion, 'calificacion', parseFloat(e.target.value))
                                    }} defaultValue={calificacion} className="border h-full w-full p-1" />
                                    <input onChange={(e) => {
                                        console.log(e.target.checked)
                                        actualizarInscripcion(id_inscripcion, 'notificar', e.target.checked)
                                    }} type="checkbox" defaultChecked={notificar} className="border p-2 w-[90%] h-[90%]" />
                                    <button onClick={() => {
                                        eliminarInscripcion(id_inscripcion)
                                    }} className='p-1 h-full w-full border bg-red-400 ml-auto cursor-pointer'>
                                        X
                                    </button>
                                </>
                            })
                        }

                    </ul> : null}
                </div>

                <div className='botones flex flex-col gap-y-2'>
                    <button onClick={() => {
                        guardarParametro('estado', 'ACTIVO')
                    }} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-green-600`}>
                        Iniciar
                    </button>
                    <button onClick={() => {
                        guardarParametro('estado', 'INACTIVO')
                    }} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-gray-400`}>
                        Desactivar
                    </button>
                    <button onClick={() => {
                        guardarParametro('estado', 'FINALIZADO')
                    }} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-blue-400`}>
                        Finalizar
                    </button>
                    <button onClick={handleDelete} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}>
                        Eliminar
                    </button>
                </div>
            </div> : null
            }
        </div >
    </div >
}


export default ({ usuarios, empresas, cursos, cursosArmados, setCursosArmados }: {
    usuarios: usuario[],
    empresas: empresa[],
    cursos: curso[],
    cursosArmados: cursoArmado[],
    setCursosArmados: React.Dispatch<React.SetStateAction<cursoArmado[]>>
}) => {
    const [mensajeCursos, setMensajeCursos] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    useEffect(() => {
        
        (async () => {
            try {
                const cursos = await obtenerCursosArmadosAsync()

                setCursosArmados(cursos)
            } catch (e) {
                setMensajeCursos(`Hubo un error al obtener los cursos: ${String(e)}`)
            }
        })()
    }, [empresas,cursos,usuarios])

    useEffect(() => {
        setMensajeBoton(null)
    }, [cursosArmados])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const cursoNuevo = await crearCursoArmadoAsync()

            setCursosArmados((last) => {
                return [...last, cursoNuevo]
            })
        } catch (e) {
            setMensajeBoton('Hubo un problema al crear el curso armado.')

            setTimeout(() => {
                setMensajeBoton(null)
            }, 2000);
        }
    }

    return <>
        <h2 className="text-3xl mt-25">Armar cursos ({cursosArmados.length}) <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'>
            <button onClick={handleAddButton} className='cursor-pointer'>
                {mensajeBoton ?? 'Agregar'}
            </button>
        </span></h2>

        <div id="tabla-cursos-armados" className="w-[95%] auto-rows-max grid m-5 gap-y-2 content-start grid-cols-2 p-2 overflow-y-scroll h-245 bg-scroll-[#131516]  border-5">
            {mensajeCursos ? <p>{mensajeCursos}</p> :
                cursosArmados.map((cursoArmado) => {
                    return <CursoArmadoCard empresas={empresas} key={cursoArmado.curso_armado_id} cursoArmado={cursoArmado} cursos={cursos} setCursosArmadosState={setCursosArmados} usuarios={usuarios} />
                })
            }
        </div>
    </>
}