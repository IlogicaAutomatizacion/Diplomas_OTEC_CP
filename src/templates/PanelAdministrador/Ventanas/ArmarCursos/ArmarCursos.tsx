import React, { useContext, useEffect, useState } from "react"
import type { usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import type { curso } from "../../Api/cursos"
import { borrarCursosArmadosAsyncBulk, type cursoArmado } from "../../Api/cursos-armados"
import { crearCursoArmadoDeSuscriptorAsync, obtenerCursosArmadosDeSuscriptorAsync } from "../../Api/suscripciones"
import { ErrorContext } from "../../../../Error/ErrorContext"
import CursoArmadoCard from "./ArmarCursoCard"
import ArmarCursoPanel from "./ArmarCursoPanel"

import { useSusbcriptonStore } from "../../Stores/SubscriptionContextStore"

// ─── Tipos de ordenamiento ────────────────────────────────────────────────────

type OrdenCursoArmado =
    | 'fecha_inicio_asc' | 'fecha_inicio_desc'
    | 'fecha_fin_asc' | 'fecha_fin_desc'
    | 'nombre_asc' | 'nombre_desc'
    | 'alumnos_desc' | 'alumnos_asc'
    | 'estado_asc' | 'estado_desc'
    | 'id_asc' | 'id_desc'
    | 'cotizado_asc' | 'cotizado_desc'

const OPCIONES_ORDEN: { label: string; value: OrdenCursoArmado }[] = [
    { label: 'ID menor→mayor', value: 'id_asc' },
    { label: 'ID mayor→menor', value: 'id_desc' },
    { label: 'Inicio más reciente', value: 'fecha_inicio_desc' },
    { label: 'Inicio más antiguo', value: 'fecha_inicio_asc' },
    { label: 'Fin más reciente', value: 'fecha_fin_desc' },
    { label: 'Fin más antiguo', value: 'fecha_fin_asc' },
    { label: 'Nombre A→Z', value: 'nombre_asc' },
    { label: 'Nombre Z→A', value: 'nombre_desc' },
    { label: 'Más alumnos', value: 'alumnos_desc' },
    { label: 'Menos alumnos', value: 'alumnos_asc' },
    { label: 'Estado A→Z', value: 'estado_asc' },
    { label: 'Estado Z→A', value: 'estado_desc' },
    { label: 'Cotizados primero', value: 'cotizado_desc' },
    { label: 'No cotizados primero', value: 'cotizado_asc' },
]

// ─── Helpers de ordenamiento ──────────────────────────────────────────────────

const ESTADO_ORDEN: Record<string, number> = { ACTIVO: 0, INACTIVO: 1, FINALIZADO: 2 }

function ordenarCursosArmados(lista: cursoArmado[], orden: OrdenCursoArmado): cursoArmado[] {

    return [...lista].sort((a, b) => {
        switch (orden) {
            case 'id_asc': return (a.indice_suscriptor ?? 0) - (b.indice_suscriptor ?? 0)
            case 'id_desc': return (b.indice_suscriptor ?? 0) - (a.indice_suscriptor ?? 0)
            case 'fecha_inicio_asc': return (a.fecha_inicio ?? '').localeCompare(b.fecha_inicio ?? '')
            case 'fecha_inicio_desc': return (b.fecha_inicio ?? '').localeCompare(a.fecha_inicio ?? '')
            case 'fecha_fin_asc': return (a.fecha_finalizacion ?? '').localeCompare(b.fecha_finalizacion ?? '')
            case 'fecha_fin_desc': return (b.fecha_finalizacion ?? '').localeCompare(a.fecha_finalizacion ?? '')
            case 'nombre_asc': return (a.curso?.nombre ?? '').localeCompare(b.curso?.nombre ?? '', 'es', { sensitivity: 'base' })
            case 'nombre_desc': return (b.curso?.nombre ?? '').localeCompare(a.curso?.nombre ?? '', 'es', { sensitivity: 'base' })
            case 'alumnos_desc': return (b.inscripciones.length?? 0) - (a.inscripciones.length ?? 0)
            case 'alumnos_asc': return (a.inscripciones.length ?? 0) - (b.inscripciones.length ?? 0)
            case 'estado_asc': return (ESTADO_ORDEN[a.estado ?? ''] ?? 99) - (ESTADO_ORDEN[b.estado ?? ''] ?? 99)
            case 'estado_desc': return (ESTADO_ORDEN[b.estado ?? ''] ?? 99) - (ESTADO_ORDEN[a.estado ?? ''] ?? 99)
            case 'cotizado_desc': return (b.cotizado ? 1 : 0) - (a.cotizado ? 1 : 0)
            case 'cotizado_asc': return (a.cotizado ? 1 : 0) - (b.cotizado ? 1 : 0)
        }
    })
}

// ─── Íconos ───────────────────────────────────────────────────────────────────

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)
const IconSort = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" />
    </svg>
)
const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)
const IconCheck = () => (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 6 5 9 10 3" />
    </svg>
)

