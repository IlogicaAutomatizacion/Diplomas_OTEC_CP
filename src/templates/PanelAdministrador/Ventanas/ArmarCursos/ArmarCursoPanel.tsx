import type { cursoArmado } from "../../Api/cursos-armados";
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { crearInscripcionAsync, crearInscripcionesAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../../Api/inscripciones"
import { Example } from "../../Componentes/DropdownMenu"
import React, { useEffect, useState } from "react"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync, descargarCotizacionAsync, mandarCotizacionDeCurso, mandarEncuestasDeSatisfaccion } from "../../Api/cursos-armados"
import type { usuario } from "../../Api/usuarios"
import type { curso } from "../../Api/cursos";
import type { empresa } from "../../Api/empresas";
import { comprobarFormatoDeCotizacion, eliminarFormatoDeCotizacion, subirArchivoParaFormatoDeCotizacion } from "../../Api/suscripciones";
import CreadorDeEncuesta, { type EncuestaFormato, type RespuestaEncuesta } from "../../Componentes/CreadorDeEncuesta";
import { eliminarFormatoEncuestaSatisfaccionClienteAsync, eliminarFormatoEncuestaSatisfaccionUsuarioAsync, obtenerFormatoEncuestaSatisfaccionClienteAsync, obtenerFormatoEncuestaSatisfaccionUsuarioAsync, obtenerRespuestaEncuestaPorCursoArmadoAsync, obtenerRespuestasEncuestaAsync, subirFormatoEncuestaSatisfaccionClienteAsync, subirFormatoEncuestaSatisfaccionUsuarioAsync } from "../../Api/formatos-dinamicos";


const BotonEliminarConConfirmacion = ({ onConfirmar, label = "Eliminar formato de encuesta" }: {
    onConfirmar: () => Promise<void>,
    label?: string
}) => {
    const [confirmando, setConfirmando] = useState(false)

    if (confirmando) return (
        <div className="flex gap-2 items-center">
            <p className="text-sm opacity-70">¿Estás seguro?</p>
            <button
                className="p-2 border bg-red-600 cursor-pointer"
                onClick={async () => {
                    await onConfirmar()
                    setConfirmando(false)
                }}
            >
                Sí, eliminar
            </button>
            <button
                className="p-2 border cursor-pointer"
                onClick={() => setConfirmando(false)}
            >
                Cancelar
            </button>
        </div>
    )

    return (
        <button className="p-2 border cursor-pointer" onClick={() => setConfirmando(true)}>
            {label}
        </button>
    )
}

const TablaRespuestasEncuestaInscripciones = ({ encuesta, inscripciones }: {
    encuesta: EncuestaFormato,
    inscripciones: inscripcion[]
}) => {
    console.log(inscripciones)
    // Recolectar todas las respuestas de todas las inscripciones para esta encuesta
    const filas = inscripciones
        .filter(i => i.respuestas_encuestas?.[encuesta.id]?.length)
        .flatMap(i => (i.respuestas_encuestas?.[encuesta.id] ?? []).map(r => ({
            usuario: i.usuario?.nombre ?? i.uuid_inscripcion ?? 'Desconocido',
            respuestas: r.respuestas
        })))

    if (filas.length === 0) return <p className="text-sm opacity-60 mt-2">Sin respuestas aún.</p>

    // Calcular suma y promedio por pregunta (solo las numéricas)
    const sumasPorPregunta: Record<string, { suma: number, count: number }> = {}

    filas.forEach(fila => {
        fila.respuestas.forEach(r => {
            const num = Number(r.valor)
            if (!isNaN(num)) {
                if (!sumasPorPregunta[r.pregunta_id]) {
                    sumasPorPregunta[r.pregunta_id] = { suma: 0, count: 0 }
                }
                sumasPorPregunta[r.pregunta_id].suma += num
                sumasPorPregunta[r.pregunta_id].count += 1
            }
        })
    })

    const preguntas = encuesta.preguntas

    return (
        <div className="overflow-x-auto w-full mt-3">
            {/* Header */}
            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
            >
                <div className="p-2 border-r">Usuario</div>
                {preguntas.map(p => (
                    <div key={p.id} className="p-2 border-r last:border-r-0">{p.titulo}</div>
                ))}
            </div>

            {/* Filas */}
            {filas.map((fila, idx) => (
                <div
                    key={idx}
                    className="grid text-center text-sm border-b"
                    style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
                >
                    <div className="p-2 border-r bg-neutral-800">{fila.usuario}</div>
                    {preguntas.map(p => {
                        const respuesta = fila.respuestas.find(r => r.pregunta_id === p.id)
                        const valor = respuesta?.valor
                        return (
                            <div key={p.id} className="p-2 border-r last:border-r-0">
                                {Array.isArray(valor) ? valor.join(', ') : valor ?? '-'}
                            </div>
                        )
                    })}
                </div>
            ))}

            {/* Suma y promedio — solo si hay al menos una columna numérica */}
            {Object.keys(sumasPorPregunta).length > 0 && <>
                <div
                    className="grid text-center text-sm font-semibold bg-neutral-700 border-t"
                    style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
                >
                    <div className="p-2 border-r">Suma</div>
                    {preguntas.map(p => (
                        <div key={p.id} className="p-2 border-r last:border-r-0">
                            {sumasPorPregunta[p.id] ? sumasPorPregunta[p.id].suma : '-'}
                        </div>
                    ))}
                </div>


            </>}
            {Object.keys(sumasPorPregunta).length > 0 && (() => {
                const sumas = preguntas
                    .filter(p => sumasPorPregunta[p.id])
                    .map(p => sumasPorPregunta[p.id].suma)

                const promedio = sumas.reduce((acc, s) => acc + s, 0) / sumas.length

                return (
                    <div className="flex justify-end items-center gap-3 border-t mt-1 pt-2 pr-2 text-sm font-semibold">
                        <span className="opacity-60">Promedio de sumas:</span>
                        <span>{promedio.toFixed(2)}</span>
                    </div>
                )
            })()}
        </div>
    )
}

