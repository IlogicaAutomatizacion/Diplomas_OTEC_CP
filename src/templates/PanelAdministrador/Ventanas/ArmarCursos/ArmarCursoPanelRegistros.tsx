import { useEffect, useState } from "react"
import CreadorDeEncuesta, { type EncuestaFormato, type RespuestaEncuesta } from "../../Componentes/CreadorDeEncuesta"
import {
    eliminarFormatoEncuestaSatisfaccionClienteAsync,
    eliminarFormatoEncuestaSatisfaccionUsuarioAsync,
    obtenerFormatoEncuestaSatisfaccionClienteAsync,
    obtenerFormatoEncuestaSatisfaccionUsuarioAsync,
    subirFormatoEncuestaSatisfaccionClienteAsync,
    subirFormatoEncuestaSatisfaccionUsuarioAsync
} from "../../Api/formatos-dinamicos"
import type { inscripcion } from "../../Api/inscripciones"
import type { usuario } from "../../Api/usuarios"
import type { curso } from "../../Api/cursos"

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl font-bold tracking-tight text-white text-center mt-16 mb-1">
        {children}
    </h2>
)

const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-white">
        {children}
    </h3>
)

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl w-full ${className}`}>
        {children}
    </div>
)

const EmptyState = ({ message }: { message: string }) => (
    <p className="text-sm text-zinc-500 italic mt-3 text-center py-4">{message}</p>
)

// ─── Tabla genérica de respuestas ─────────────────────────────────────────────

function TablaEncuesta({
    preguntas,
    filas,
    sumasPorPregunta
}: {
    preguntas: EncuestaFormato['preguntas'],
    filas: { usuario: string | undefined, respuestas: { pregunta_id: string, valor: unknown }[] }[],
    sumasPorPregunta: Record<string, { suma: number, count: number }>
}) {
    const haySumas = Object.keys(sumasPorPregunta).length > 0
    const promedioGeneral = haySumas
        ? (
            preguntas
                .filter(p => sumasPorPregunta[p.id])
                .map(p => sumasPorPregunta[p.id].suma)
                .reduce((acc, s) => acc + s, 0) /
            preguntas.filter(p => sumasPorPregunta[p.id]).length
        ).toFixed(2)
        : null

    return (
        <div className="overflow-x-auto w-full mt-4 rounded-xl border border-zinc-700">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-zinc-800 border-b border-zinc-700">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                            Usuario
                        </th>
                        {preguntas.map(p => (
                            <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                                {p.titulo}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {filas.map((fila, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-2.5 text-zinc-200 font-medium whitespace-nowrap">
                                {fila.usuario ?? 'Desconocido'}
                            </td>
                            {preguntas.map(p => {
                                const respuesta = fila.respuestas.find(r => r.pregunta_id === p.id)
                                const valor = respuesta?.valor
                                return (
                                    <td key={p.id} className="px-4 py-2.5 text-center text-zinc-300">
                                        {Array.isArray(valor) ? valor.join(', ') : (valor as string | number | null | undefined) ?? '-'}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
                {haySumas && (
                    <tfoot>
                        <tr className="bg-zinc-800/80 border-t border-zinc-600">
                            <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Suma
                            </td>
                            {preguntas.map(p => (
                                <td key={p.id} className="px-4 py-2.5 text-center text-zinc-300 font-semibold">
                                    {sumasPorPregunta[p.id]?.suma ?? '-'}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>

            {promedioGeneral && (
                <div className="flex justify-end items-center gap-2 px-4 py-2.5 bg-zinc-800/40 border-t border-zinc-700 rounded-b-xl">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Promedio de sumas</span>
                    <span className="text-sm font-bold text-sky-400 bg-sky-950 border border-sky-800 px-3 py-0.5 rounded-full">
                        {promedioGeneral}
                    </span>
                </div>
            )}
        </div>
    )
}

// ─── BotonEliminarConConfirmacion ─────────────────────────────────────────────

const BotonEliminarConConfirmacion = ({
    onConfirmar,
    label = "Eliminar formato de encuesta"
}: {
    onConfirmar: () => Promise<void>,
    label?: string
}) => {
    const [confirmando, setConfirmando] = useState(false)

    if (confirmando) return (
        <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 rounded-xl px-4 py-2.5">
            <span className="text-sm text-red-300">¿Estás seguro?</span>
            <button
                onClick={async () => {
                    await onConfirmar()
                    setConfirmando(false)
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
                Sí, eliminar
            </button>
            <button
                onClick={() => setConfirmando(false)}
                className="px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
                Cancelar
            </button>
        </div>
    )

    return (
        <button
            onClick={() => setConfirmando(true)}
            className="px-4 py-1.5 bg-zinc-700 hover:bg-red-700 text-zinc-300 hover:text-white text-sm font-semibold rounded-lg border border-zinc-600 hover:border-red-600 transition cursor-pointer"
        >
            {label}
        </button>
    )
}

// ─── TablaRespuestasEncuestaInscripciones ─────────────────────────────────────

const TablaRespuestasEncuestaInscripciones = ({
    encuesta,
    inscripciones
}: {
    encuesta: EncuestaFormato,
    inscripciones: inscripcion[]
}) => {
    const filas = inscripciones
        .filter(i => i.respuestas_encuestas?.[encuesta.id]?.length)
        .flatMap(i => (i.respuestas_encuestas?.[encuesta.id] ?? []).map(r => ({
            usuario: i.usuario?.nombre ?? i.uuid_inscripcion ?? 'Desconocido' as string,
            respuestas: r.respuestas
        })))

    if (filas.length === 0) return <EmptyState message="Sin respuestas aún." />

    const sumasPorPregunta: Record<string, { suma: number, count: number }> = {}
    filas.forEach(fila => {
        fila.respuestas.forEach(r => {
            const num = Number(r.valor)
            if (!isNaN(num)) {
                if (!sumasPorPregunta[r.pregunta_id]) sumasPorPregunta[r.pregunta_id] = { suma: 0, count: 0 }
                sumasPorPregunta[r.pregunta_id].suma += num
                sumasPorPregunta[r.pregunta_id].count += 1
            }
        })
    })

    return <TablaEncuesta preguntas={encuesta.preguntas} filas={filas} sumasPorPregunta={sumasPorPregunta} />
}

// ─── TablaRespuestasEncuestaCliente ──────────────────────────────────────────

const TablaRespuestasEncuestaCliente = ({
    usuario,
    encuesta,
    respuestas
}: {
    encuesta: EncuestaFormato,
    usuario: usuario | null | undefined,
    respuestas: RespuestaEncuesta[] | null | undefined
}) => {
    if (!usuario) return <EmptyState message="No hay un cliente seleccionado." />
    if (!respuestas) return <EmptyState message="Sin respuestas aún." />

    const filas = [{
        usuario: usuario.nombre,
        respuestas: respuestas[0].respuestas
    }]

    const sumasPorPregunta: Record<string, { suma: number, count: number }> = {}
    filas.forEach(fila => {
        fila.respuestas.forEach(r => {
            const num = Number(r.valor)
            if (!isNaN(num)) {
                if (!sumasPorPregunta[r.pregunta_id]) sumasPorPregunta[r.pregunta_id] = { suma: 0, count: 0 }
                sumasPorPregunta[r.pregunta_id].suma += num
                sumasPorPregunta[r.pregunta_id].count += 1
            }
        })
    })

    return <TablaEncuesta preguntas={encuesta.preguntas} filas={filas} sumasPorPregunta={sumasPorPregunta} />
}

// ─── TablaAsistenciasEstudiantes ──────────────────────────────────────────────

const TablaAsistenciasEstudiantes = ({ inscripciones }: { inscripciones: inscripcion[] }) => {
    if (!inscripciones.length) return <EmptyState message="Sin estudiantes inscritos." />

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

    const cols = ['Estudiante', 'Asistencias', 'Nota teórica', 'Nota práctica'] as const

    return (
        <div className="overflow-x-auto w-full mt-4 rounded-xl border border-zinc-700">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-zinc-800 border-b border-zinc-700">
                        {cols.map(c => (
                            <th key={c} className="px-4 py-3 text-left first:text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {filas.map((fila, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-2.5 text-zinc-200 font-medium whitespace-nowrap">{fila.nombre}</td>
                            <td className="px-4 py-2.5 text-center text-zinc-300">{fila.asistencias ?? '-'}</td>
                            <td className="px-4 py-2.5 text-center text-zinc-300">{fila.teorica ?? '-'}</td>
                            <td className="px-4 py-2.5 text-center text-zinc-300">{fila.calificacion ?? '-'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-zinc-800/80 border-t border-zinc-600">
                        <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">Suma</td>
                        <td className="px-4 py-2.5 text-center text-zinc-300 font-semibold">{suma.asistencias}</td>
                        <td className="px-4 py-2.5 text-center text-zinc-300 font-semibold">{suma.teorica}</td>
                        <td className="px-4 py-2.5 text-center text-zinc-300 font-semibold">{suma.calificacion}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="flex flex-wrap justify-end items-center gap-x-5 gap-y-1 px-4 py-2.5 bg-zinc-800/40 border-t border-zinc-700 rounded-b-xl">
                {[
                    { label: 'Promedio asistencias', value: promedio.asistencias },
                    { label: 'Promedio teórica', value: promedio.teorica },
                    { label: 'Promedio práctica', value: promedio.calificacion },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</span>
                        <span className="text-sm font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-0.5 rounded-full">
                            {value.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

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
    curso: curso | null | undefined,
    inscripciones: inscripcion[],
    respuestasCliente: RespuestaEncuesta[] | null | undefined,
    cliente: usuario | null | undefined
}) {
    const [formatoSatisfaccionUsuario, setFormatoSatisfaccionUsuario] = useState<EncuestaFormato | null>()
    const [formatoSatisfaccionCliente, setFormatoSatisfaccionCliente] = useState<EncuestaFormato | null>()

    useEffect(() => {
        ;(async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionClienteAsync(uuidSuscriptor)
            setFormatoSatisfaccionCliente(encuesta)
        })()
        ;(async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionUsuarioAsync(uuidSuscriptor)
            setFormatoSatisfaccionUsuario(encuesta)
        })()
    }, [uuidSuscriptor])

    return (
        <section className="flex flex-col gap-6">
            <SectionTitle>Registros del curso</SectionTitle>

            {/* Encuesta del estudiante */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <SubTitle>Encuesta del estudiante</SubTitle>
                    {formatoSatisfaccionUsuario && (
                        <BotonEliminarConConfirmacion
                            label="Eliminar formato"
                            onConfirmar={async () => {
                                await eliminarFormatoEncuestaSatisfaccionUsuarioAsync(idSuscriptor)
                                setFormatoSatisfaccionUsuario(null)
                            }}
                        />
                    )}
                </div>

                {!formatoSatisfaccionUsuario ? (
                    <CreadorDeEncuesta
                        titulo="Encuesta de satisfacción de alumno"
                        descripcion={curso?.nombre ?? ""}
                        limite_respuestas={-1}
                        callbackParaEncuestaTerminada={async (encuesta) => {
                            await subirFormatoEncuestaSatisfaccionUsuarioAsync(idSuscriptor, encuesta)
                            setFormatoSatisfaccionUsuario(encuesta)
                        }}
                    />
                ) : (
                    <TablaRespuestasEncuestaInscripciones
                        encuesta={formatoSatisfaccionUsuario}
                        inscripciones={inscripciones}
                    />
                )}
            </Card>

            {/* Encuesta del cliente */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <SubTitle>Encuesta del cliente</SubTitle>
                    {formatoSatisfaccionCliente && (
                        <BotonEliminarConConfirmacion
                            label="Eliminar formato"
                            onConfirmar={async () => {
                                await eliminarFormatoEncuestaSatisfaccionClienteAsync(idSuscriptor)
                                setFormatoSatisfaccionCliente(null)
                            }}
                        />
                    )}
                </div>

                {!formatoSatisfaccionCliente ? (
                    <CreadorDeEncuesta
                        titulo="Encuesta de satisfacción del cliente"
                        descripcion={curso?.nombre ?? ""}
                        limite_respuestas={-1}
                        callbackParaEncuestaTerminada={async (encuesta) => {
                            await subirFormatoEncuestaSatisfaccionClienteAsync(idSuscriptor, encuesta)
                            setFormatoSatisfaccionCliente(encuesta)
                        }}
                    />
                ) : (
                    <TablaRespuestasEncuestaCliente
                        usuario={cliente}
                        encuesta={formatoSatisfaccionCliente}
                        respuestas={respuestasCliente}
                    />
                )}
            </Card>

            {/* Asistencias */}
            <Card>
                <SubTitle>Estudiantes</SubTitle>
                <TablaAsistenciasEstudiantes inscripciones={inscripciones} />
            </Card>
        </section>
    )
}