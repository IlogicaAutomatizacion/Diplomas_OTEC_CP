import { useEffect, useState } from "react"
import CreadorDeEncuesta, { type EncuestaFormato, type RespuestaEncuesta } from "../../Componentes/CreadorDeEncuesta"
import { eliminarFormatoEncuestaSatisfaccionClienteAsync, eliminarFormatoEncuestaSatisfaccionUsuarioAsync, obtenerFormatoEncuestaSatisfaccionClienteAsync, obtenerFormatoEncuestaSatisfaccionUsuarioAsync, subirFormatoEncuestaSatisfaccionClienteAsync, subirFormatoEncuestaSatisfaccionUsuarioAsync } from "../../Api/formatos-dinamicos"
import type { inscripcion } from "../../Api/inscripciones"
import type { usuario } from "../../Api/usuarios"
import type { curso } from "../../Api/cursos"

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
    const filas = inscripciones
        .filter(i => i.respuestas_encuestas?.[encuesta.id]?.length)
        .flatMap(i => (i.respuestas_encuestas?.[encuesta.id] ?? []).map(r => ({
            usuario: i.usuario?.nombre ?? i.uuid_inscripcion ?? 'Desconocido',
            respuestas: r.respuestas
        })))

    if (filas.length === 0) return <p className="text-sm opacity-60 mt-2">Sin respuestas aún.</p>

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
            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
            >
                <div className="p-2 border-r">Usuario</div>
                {preguntas.map(p => (
                    <div key={p.id} className="p-2 border-r last:border-r-0">{p.titulo}</div>
                ))}
            </div>

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

            {Object.keys(sumasPorPregunta).length > 0 && (
                <>
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

                    <div className="flex justify-end items-center gap-3 border-t mt-1 pt-2 pr-2 text-sm font-semibold">
                        <span className="opacity-60">Promedio de sumas:</span>
                        <span>
                            {(preguntas
                                .filter(p => sumasPorPregunta[p.id])
                                .map(p => sumasPorPregunta[p.id].suma)
                                .reduce((acc, suma) => acc + suma, 0) /
                                preguntas.filter(p => sumasPorPregunta[p.id]).length
                            ).toFixed(2)}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}

const TablaRespuestasEncuestaCliente = ({ usuario, encuesta, respuestas }: {
    encuesta: EncuestaFormato,
    usuario: usuario | null | undefined,
    respuestas: RespuestaEncuesta[] | null | undefined
}) => {
    if (!usuario) return <p className="text-sm opacity-60 mt-2">No hay un cliente seleccionado.</p>
    if (!respuestas) return <p className="text-sm opacity-60 mt-2">Sin respuestas aún.</p>

    const filas = [{
        usuario: usuario.nombre,
        respuestas: respuestas[0].respuestas
    }]

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
            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `1fr repeat(${preguntas.length}, 1fr)` }}
            >
                <div className="p-2 border-r">Usuario</div>
                {preguntas.map(p => (
                    <div key={p.id} className="p-2 border-r last:border-r-0">{p.titulo}</div>
                ))}
            </div>

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

            {Object.keys(sumasPorPregunta).length > 0 && (
                <>
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

                    <div className="flex justify-end items-center gap-3 border-t mt-1 pt-2 pr-2 text-sm font-semibold">
                        <span className="opacity-60">Promedio de sumas:</span>
                        <span>
                            {(preguntas
                                .filter(p => sumasPorPregunta[p.id])
                                .map(p => sumasPorPregunta[p.id].suma)
                                .reduce((acc, suma) => acc + suma, 0) /
                                preguntas.filter(p => sumasPorPregunta[p.id]).length
                            ).toFixed(2)}
                        </span>
                    </div>
                </>
            )}
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

    return (
        <div className="overflow-x-auto w-full mt-3">
            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border"
                style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
            >
                {['Estudiante', 'Asistencias', 'Nota teórica', 'Nota práctica'].map(c => (
                    <div key={c} className="p-2 border-r last:border-r-0">{c}</div>
                ))}
            </div>

            {filas.map((fila, idx) => (
                <div
                    key={idx}
                    className="grid text-center text-sm border-b"
                    style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
                >
                    <div className="p-2 border-r bg-neutral-800">{fila.nombre}</div>
                    <div className="p-2 border-r">{fila.asistencias ?? '-'}</div>
                    <div className="p-2 border-r">{fila.teorica ?? '-'}</div>
                    <div className="p-2">{fila.calificacion ?? '-'}</div>
                </div>
            ))}

            <div
                className="grid text-center text-sm font-semibold bg-neutral-700 border-t"
                style={{ gridTemplateColumns: `2fr repeat(3, 1fr)` }}
            >
                <div className="p-2 border-r">Suma</div>
                <div className="p-2 border-r">{suma.asistencias}</div>
                <div className="p-2 border-r">{suma.teorica}</div>
                <div className="p-2">{suma.calificacion}</div>
            </div>

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

// Este bloque agrupa solo vistas de lectura para no mezclar reportes con edición.
export default function ArmarCursoPanelRegistros({
    idSuscriptor,
    curso,
    uuidSuscriptor,
    inscripciones,
    respuestasCliente,
    cliente
}: {
    idSuscriptor: number,
    uuidSuscriptor: string,
    curso: curso | null | undefined
    inscripciones: inscripcion[],
    respuestasCliente: RespuestaEncuesta[] | null | undefined,
    cliente: usuario | null | undefined
}) {
    const [formatoSatifaccionUsuario, setFormatoSatisfaccionUsuario] = useState<EncuestaFormato | null>()
    const [formatoSatifaccionCliente, setFormatoSatisfaccionCliente] = useState<EncuestaFormato | null>()

    useEffect(() => {
        ; (async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionClienteAsync(uuidSuscriptor)
            setFormatoSatisfaccionCliente(encuesta)
        })()

            ; (async () => {
                const encuesta = await obtenerFormatoEncuestaSatisfaccionUsuarioAsync(uuidSuscriptor)
                setFormatoSatisfaccionUsuario(encuesta)
            })()
    }, [uuidSuscriptor])

    return (
        <>
            <h2 className="text-4xl text-center mt-15">Registros del curso</h2>

            <div className="border rounded p-2 flex flex-col justify-center items-center gap-y-10">
                <div className="flex justify-center items-center flex-col w-full">
                    <h3 className="text-2xl">Encuesta del estudiante</h3>

                    {!formatoSatifaccionUsuario ? (
                        <CreadorDeEncuesta
                            titulo="Encuesta de satisfacción de alumno"
                            descripcion={`${curso?.nombre ?? ""}`}
                            limite_respuestas={-1}
                            callbackParaEncuestaTerminada={async (encuesta) => {
                                await subirFormatoEncuestaSatisfaccionUsuarioAsync(idSuscriptor, encuesta)
                                setFormatoSatisfaccionUsuario(encuesta)
                            }}
                        />
                    ) : (
                        <>
                            <BotonEliminarConConfirmacion onConfirmar={async () => {
                                await eliminarFormatoEncuestaSatisfaccionUsuarioAsync(idSuscriptor)
                                setFormatoSatisfaccionUsuario(null)
                            }} />

                            <TablaRespuestasEncuestaInscripciones
                                encuesta={formatoSatifaccionUsuario}
                                inscripciones={inscripciones}
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-center items-center flex-col w-full">
                    <h3 className="text-2xl">Encuesta del cliente</h3>

                    {!formatoSatifaccionCliente ? (
                        <CreadorDeEncuesta
                            titulo="Encuesta de satisfacción del cliente"
                            descripcion={`${curso?.nombre ?? ""}`}
                            limite_respuestas={-1}
                            callbackParaEncuestaTerminada={async (encuesta) => {
                                await subirFormatoEncuestaSatisfaccionClienteAsync(idSuscriptor, encuesta)
                                setFormatoSatisfaccionCliente(encuesta)
                            }}
                        />
                    ) : (
                        <>
                            <BotonEliminarConConfirmacion onConfirmar={async () => {
                                await eliminarFormatoEncuestaSatisfaccionClienteAsync(idSuscriptor)
                                setFormatoSatisfaccionCliente(null)
                            }} />

                            <TablaRespuestasEncuestaCliente
                                usuario={cliente}
                                encuesta={formatoSatifaccionCliente}
                                respuestas={respuestasCliente}
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-center items-center flex-col w-full">
                    <h3 className="text-2xl">Asistencias de estudiantes</h3>
                    <TablaAsistenciasEstudiantes inscripciones={inscripciones} />
                </div>
            </div>
        </>
    )
}