// ─── SortSelect ───────────────────────────────────────────────────────────────

function SortSelect<T extends string>({
    value, onChange, opciones,
}: {
    value: T
    onChange: (v: T) => void
    opciones: { label: string; value: T }[]
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 shrink-0"><IconSort /></span>
            <select
                value={value}
                onChange={e => onChange(e.target.value as T)}
                className="text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 cursor-pointer hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition appearance-none pr-6"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
            >
                {opciones.map(o => (
                    <option key={o.value} value={o.value} className="bg-zinc-800 text-zinc-200">{o.label}</option>
                ))}
            </select>
        </div>
    )
}

// ─── CursoArmadoCard con soporte de selección ─────────────────────────────────
// NOTA: Este wrapper envuelve tu CursoArmadoCard existente añadiendo el checkbox
// y el borde de selección, sin necesidad de modificar CursoArmadoCard.

const CursoArmadoCardSeleccionable = ({
    cursoArmado,
    setCursoArmadoAVisualizar,
    modoSeleccion,
    seleccionado,
    onToggleSeleccion,
}: {
    cursoArmado: cursoArmado
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>
    modoSeleccion: boolean
    seleccionado: boolean
    onToggleSeleccion: (id: number) => void
}) => {
    return (
        <div
            onClick={modoSeleccion && cursoArmado.curso_armado_id ? () => onToggleSeleccion(cursoArmado.curso_armado_id!) : undefined}
            className={`relative rounded-xl transition-all duration-200
                ${modoSeleccion ? 'cursor-pointer' : ''}`}
        >
            {/* Overlay de selección — borde y checkbox encima de la card existente */}
            {modoSeleccion && (
                <div className={`absolute inset-0 rounded-xl z-10 pointer-events-none border-2 transition-all duration-150
                    ${seleccionado
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-900/20'
                        : 'border-zinc-700'
                    }`}
                />
            )}

            {/* Checkbox flotante */}
            {modoSeleccion && (
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150
                        ${seleccionado ? 'bg-amber-500 border-amber-500' : 'border-zinc-400 bg-zinc-900'}`}
                    >
                        {seleccionado && <IconCheck />}
                    </span>
                </div>
            )}

            {/* Card original — deshabilitada en modo selección para evitar navegación */}
            <div className={modoSeleccion ? 'pointer-events-none select-none' : ''}>
                <CursoArmadoCard
                    cursoArmado={cursoArmado}
                    setCursoArmadoAVisualizar={setCursoArmadoAVisualizar}
                />
            </div>
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default ({
    usuarios, empresas, cursos,
    idSuscriptor, cursosArmados, uuidSuscriptor, setCursosArmados,
}: {
    usuarios: usuario[]
    empresas: empresa[]
    cursos: curso[]
    uuidSuscriptor: string
    idSuscriptor: number
    cursosArmados: cursoArmado[]
    setCursosArmados: React.Dispatch<React.SetStateAction<cursoArmado[]>>
}) => {
    const [mensajeBoton, setMensajeBoton] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState<OrdenCursoArmado>('id_desc')
    const [cursoArmadoAVisualizar, setCursoArmadoAVisualizar] = useState<cursoArmado | null>(null)
    const { setError } = useContext(ErrorContext)!
    const currentSusbscription = useSusbcriptonStore((x) => x.currentSusbscription)

    // ── Estado de selección bulk ──────────────────────────────────────────────
    const [modoSeleccion, setModoSeleccion] = useState(false)
    const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())
    const [confirmBulk, setConfirmBulk] = useState(false)
    const [eliminandoBulk, setEliminandoBulk] = useState(false)

    const activarModoSeleccion = () => {
        setModoSeleccion(true)
        setSeleccionados(new Set())
        setConfirmBulk(false)
    }

    const cancelarModoSeleccion = () => {
        setModoSeleccion(false)
        setSeleccionados(new Set())
        setConfirmBulk(false)
    }

    const toggleSeleccion = (id: number) => {
        setSeleccionados(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const handleEliminarBulk = async () => {
        if (seleccionados.size === 0) return
        setEliminandoBulk(true)
        try {
            await borrarCursosArmadosAsyncBulk([...seleccionados]) // ← tu función de API
            setCursosArmados(prev => prev.filter(ca => !seleccionados.has(ca.curso_armado_id!)))
            cancelarModoSeleccion()
        } catch (e) {
            console.log(e)
        } finally {
            setEliminandoBulk(false)
        }
    }

    // ── Carga de datos ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentSusbscription) { return }

        ; (async () => {
            try {
                const data = await obtenerCursosArmadosDeSuscriptorAsync(idSuscriptor)
                setCursosArmados(data)
            } catch { }
        })()
    }, [empresas, cursos, usuarios, currentSusbscription])

    useEffect(() => { setMensajeBoton(null) }, [cursosArmados])

    useEffect(() => {
        if (!cursoArmadoAVisualizar?.curso_armado_id) return

        const actualizado = cursosArmados.find(
            curso => curso.curso_armado_id === cursoArmadoAVisualizar.curso_armado_id
        )

        if (!actualizado) {
            setCursoArmadoAVisualizar(null)
            return
        }

        if (actualizado !== cursoArmadoAVisualizar) {
            setCursoArmadoAVisualizar(actualizado)
        }
    }, [cursoArmadoAVisualizar, cursosArmados])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando…')
            const nuevo = await crearCursoArmadoDeSuscriptorAsync(idSuscriptor)
            setCursosArmados(last => [...last, nuevo])
        } catch (e: any) {
            setError(e?.message ?? 'Hubo un problema al crear el curso armado.')
            setMensajeBoton('Error al crear.')
            setTimeout(() => setMensajeBoton(null), 2000)
        }
    }

    // ── Filtrado y ordenamiento ───────────────────────────────────────────────
    const q = busqueda.toLowerCase().trim()
    const cursosFiltrados = cursosArmados.filter(ca =>
        !q ||
        String(ca.indice_suscriptor ?? '').includes(q) ||
        ca.curso?.nombre?.toLowerCase().includes(q) ||
        ca.empresa?.nombre?.toLowerCase().includes(q)
    )

    const cursosOrdenados = ordenarCursosArmados(cursosFiltrados, orden)

    // ── Panel de detalle ──────────────────────────────────────────────────────
    if (cursoArmadoAVisualizar) {
        return (
            <ArmarCursoPanel
                uuidSuscriptor={uuidSuscriptor}
                setCursoArmadoAVisualizar={setCursoArmadoAVisualizar}
                idSuscriptor={idSuscriptor}
                cursoArmado={cursoArmadoAVisualizar}
                cursos={cursos}
                empresas={empresas}
                setCursosArmadosState={setCursosArmados}
                usuarios={usuarios}
            />
        )
    }

    // ── Vista de lista ────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Gestionar cursos</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {cursosOrdenados.length} de {cursosArmados.length} cursos
                        {modoSeleccion && seleccionados.size > 0 && (
                            <span className="ml-2 text-amber-400 font-semibold">· {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!modoSeleccion && (
                        <SortSelect value={orden} onChange={setOrden} opciones={OPCIONES_ORDEN} />
                    )}

                    {modoSeleccion ? (
                        /* ── Controles del modo selección ── */
                        <>
                            {seleccionados.size > 0 && !confirmBulk && (
                                <button
                                    onClick={() => setConfirmBulk(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-red-900/30"
                                >
                                    <IconTrash />
                                    Eliminar ({seleccionados.size})
                                </button>
                            )}

                            {confirmBulk && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-red-800">
                                    <span className="text-xs text-zinc-300">¿Eliminar {seleccionados.size} curso{seleccionados.size !== 1 ? 's' : ''}?</span>
                                    <button
                                        onClick={handleEliminarBulk}
                                        disabled={eliminandoBulk}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all disabled:opacity-60"
                                    >
                                        {eliminandoBulk ? 'Eliminando…' : 'Sí, eliminar'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmBulk(false)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={cancelarModoSeleccion}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 border border-zinc-600 hover:border-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                                Cancelar selección
                            </button>
                        </>
                    ) : (
                        /* ── Controles normales ── */
                        <>
                            <button
                                onClick={activarModoSeleccion}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
                            >
                                Seleccionar
                            </button>
                            <button
                                onClick={handleAddButton}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
                            >
                                <IconPlus />
                                {mensajeBoton ?? 'Nuevo curso'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Buscador */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"><IconSearch /></span>
                <input
                    type="text"
                    placeholder="Buscar por ID, nombre de curso o empresa…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs transition cursor-pointer">✕</button>
                )}
            </div>

            {/* Grid de cards */}
            {cursosOrdenados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">🎓</span>
                    <p className="text-zinc-400 font-medium">{busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay cursos armados'}</p>
                    <p className="text-zinc-600 text-sm mt-1">{busqueda ? 'Intenta con otro término' : 'Crea el primero con el botón de arriba'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cursosOrdenados.map(ca => (
                        <CursoArmadoCardSeleccionable
                            key={ca.curso_armado_id}
                            cursoArmado={ca}
                            setCursoArmadoAVisualizar={setCursoArmadoAVisualizar}
                            modoSeleccion={modoSeleccion}
                            seleccionado={seleccionados.has(ca.curso_armado_id!)}
                            onToggleSeleccion={toggleSeleccion}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
