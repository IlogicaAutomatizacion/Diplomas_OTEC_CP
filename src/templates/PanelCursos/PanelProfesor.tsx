import { useEffect, useState } from "react"
import { obtenerCursosParaPanelProfesor, type PanelProfesor } from "../PanelAdministrador/Api/usuarios"
import { convertirFecha } from "./Panel"
import { actualizarPropiedadDeCursoArmadoComoProfesorAsync, checarSiPuedeFinalizar, type cursoArmado } from "../PanelAdministrador/Api/cursos-armados"
import { editarInscripcionComoProfesorAsync, type inscripcion } from "../PanelAdministrador/Api/inscripciones"
import { useUserRealtime } from "../../realtime"
import type { UserRealtimeEvent } from "../../socket"

// ─── Fila de alumno ───────────────────────────────────────────────────────────

type FilaAlumnoProps = {
    inscripcion: inscripcion
    deshabilitado: boolean
}

function FilaAlumno({ inscripcion, deshabilitado }: FilaAlumnoProps) {
    const [asistencias, setAsistencias] = useState(inscripcion.asistencias ?? 0)
    const [calificacion, setCalificacion] = useState(inscripcion.calificacion ?? 0)
    const [teorica, setTeorica] = useState(inscripcion.teorica ?? 0)  // 👈
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState<string | null>(null)

    useEffect(() => {
        setAsistencias(inscripcion.asistencias ?? 0)
        setCalificacion(inscripcion.calificacion ?? 0)
        setTeorica(inscripcion.teorica ?? 0)
    }, [inscripcion])

    const asistenciasOriginales = inscripcion.asistencias ?? 0
    const calificacionOriginal = inscripcion.calificacion ?? 0
    const teoricaOriginal = inscripcion.teorica ?? 0  // 👈

    const hayCambios =
        asistencias !== asistenciasOriginales ||
        calificacion !== calificacionOriginal ||
        teorica !== teoricaOriginal  // 👈

    async function guardar() {
        if (!inscripcion.id_inscripcion || !hayCambios || guardando) return
        setGuardando(true)
        setMensaje(null)

        try {
            await editarInscripcionComoProfesorAsync(inscripcion.id_inscripcion, {
                asistencias,
                calificacion,
                teorica,  // 👈
            })
            setMensaje('Guardado.')
        } catch (e) {
            setMensaje(e instanceof Error ? e.message : 'Error al guardar.')
            setAsistencias(asistenciasOriginales)
            setCalificacion(calificacionOriginal)
            setTeorica(teoricaOriginal)  // 👈
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="bg-black/30 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-sm font-medium text-white/80 text-center">
                {inscripcion.usuario?.nombre}
            </p>

            <div className="grid grid-cols-3 gap-2">  {/* 👈 3 columnas */}
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-white/50">Asistencias</span>
                    <input
                        type="number"
                        min={0}
                        disabled={deshabilitado}
                        value={asistencias}
                        onChange={(e) => setAsistencias(Math.max(0, Number(e.target.value) || 0))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs text-white/50">Cal. práctica</span>
                    <input
                        type="number"
                        min={0}
                        disabled={deshabilitado}
                        value={calificacion}
                        onChange={(e) => setCalificacion(Math.max(0, Number(e.target.value) || 0))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </label>

                <label className="flex flex-col gap-1">  {/* 👈 nuevo */}
                    <span className="text-xs text-white/50">Cal. teórica</span>
                    <input
                        type="number"
                        min={0}
                        disabled={deshabilitado}
                        value={teorica}
                        onChange={(e) => setTeorica(Math.max(0, Number(e.target.value) || 0))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </label>
            </div>

            <div className="flex items-center justify-between gap-2 min-h-6">
                {mensaje && (
                    <p className="text-xs opacity-70">{mensaje}</p>
                )}
                <button
                    type="button"
                    onClick={guardar}
                    disabled={!hayCambios || guardando || deshabilitado}
                    className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium
                        bg-blue-600 hover:bg-blue-500
                        disabled:bg-slate-700 disabled:text-white/30 disabled:cursor-not-allowed
                        transition-colors"
                >
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </div>
    )
}

// ─── Card de curso ────────────────────────────────────────────────────────────

const ProfesorCard = ({ curso }: { curso: cursoArmado }) => {
    const [cursoLocal, setCursoLocal] = useState(curso)
    const [puedeFinalizar, setPuedeFinalizar] = useState(false)

    useEffect(() => {
        setCursoLocal(curso)
    }, [curso])

    useEffect(() => {
        ; (async () => {
            try {
                const result = await checarSiPuedeFinalizar(curso.curso_armado_id)
                setPuedeFinalizar(result)
            } catch { }
        })()
    }, [curso.curso_armado_id])

    async function handleBotonAsistencias(activar: boolean) {
        try {
            const actualizado: cursoArmado = await actualizarPropiedadDeCursoArmadoComoProfesorAsync(
                cursoLocal.curso_armado_id, 'en_clase', activar
            )
            setCursoLocal(actualizado)
        } catch (e) {
            console.error(e)
        }
    }

    async function handlerFinalizar() {
        try {
            const actualizado: cursoArmado = await actualizarPropiedadDeCursoArmadoComoProfesorAsync(
                cursoLocal.curso_armado_id, 'estado', 'FINALIZADO'
            )
            setCursoLocal(actualizado)
        } catch (e) {
            console.error(e)
        }
    }

    const cursoActivo = cursoLocal.estado === 'ACTIVO'

    return (
        <div className="bg-[#1c1f21] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">

            <h2 className="text-xl font-semibold text-center">
                {cursoLocal.curso?.nombre}
            </h2>

            <div className="flex justify-center flex-wrap gap-2">
                <span className={`px-3 py-1 text-sm rounded-full ${cursoLocal.en_clase
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-500/20 text-slate-400'}`}>
                    {cursoLocal.en_clase ? 'EN CLASE' : 'SIN CLASE ACTIVA'}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${cursoLocal.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-400' :
                        cursoLocal.estado === 'INACTIVO' ? 'bg-slate-500/20 text-slate-400' :
                            'bg-blue-500/20 text-blue-400'}`}>
                    {cursoLocal.estado}
                </span>
            </div>

            <div className="text-sm bg-black/20 rounded-xl p-3 space-y-1">
                <p><span className="text-white/60">Duración:</span>{' '}
                    <span className="text-green-400">{cursoLocal.curso?.duracion} hrs</span></p>
                <p><span className="text-white/60">Inicio:</span>{' '}
                    <span className="text-green-400">{convertirFecha(cursoLocal.fecha_inicio)}</span></p>
                <p><span className="text-white/60">Finaliza:</span>{' '}
                    <span className="text-green-400">{convertirFecha(cursoLocal.fecha_finalizacion)}</span></p>
            </div>

            {/* Alumnos */}
            <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-3 max-h-96 overflow-y-auto">
                <h3 className="text-blue-400 font-semibold text-center">Alumnos</h3>

                {cursoLocal.inscripciones?.length ? (
                    cursoLocal.inscripciones.map(insc => (
                        insc?.usuario && (
                            <FilaAlumno
                                key={insc.id_inscripcion}
                                inscripcion={insc}
                                deshabilitado={!cursoActivo}
                            />
                        )
                    ))
                ) : (
                    <p className="text-sm text-white/40 text-center">Sin alumnos inscritos.</p>
                )}
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => cursoActivo && handleBotonAsistencias(!cursoLocal.en_clase)}
                    className={`w-full py-3 rounded-xl font-medium transition-colors
                        ${!cursoActivo
                            ? 'bg-slate-500/40 text-slate-400/90 cursor-not-allowed'
                            : cursoLocal.en_clase
                                ? 'bg-red-500/40 text-red-400 hover:bg-red-500/60 cursor-pointer'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer'
                        }`}
                >
                    {!cursoActivo
                        ? cursoLocal.estado === 'FINALIZADO' ? 'Curso finalizado' : 'Curso inactivo'
                        : cursoLocal.en_clase ? 'Terminar clase' : 'Iniciar nueva clase'}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        if (cursoActivo && !cursoLocal.en_clase && puedeFinalizar) {
                            handlerFinalizar()
                        }
                    }}
                    className={`w-full py-3 rounded-xl font-medium transition-colors
                        ${cursoActivo && !cursoLocal.en_clase && puedeFinalizar
                            ? 'bg-red-500/40 text-red-400 hover:bg-red-500/60 cursor-pointer'
                            : 'bg-slate-500/40 text-slate-400/90 cursor-not-allowed'
                        }`}
                >
                    Finalizar curso
                </button>
            </div>
        </div>
    )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function PanelProfesor() {
    const [panel, setPanel] = useState<PanelProfesor | null>(null)
    const [mensaje, setMensaje] = useState<string | null>('Cargando...')

    async function cargarPanel() {
        try {
            const data = await obtenerCursosParaPanelProfesor()
            setPanel(data)
            setMensaje(null)
        } catch (er: any) {
            setMensaje(er?.message ?? 'Error al obtener los cursos.')
        }
    }

    useEffect(() => {
        void cargarPanel()
    }, [])

    useUserRealtime((event: UserRealtimeEvent) => {
        if (event.resource !== 'panelProfesor') return
        void cargarPanel()
    })

    return (
        <div>
            {mensaje ? (
                <p className="text-white/60 text-xl">{mensaje}</p>
            ) : panel ? (
                <>
                    <div className="text-center mb-10">
                        <p className="text-xl text-white/60">Profesor</p>
                        <h1 className="text-4xl font-bold">{panel.nombre}</h1>
                        <h2 className="text-2xl mt-3 text-blue-400">Mis cursos</h2>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {panel.cursosArmados?.map(curso => (
                            <ProfesorCard key={curso.curso_armado_id} curso={curso} />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    )
}