const TablaRespuestasEncuestaCliente = ({ usuario, encuesta, respuestas }: {
    encuesta: EncuestaFormato,
    usuario: usuario | null | undefined
    respuestas: RespuestaEncuesta[] | null | undefined
}) => {
    if (!usuario) return <p className="text-sm opacity-60 mt-2">No hay un cliente seleccionado.</p>

    if (!respuestas) return <p className="text-sm opacity-60 mt-2">Sin respuestas aún.</p>

    // Recolectar todas las respuestas de todas las inscripciones para esta encuesta
    const filas = [
        {
            usuario: usuario.nombre,
            respuestas: respuestas?.[0].respuestas
        }
    ]

    if (filas.length === 0) return <p className="text-sm opacity-60 mt-2">Sin respuestas aún.</p>

    // Calcular suma y promedio por pregunta (solo las numéricas)
    const sumasPorPregunta: Record<string, { suma: number, count: number }> = {}

    filas.forEach(fila => {
        fila.respuestas.forEach(r => {
            const num = Number(r.valor)
            if (!isNaN(num)) {
                if (!sumasPorPregunta[r.pregunta_id]) {
                    sumasPorPregunta[r.pregunta_id] = { suma: 0, count: 0 }
                }
                sumasPorPregunta[r.pregunta_id].suma += num
                sumasPorPregunta[r.pregunta_id].count += 1
            }
        })
    })

    const preguntas = encuesta.preguntas

    return (
        <div className="overflow-x-auto w-full mt-3">
            {/* Header */}
            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
            >
                <div className="p-2 border-r">Usuario</div>
                {preguntas.map(p => (
                    <div key={p.id} className="p-2 border-r last:border-r-0">{p.titulo}</div>
                ))}
            </div>

            {/* Filas */}
            {filas.map((fila, idx) => (
                <div
                    key={idx}
                    className="grid text-center text-sm border-b"
                    style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
                >
                    <div className="p-2 border-r bg-neutral-800">{fila.usuario}</div>
                    {preguntas.map(p => {
                        const respuesta = fila.respuestas.find(r => r.pregunta_id === p.id)
                        const valor = respuesta?.valor
                        return (
                            <div key={p.id} className="p-2 border-r last:border-r-0">
                                {Array.isArray(valor) ? valor.join(', ') : valor ?? '-'}
                            </div>
                        )
                    })}
                </div>
            ))}

            {/* Suma y promedio — solo si hay al menos una columna numérica */}
            {Object.keys(sumasPorPregunta).length > 0 && <>
                <div
                    className="grid text-center text-sm font-semibold bg-neutral-700 border-t"
                    style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
                >
                    <div className="p-2 border-r">Suma</div>
                    {preguntas.map(p => (
                        <div key={p.id} className="p-2 border-r last:border-r-0">
                            {sumasPorPregunta[p.id] ? sumasPorPregunta[p.id].suma : '-'}
                        </div>
                    ))}
                </div>


            </>}
            {Object.keys(sumasPorPregunta).length > 0 && (() => {
                const sumas = preguntas
                    .filter(p => sumasPorPregunta[p.id])
                    .map(p => sumasPorPregunta[p.id].suma)

                const promedio = sumas.reduce((acc, s) => acc + s, 0) / sumas.length

                return (
                    <div className="flex justify-end items-center gap-3 border-t mt-1 pt-2 pr-2 text-sm font-semibold">
                        <span className="opacity-60">Promedio de sumas:</span>
                        <span>{promedio.toFixed(2)}</span>
                    </div>
                )
            })()}
        </div>
    )
}

const TablaAsistenciasEstudiantes = ({ inscripciones }: {
    inscripciones: inscripcion[]
}) => {
    if (!inscripciones.length) return <p className="text-sm opacity-60 mt-2">Sin estudiantes inscritos.</p>

    const filas = inscripciones.map(i => ({
        nombre: i.usuario?.nombre ?? i.uuid_inscripcion ?? 'Desconocido',
        asistencias: i.asistencias != null ? Number(i.asistencias) : null,
        teorica: i.teorica != null ? Number(i.teorica) : null,
        calificacion: i.calificacion != null ? Number(i.calificacion) : null,
    }))

    const suma = {
        asistencias: filas.reduce((acc, f) => acc + (f.asistencias ?? 0), 0),
        teorica: filas.reduce((acc, f) => acc + (f.teorica ?? 0), 0),
        calificacion: filas.reduce((acc, f) => acc + (f.calificacion ?? 0), 0),
    }

    const conTeorica = filas.filter(f => f.teorica != null).length
    const conCalificacion = filas.filter(f => f.calificacion != null).length

    const promedio = {
        asistencias: filas.length ? suma.asistencias / filas.length : 0,
        teorica: conTeorica ? suma.teorica / conTeorica : 0,
        calificacion: conCalificacion ? suma.calificacion / conCalificacion : 0,
    }

    const columnas = ['Estudiante', 'Asistencias', 'Nota teórica', 'Nota práctica']

    return (
        <div className="overflow-x-auto w-full mt-3">
            {/* Header */}
            <div className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
            >
                {columnas.map(c => (
                    <div key={c} className="p-2 border-r last:border-r-0">{c}</div>
                ))}
            </div>

            {/* Filas */}
            {filas.map((fila, idx) => (
                <div key={idx} className="grid text-center text-sm border-b"
                    style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
                >
                    <div className="p-2 border-r bg-neutral-800">{fila.nombre}</div>
                    <div className="p-2 border-r">{fila.asistencias ?? '-'}</div>
                    <div className="p-2 border-r">{fila.teorica ?? '-'}</div>
                    <div className="p-2">{fila.calificacion ?? '-'}</div>
                </div>
            ))}

            {/* Suma */}
            <div className="grid text-center text-sm font-semibold bg-neutral-700 border-t"
                style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
            >
                <div className="p-2 border-r">Suma</div>
                <div className="p-2 border-r">{suma.asistencias}</div>
                <div className="p-2 border-r">{suma.teorica}</div>
                <div className="p-2">{suma.calificacion}</div>
            </div>

            {/* Promedio */}
            <div className="flex justify-end items-center gap-3 border-t mt-1 pt-2 pr-2 text-sm font-semibold">
                <span className="opacity-60">Promedio asistencias:</span>
                <span>{promedio.asistencias.toFixed(2)}</span>
                <span className="opacity-60 ml-4">Promedio teórica:</span>
                <span>{promedio.teorica.toFixed(2)}</span>
                <span className="opacity-60 ml-4">Promedio práctica:</span>
                <span>{promedio.calificacion.toFixed(2)}</span>
            </div>
        </div>
    )
}

const RegistrosDelCurso = ({ id_suscriptor, uuid_suscriptor, inscripciones, respuestasCliente, cliente }: {
    id_suscriptor: number,
    uuid_suscriptor: string,
    inscripciones: inscripcion[]  // 👈 recibe las inscripciones del padre
    respuestasCliente: RespuestaEncuesta[] | null | undefined,
    cliente: usuario | null | undefined
}) => {
    const [formatoSatifaccionUsuario, setFormatoSatisfaccionUsuario] = useState<EncuestaFormato | null>()
    const [formatoSatifaccionCliente, setFormatoSatisfaccionCliente] = useState<EncuestaFormato | null>()

    useEffect(() => {
        ; (async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionClienteAsync(uuid_suscriptor)
            setFormatoSatisfaccionCliente(encuesta)
        })()

            ; (async () => {
                const encuesta = await obtenerFormatoEncuestaSatisfaccionUsuarioAsync(uuid_suscriptor)
                setFormatoSatisfaccionUsuario(encuesta)
            })()
    }, [])

    return <>
        <h2 className="text-4xl text-center mt-15">Registros del curso</h2>
        <div className="border rounded p-2 flex flex-col justify-center items-center gap-y-10">

            {/* Encuesta estudiante */}
            <div className="flex justify-center items-center flex-col w-full">
                <h3 className="text-2xl">Encuesta del estudiante</h3>

                {!formatoSatifaccionUsuario
                    ? <CreadorDeEncuesta
                        titulo="Encuesta de satisfacción de alumno"
                        descripcion="Aqui va algo"
                        limite_respuestas={-1}
                        callbackParaEncuestaTerminada={async (encuesta) => {
                            await subirFormatoEncuestaSatisfaccionUsuarioAsync(id_suscriptor, encuesta)
                            setFormatoSatisfaccionUsuario(encuesta)
                        }}
                    />
                    : <>
                        <BotonEliminarConConfirmacion onConfirmar={async () => {
                            await eliminarFormatoEncuestaSatisfaccionUsuarioAsync(id_suscriptor)
                            setFormatoSatisfaccionUsuario(null)
                        }} />


                        <TablaRespuestasEncuestaInscripciones
                            encuesta={formatoSatifaccionUsuario}
                            inscripciones={inscripciones}
                        />
                    </>
                }
            </div>

            {/* Encuesta cliente */}
            <div className="flex justify-center items-center flex-col w-full">
                <h3 className="text-2xl">Encuesta del cliente</h3>

                {!formatoSatifaccionCliente
                    ? <CreadorDeEncuesta
                        titulo="Encuesta de satisfacción del cliente"
                        descripcion="Aqui va algo"
                        limite_respuestas={-1}
                        callbackParaEncuestaTerminada={async (encuesta) => {
                            await subirFormatoEncuestaSatisfaccionClienteAsync(id_suscriptor, encuesta)
                            setFormatoSatisfaccionCliente(encuesta)
                        }}
                    />
                    : <>
                        <BotonEliminarConConfirmacion onConfirmar={async () => {
                            await eliminarFormatoEncuestaSatisfaccionClienteAsync(id_suscriptor)
                            setFormatoSatisfaccionCliente(null)
                        }} />


                        <TablaRespuestasEncuestaCliente
                            usuario={cliente}
                            encuesta={formatoSatifaccionCliente}
                            respuestas={respuestasCliente}
                        />
                    </>
                }
            </div>

            {/* Asistencias */}
            <div className="flex justify-center items-center flex-col w-full">
                <h3 className="text-2xl">Asistencias de estudiantes</h3>
                <TablaAsistenciasEstudiantes inscripciones={inscripciones} />
            </div>
        </div>
    </>
}

export default ({
    cursoArmado,
    setCursosArmadosState,
    idSuscriptor,
    uuidSuscriptor,
    setCursoArmadoAVisualizar,
    cursos,
    empresas,
    usuarios
}: {
    cursoArmado: cursoArmado,
    idSuscriptor: number,
    uuidSuscriptor: string,
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>,
    setCursosArmadosState: React.Dispatch<React.SetStateAction<cursoArmado[]>>,
    cursos: curso[],
    empresas: empresa[]
    usuarios: usuario[]
}) => {
    const [usuariosAbiertos, setUsuariosAbiertos] = useState(false)

    const [cursoArmadoLocal, setCursoArmadoLocal] = useState<cursoArmado>(cursoArmado)

    const [mensajeInscripciones, setMensajeInscripciones] = useState<string | null>(null)

    const [hayFormatoDeCotizacion, setHayFormatoDeCotizacion] = useState<boolean>(true)

    const [mandandoCotizacion, setMandandoCotizacion] = useState<boolean>(false)
    const [cotizacionEnviadaCorrectamente, setCotizacionEnviadaCorrectamente] = useState(false)

    const [encuestasDeSatisfaccionEnvidasCorrectamente, setEncuestasDeSatisfaccionEnvidasCorrectamente] = useState(false)
    const [enviandoEncuestasDeSatisfaccion, setEnviandoEncuestasDeSatisfaccion] = useState<boolean>(false)

    const [respuestasCliente, setRespuestasCliente] = useState<RespuestaEncuesta[] | null>()

    const [descargandoCotizacion, setDescargandoCotizacion] = useState<boolean>(false)

    const {
        datosImportados,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<inscripcion>(async (inscripcionesExcel) => {
        try {

            setMensajeInscripciones('Creando inscripciones...')
            const cursoArmadoActualizado = await crearInscripcionesAsync(inscripcionesExcel.filter(
                inscripcion => {
                    return inscripcion?.rut
                }
            ));
            setCursoArmadoLocal(cursoArmadoActualizado)

        } finally {
            setMensajeInscripciones(null)
        }

    });

    useEffect(() => {
        ; (async () => {
            try {
                const hayFormatoDeCotizacion = await comprobarFormatoDeCotizacion(idSuscriptor)


                setHayFormatoDeCotizacion(hayFormatoDeCotizacion)

            } catch {
                setHayFormatoDeCotizacion(false)
            }
        })()
    }, [])

    useEffect(() => {
        setCursoArmadoLocal(cursoArmado)
    }, [cursoArmado.curso_armado_id])

    useEffect(() => {

        setCursosArmadosState(prev =>
            prev.map(c =>
                c.curso_armado_id === cursoArmadoLocal.curso_armado_id
                    ? cursoArmadoLocal
                    : c
            )
        )
    }, [cursoArmadoLocal.curso_armado_id, cursoArmadoLocal])

    useEffect(() => {
        ; (async () => {
            if (cursoArmadoLocal?.contactoDeCotizacion && cursoArmadoLocal.contactoDeCotizacion?.token) {
                const formatoEncuestaSatisfaccionCliente = await obtenerFormatoEncuestaSatisfaccionClienteAsync(uuidSuscriptor)

                const respuestas = await obtenerRespuestaEncuestaPorCursoArmadoAsync(cursoArmadoLocal.contactoDeCotizacion?.token, formatoEncuestaSatisfaccionCliente.id, cursoArmadoLocal.token_curso)

                if (respuestas) {
                    const x: RespuestaEncuesta[] = [respuestas]

                    setRespuestasCliente(x)
                }
            }
        })()

    }, [cursoArmadoLocal.contactoDeCotizacion])

    useEffect(() => {
        if (cotizacionEnviadaCorrectamente) {
            setTimeout(() => {
                setCotizacionEnviadaCorrectamente(false)
            }, 2000);
        }
    }, [cotizacionEnviadaCorrectamente])

    useEffect(() => {
        if (encuestasDeSatisfaccionEnvidasCorrectamente) {
            setTimeout(() => {
                setEncuestasDeSatisfaccionEnvidasCorrectamente(false)
            }, 2000);
        }
    }, [encuestasDeSatisfaccionEnvidasCorrectamente])


    async function handleDelete() {
        try {
            await borrarCursoArmadoAsync(cursoArmado.curso_armado_id)

            setCursosArmadosState(prev =>
                prev.filter(c => c.curso_armado_id !== cursoArmado.curso_armado_id)
            )

            setCursoArmadoAVisualizar(null)
        } catch (e: any) {
            console.log(e)
        }
    }

    async function guardarParametro(
        nombreParametro: keyof cursoArmado,
        nuevoValor: string | number
    ) {

        try {
            await actualizarPropiedadDeCursoArmadoAsync(
                cursoArmadoLocal.curso_armado_id,
                nombreParametro,
                nuevoValor
            )
        } catch (e: any) {
            console.log(e)

            // rollback
            setCursoArmadoLocal(prev => ({
                ...prev,
                [nombreParametro]: nuevoValor
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


    return <div
        className="
        flex
        flex-col
        gap-4
        boder
        overflow-y-auto
        pr-1
      "
    >

        <button
            onClick={() => {
                setCursoArmadoAVisualizar(null)
            }}
            className="
        bg-green-600
        hover:bg-green-700
        text-white
        px-4
        cursor-pointer
        py-2
        rounded
        transition
        w-full
        sm:w-auto
      "
        >
            {'Volver a la lista de cursos armados'}
        </button>


        {/* Menú de cotización */}

        <h2 className="text-4xl text-center mt-20">Cotización</h2>
        <div className="border rounded p-10 flex flex-col justify-center items-center gap-10 ">
            <div className="grid grid-cols-2  gap-10 ">
                <div id="selector-empresa" className="flex flex-col col-1 row-1">
                    <span className="text-cyan-400 text-center">Empresa</span>
                    <Example
                        seleccionado={cursoArmadoLocal.empresa?.nombre}
                        callbackOnSelect={(e) => {
                            const valorActual = cursoArmadoLocal["empresa"]

                            if (valorActual === e) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,
                                ["empresa"]: e
                            }))


                            if (e?.id_empresa) guardarParametro('empresa', e.id_empresa)
                        }}
                        opciones={empresas.map(e => ({ nombre: e.nombre, opcion: e }))}
                    />
                </div>

                <div id="selector-curso" className="flex flex-col col-1 row-2">
                    <span className="text-cyan-400 text-center">Curso</span>
                    <Example
                        seleccionado={cursoArmadoLocal.curso?.nombre}
                        callbackOnSelect={(e) => {
                            const valorActual = cursoArmadoLocal["curso"]

                            if (valorActual === e) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,
                                ["curso"]: e
                            }))

                            if (e?.curso_id) guardarParametro('curso', e.curso_id)
                        }}
                        opciones={cursos.map(c => ({ nombre: c.nombre, opcion: c }))}
                    />
                </div>

                <div id="selector-contacto-de-cotizacion" className="flex flex-col col-1 row-3">
                    <span className="text-cyan-400 text-center">Usuario de contacto</span>
                    <Example


                        seleccionado={cursoArmadoLocal.contactoDeCotizacion?.nombre}
                        callbackOnSelect={(e) => {
                            const valorActual = cursoArmadoLocal["contactoDeCotizacion"]

                            if (valorActual === e) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,
                                ["contactoDeCotizacion"]: e
                            }))

                            if (e?.id) guardarParametro('contactoDeCotizacion', e.id)
                        }}
                        opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                    />
                </div>

                <label id="alumnos-cotizados" className="flex flex-col gap-1 col-2 row-1">
                    <span className="text-cyan-200/80">Alumnos cotizados</span>
                    <input
                        type="number"
                        defaultValue={cursoArmadoLocal.alumnosCotizados ?? ''}
                        onBlur={(e) => {
                            const v = parseFloat(e.target.value)

                            const valorActual = cursoArmadoLocal["alumnosCotizados"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["alumnosCotizados"]: v
                            }))

                            if (!isNaN(v)) guardarParametro('alumnosCotizados', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>

                <label id="valor-de-curso" className="flex flex-col gap-1 col-2 row-2">
                    <span className="text-cyan-200/80">Valor unitario</span>
                    <input
                        type="number"
                        defaultValue={cursoArmadoLocal.valorUnitario ?? ''}
                        onBlur={(e) => {
                            const v = parseFloat(e.target.value)

                            const valorActual = cursoArmadoLocal["valorUnitario"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["valorUnitario"]: v
                            }))

                            if (!isNaN(v)) guardarParametro('valorUnitario', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>



                <label id="notas_cotizacion" className="flex flex-col gap-1 row-span-3 row-start-4 col-span-2  resize">
                    <span className="text-cyan-200/80">Notas</span>
                    <textarea
                        defaultValue={cursoArmadoLocal.notas_cotizacion ?? ''}
                        onBlur={(e) => {
                            const v = e.target.value

                            const valorActual = cursoArmadoLocal["notas_cotizacion"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["notas_cotizacion"]: v
                            }))

                            if (v) guardarParametro('notas_cotizacion', v)
                        }}
                        className="border bg-transparent p-1 rounded h-auto resize-y"
                    />
                </label>
            </div>

            <h3 className="mt-5 text-2xl">Subir formato de cotización</h3>
            {!hayFormatoDeCotizacion ? <input
                type="file"
                accept=".docx"
                onChange={async (e) => {
                    try {
                        const file = e.target.files?.[0];
                        if (file) {
                            await subirArchivoParaFormatoDeCotizacion(idSuscriptor, file)

                            setHayFormatoDeCotizacion(true)
                        }
                    } catch {
                        setHayFormatoDeCotizacion(false)
                    }
                }}
                className="
                                    w-[70%]
                                    p-2
                                    bg-slate-700
                                    border
                                    rounded
                                    cursor-pointer
                                "
            /> : <button className="p-2 bg-red-500 cursor-pointer" onClick={async () => {
                const result = await eliminarFormatoDeCotizacion(idSuscriptor)

                console.log(result)
                if (result === true) {
                    setHayFormatoDeCotizacion(false)
                }

            }}>
                Eliminar formato de cotización
            </button>}
        </div>

        <button id="emitir-cotizacion" onClick={async () => {
            if (descargandoCotizacion) { return }

            try {
                setDescargandoCotizacion(true)
               await descargarCotizacionAsync(cursoArmadoLocal.curso_armado_id)
            } finally {
                setDescargandoCotizacion(false)
            }

        }} className="btn bg-green-600 h-10 cursor-pointer">
            {descargandoCotizacion ? "Descargando cotización..." : "Descargar cotización"}
        </button>


        {cotizacionEnviadaCorrectamente ? <button
            className="btn bg-green-600 h-10 cursor-pointer">
            Cotización enviada correctamente.
        </button> : mandandoCotizacion ? <button
            className="btn bg-orange-600 h-10 cursor-pointer">
            Enviando cotización...
        </button> : <button id="emitir-cotizacion" onClick={async () => {
            if (mandandoCotizacion) { return }

            setMandandoCotizacion(true)

            try {
                await mandarCotizacionDeCurso(cursoArmadoLocal.curso_armado_id)
                console.log("Enviado correctamente")
                setCotizacionEnviadaCorrectamente(true)
            } finally {
                setMandandoCotizacion(false)
            }


        }} className="btn bg-blue-600 h-10 cursor-pointer">
            Mandar cotización
        </button>
        }

        <h2 className="text-4xl text-center mt-15">Inicio de curso</h2>
        <p id="estado-curso"
            className={`
                            font-semibold
                            ${cursoArmadoLocal.estado === 'ACTIVO'
                    ? 'text-green-400'
                    : cursoArmadoLocal.estado === 'INACTIVO'
                        ? 'text-red-400'
                        : 'text-fuchsia-400'
                } 
                        
                text-2xl
                text-center`}
        >
            {cursoArmadoLocal.estado}
        </p>
        <div className="border rounded p-2 flex flex-col justify-center items-center">

            <div className="p-10 grid grid-cols-2 gap-10">
                <label id="selector-fecha-inicio" className="flex flex-col gap-1">
                    <span className="text-cyan-400">Inicio</span>
                    <input
                        type="date"
                        value={cursoArmadoLocal.fecha_inicio ?? ''}
                        onChange={(e) => {
                            const valorActual = cursoArmadoLocal["fecha_inicio"]

                            const valorNormalizado = e.target.value

                            if (valorActual === valorNormalizado) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["fecha_inicio"]: valorNormalizado
                            }))

                            guardarParametro('fecha_inicio', e.target.value)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>

                <label id="selector-fecha-de-termino" className="flex flex-col gap-1">
                    <span className="text-cyan-400">Finalización</span>
                    <input
                        type="date"
                        value={cursoArmadoLocal.fecha_finalizacion ?? ''}
                        onChange={(e) => {
                            const valorActual = cursoArmadoLocal["fecha_finalizacion"]

                            const valorNormalizado = e.target.value

                            if (valorActual === valorNormalizado) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["fecha_finalizacion"]: valorNormalizado
                            }))
                            guardarParametro('fecha_finalizacion', e.target.value)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>

                <div id="selector-profesor" className="flex flex-col col-1 row-3">
                    <span className="text-cyan-400 text-center">Profesor</span>
                    <Example


                        seleccionado={cursoArmadoLocal.profesor?.nombre}
                        callbackOnSelect={(e) => {
                            const valorActual = cursoArmadoLocal["profesor"]

                            if (valorActual === e) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,
                                ["profesor"]: e
                            }))

                            if (e?.id) guardarParametro('profesor', e.id)
                        }}
                        opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                    />
                </div>

                <label id="nota-aprobatoria-1" className="flex flex-col gap-1 order-3 col-1 row-2">
                    <span className="text-cyan-200">Nota aprobatoria 1 (teorica)</span>
                    <input
                        type="number"
                        defaultValue={cursoArmadoLocal.teorica ?? ''}
                        onBlur={(e) => {
                            const v = parseFloat(e.target.value)

                            const valorActual = cursoArmadoLocal["teorica"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["teorica"]: v
                            }))

                            if (!isNaN(v)) guardarParametro('teorica', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>

                <label id="nota-aprobatoria-2" className="flex flex-col gap-1 order-6 col-2 row-2">
                    <span className="text-cyan-200">Nota aprobatoria 2 (practica)</span>
                    <input
                        type="number"
                        defaultValue={cursoArmadoLocal.calificacion_aprobatoria ?? ''}
                        onBlur={(e) => {
                            const v = parseFloat(e.target.value)

                            const valorActual = cursoArmadoLocal["calificacion_aprobatoria"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["calificacion_aprobatoria"]: v
                            }))

                            if (!isNaN(v)) guardarParametro('calificacion_aprobatoria', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>


                <label id="lugar_de_realizacion" className="flex flex-col gap-1 col-2 row-3">
                    <span className="text-cyan-200/80">Lugar de realizacion</span>
                    <input
                        type="text"
                        defaultValue={cursoArmadoLocal.lugar_de_realizacion ?? ''}
                        onBlur={(e) => {
                            const v = e.target.value

                            const valorActual = cursoArmadoLocal["lugar_de_realizacion"]

                            if (valorActual === v) return

                            setCursoArmadoLocal(prev => ({
                                ...prev,

                                ["lugar_de_realizacion"]: v
                            }))

                            if (v) guardarParametro('lugar_de_realizacion', v)
                        }}
                        className="border bg-transparent p-1 rounded"
                    />
                </label>
            </div>

            <div className="border rounded p-2 flex flex-col justify-center items-center mb-10">
                <div className="flex  items-center gap-2">
                    <h3
                        onClick={() => setUsuariosAbiertos(v => !v)}
                        className="cursor-pointer text-3xl font-medium mr-5 p-4 bg-cyan-800 border-2 rounded-2xl hover:bg-cyan-800"
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


                {mensajeInscripciones ? <p className="mt-5">{mensajeInscripciones}</p> : datosImportados ? (<div className="mt-6 border p-4 rounded flex flex-col gap-6 items-center">
                    <h2 className="text-center text-lg font-medium">
                        Relacionar columnas{" "}
                        <span className="opacity-70">
                            ({datosImportados.filas.length} fila(s))
                        </span>
                    </h2>

                    <h3 className="text-sm sm:text-3xl font-semibold text-center">
                        No se agregarán alumnos que ya estén inscritos o alumnos cuyo rut no pertenezca a un usuario.
                    </h3>

                    <div className="flex justify-center flex-row items-center  gap-4 w-full">
                        <div className="flex flex-col gap-1 items-center">
                            <span>RUT</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) =>
                                    setMapeo(last => ({ ...last, rut: opcion }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Asistencias</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) =>
                                    setMapeo(last => ({ ...last, asistencias: opcion }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Teórica</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) =>
                                    setMapeo(last => ({ ...last, teorica: opcion }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Práctica</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) =>
                                    setMapeo(last => ({ ...last, calificacion: opcion }))
                                }
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            construirResultado((fila, m) => ({
                                cursoArmado: cursoArmadoLocal.curso_armado_id,

                                rut: fila[m.rut]
                                    ? String(fila[m.rut]).trim()
                                    : undefined,

                                asistencias: Number(fila[m.asistencias])
                                    ? Number(fila[m.asistencias])
                                    : undefined,

                                calificacion: Number(fila[m.calificacion])
                                    ? Number(fila[m.calificacion])
                                    : undefined,

                                teorica: Number(fila[m.teorica])
                                    ? Number(fila[m.teorica])
                                    : undefined,
                            }));
                        }}
                        className="
                    bg-slate-700
                    hover:bg-slate-600
                    px-6
                    py-2
                    rounded
                    border
                    transition
                "
                    >
                        Crear inscripciones
                    </button>
                </div>) : <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) cargarArchivo(file);
                    }}
                    className="
                                    mx-10
                                    w-[70%]
                                    mt-5
                                    p-2
                                    bg-slate-700
                                    border
                                    rounded
                                    cursor-pointer
                                "
                />}

                {usuariosAbiertos && (
                    <div className="mt-3 overflow-x-auto w-[95%] py-3">
                        <div className="grid grid-cols-6 gap-2 text-center text-sm min-w-[500px]">
                            {['Eliminar', 'Nombre', 'Asistencias', 'Nota práctica', 'Nota teórica', 'Notificar'].map(h => (
                                <div key={h} className="bg-neutral-700 p-1 border">
                                    {h}
                                </div>
                            ))}

                            {cursoArmadoLocal.inscripciones.map(i => {

                                return <React.Fragment key={i.id_inscripcion} >
                                    <button
                                        onClick={() => {
                                            if (i?.id_inscripcion === undefined) { return }

                                            eliminarInscripcion(i.id_inscripcion)
                                        }}
                                        className="bg-red-500 hover:bg-red-600 transition text-white"
                                    >
                                        X
                                    </button>

                                    <div className="border p-1">{i.usuario?.nombre}</div>
                                    <input
                                        type="number"
                                        defaultValue={i.asistencias}
                                        onBlur={e => {
                                            if (i?.id_inscripcion === undefined) { return }

                                            actualizarInscripcion(i.id_inscripcion, 'asistencias', Number(e.target.value))
                                        }
                                        }
                                        className="border p-1"
                                    />

                                    <input
                                        type="number"
                                        defaultValue={i.calificacion}
                                        onBlur={e => {
                                            if (i?.id_inscripcion === undefined) { return }

                                            actualizarInscripcion(i.id_inscripcion, 'calificacion', Number(e.target.value))
                                        }}
                                        className="border p-1"
                                    />

                                    <input
                                        type="number"
                                        defaultValue={i.teorica}
                                        onBlur={e => {
                                            if (i?.id_inscripcion === undefined) { return }

                                            actualizarInscripcion(i.id_inscripcion, 'teorica', Number(e.target.value))
                                        }}
                                        className="border p-1"
                                    />

                                    <div className="flex justify-center items-center">
                                        <input
                                            className="size-10"
                                            type="checkbox"
                                            defaultChecked={i.notificar}
                                            onChange={e => {
                                                if (i?.id_inscripcion === undefined) { return }

                                                actualizarInscripcion(i.id_inscripcion, 'notificar', e.target.checked)
                                            }}
                                        />
                                    </div>



                                </React.Fragment>
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className={`grid grid-cols-1  gap-2 cursor-pointer mt-10`}>

            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "ACTIVO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "ACTIVO"
                }))

                guardarParametro('estado', 'ACTIVO')

            }} className="btn cursor-pointer h-10 bg-green-600">
                Iniciar
            </button>


            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "INACTIVO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "INACTIVO"
                }))


                guardarParametro('estado', 'INACTIVO')
            }

            } className="btn cursor-pointer h-10 bg-gray-500">
                Desactivar
            </button>

            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "FINALIZADO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "FINALIZADO"
                }))

                guardarParametro('estado', 'FINALIZADO')

            }} className="btn cursor-pointer h-10 bg-blue-500">
                Finalizar
            </button>

            {encuestasDeSatisfaccionEnvidasCorrectamente ? <button
                className="btn bg-green-600 h-10 cursor-pointer">
                Encuestas de satisfacción enviadas correctamente.
            </button> : enviandoEncuestasDeSatisfaccion ? <button
                className="btn bg-orange-600 h-10 cursor-pointer">
                Enviando encuestas de satisfacción...
            </button> : <button onClick={async () => {
                if (enviandoEncuestasDeSatisfaccion) {
                    return
                }

                setEnviandoEncuestasDeSatisfaccion(true)

                try {
                    await mandarEncuestasDeSatisfaccion(cursoArmadoLocal.curso_armado_id)
                    setEncuestasDeSatisfaccionEnvidasCorrectamente(true)

                } finally {
                    setEnviandoEncuestasDeSatisfaccion(false)
                }

            }} className="btn cursor-pointer h-10 bg-blue-900">
                Mandar encuestas de satisfacción
            </button>}


        </div>

        {

            <RegistrosDelCurso id_suscriptor={idSuscriptor} uuid_suscriptor={uuidSuscriptor} inscripciones={cursoArmadoLocal.inscripciones} respuestasCliente={respuestasCliente} cliente={cursoArmadoLocal.contactoDeCotizacion} />

        }

        {/* Acciones */}
        <div className={`grid grid-cols-1  gap-2 cursor-pointer mt-10`}>
            <button onClick={handleDelete} className="btn h-10 cursor-pointer  bg-red-500">
                Eliminar curso armado
            </button>
        </div>
    </div >
}