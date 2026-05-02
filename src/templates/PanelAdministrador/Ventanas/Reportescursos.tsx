import { useMemo, useState } from "react"
import type { cursoArmado } from "../Api/cursos-armados"
import type { usuario } from "../Api/usuarios"
import type { curso } from "../Api/cursos"
import type { empresa } from "../Api/empresas"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Estado = NonNullable<cursoArmado['estado']>
type OrdenFecha = 'asc' | 'desc'

type Filtros = {
    fechaInicio: string
    fechaInicioOrden: OrdenFecha
    fechaFinalizacion: string
    fechaFinalizacionOrden: OrdenFecha
    estado: Estado | ''
    cotizado: 'cotizado' | 'no_cotizado' | ''
    usuarioId: number | ''
    cursoId: number | ''
    empresaId: number | ''
}

const FILTROS_INICIALES: Filtros = {
    fechaInicio: '',
    fechaInicioOrden: 'asc',
    fechaFinalizacion: '',
    fechaFinalizacionOrden: 'asc',
    estado: '',
    cotizado: '',
    usuarioId: '',
    cursoId: '',
    empresaId: '',
}

const ESTADO_CONFIG: Record<Estado, { label: string; color: string; dot: string }> = {
    ACTIVO: { label: 'Activo', color: 'text-emerald-400 bg-emerald-950 border-emerald-700', dot: 'bg-emerald-400' },
    INACTIVO: { label: 'Inactivo', color: 'text-red-400 bg-red-950 border-red-700', dot: 'bg-red-400' },
    FINALIZADO: { label: 'Finalizado', color: 'text-fuchsia-400 bg-fuchsia-950 border-fuchsia-700', dot: 'bg-fuchsia-400' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
        {children}
    </span>
)

const inputBase =
    "w-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"

const selectBase =
    "w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition appearance-none cursor-pointer"

function OrdenToggle({ value, onChange }: { value: OrdenFecha; onChange: (v: OrdenFecha) => void }) {
    return (
        <div className="flex rounded-lg overflow-hidden border border-zinc-600 mt-2">
            {(['asc', 'desc'] as OrdenFecha[]).map(o => (
                <button
                    key={o}
                    onClick={() => onChange(o)}
                    className={`flex-1 py-1.5 text-xs font-semibold transition cursor-pointer
                        ${value === o
                            ? 'bg-sky-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                    {o === 'asc' ? '↑ Más antiguo' : '↓ Más reciente'}
                </button>
            ))}
        </div>
    )
}

function EstadoBadge({ estado }: { estado?: Estado }) {
    if (!estado) return <span className="text-zinc-500 text-xs">—</span>
    const cfg = ESTADO_CONFIG[estado]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-medium">
            {label}
            <button onClick={onRemove} className="hover:text-white transition cursor-pointer ml-0.5">✕</button>
        </span>
    )
}

const SelectFiltro = ({
    value,
    onChange,
    children,
}: {
    value: string | number
    onChange: (v: string) => void
    children: React.ReactNode
}) => (
    <div className="relative">
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={selectBase}
        >
            {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▼</span>
    </div>
)

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReportesCursos({
    cursosArmados = [],
    usuarios = [],
    cursos = [],
    empresas = []
}: {
    cursosArmados?: cursoArmado[]
    usuarios?: usuario[]
    cursos?: curso[]
    empresas?: empresa[]
}) {
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
    const [filtersOpen, setFiltersOpen] = useState(true)

    const set = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
        setFiltros(prev => ({ ...prev, [key]: value }))

    // ── Usuarios relevantes ───────────────────────────────────────────────────
    const usuariosRelevantes = useMemo(() => {
        const ids = new Set<number>()
        const result: usuario[] = []
        for (const u of usuarios) {
            if (u.id && !ids.has(u.id)) { ids.add(u.id); result.push(u) }
        }
        return result.sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
    }, [usuarios])

    // ── Cursos con al menos un curso armado ───────────────────────────────────
    const cursosRelevantes = useMemo(() => {
        const ids = new Set(cursosArmados.map(c => c.curso?.curso_id).filter(Boolean))
        return cursos
            .filter(c => c.curso_id && ids.has(c.curso_id))
            .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
    }, [cursos, cursosArmados])

    // ── Empresas con al menos un curso armado ─────────────────────────────────
    const empresasRelevantes = useMemo(() => {
        const ids = new Set(cursosArmados.map(c => c.empresa?.id_empresa).filter(Boolean))
        return empresas
            .filter(e => e.id_empresa && ids.has(e.id_empresa))
            .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
    }, [empresas, cursosArmados])

    // ── Filtrado + ordenamiento ────────────────────────────────────────────────
    const cursosFiltrados = useMemo(() => {
        let lista = [...cursosArmados]

        if (filtros.estado)
            lista = lista.filter(c => c.estado === filtros.estado)

        if (filtros.cotizado) {
            lista = lista.filter(c =>
                filtros.cotizado === 'cotizado' ? c.cotizado : !c.cotizado
            )
        }

        if (filtros.usuarioId !== '')
            lista = lista.filter(c =>
                c.profesor?.id === filtros.usuarioId ||
                c.contactoDeCotizacion?.id === filtros.usuarioId ||
                c.inscripciones.some(i => i.usuario?.id === filtros.usuarioId)
            )

        if (filtros.cursoId !== '')
            lista = lista.filter(c => c.curso?.curso_id === filtros.cursoId)

        if (filtros.empresaId !== '')
            lista = lista.filter(c => c.empresa?.id_empresa === filtros.empresaId)

        if (filtros.fechaInicio) {
            lista = lista.filter(c => c.fecha_inicio && c.fecha_inicio >= filtros.fechaInicio)
            lista.sort((a, b) => {
                const da = a.fecha_inicio ?? '', db = b.fecha_inicio ?? ''
                return filtros.fechaInicioOrden === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
            })
        }

        if (filtros.fechaFinalizacion) {
            lista = lista.filter(c => c.fecha_finalizacion && c.fecha_finalizacion >= filtros.fechaFinalizacion)
            lista.sort((a, b) => {
                const da = a.fecha_finalizacion ?? '', db = b.fecha_finalizacion ?? ''
                return filtros.fechaFinalizacionOrden === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
            })
        }

        return lista
    }, [cursosArmados, filtros])

    // ── Chips de filtros activos ───────────────────────────────────────────────
    const activeChips: { label: string; clear: () => void }[] = []

    if (filtros.estado)
        activeChips.push({ label: `Estado: ${ESTADO_CONFIG[filtros.estado].label}`, clear: () => set('estado', '') })

    if (filtros.cotizado)
        activeChips.push({ label: `Cotizado: ${filtros.cotizado === 'cotizado' ? 'Sí' : 'No'}`, clear: () => set('cotizado', '') })

    if (filtros.usuarioId !== '') {
        const u = usuarios.find(u => u.id === filtros.usuarioId)
        activeChips.push({ label: `Usuario: ${u?.nombre ?? filtros.usuarioId}`, clear: () => set('usuarioId', '') })
    }

    if (filtros.cursoId !== '') {
        const c = cursos.find(c => c.curso_id === filtros.cursoId)
        activeChips.push({ label: `Curso: ${c?.nombre ?? filtros.cursoId}`, clear: () => set('cursoId', '') })
    }

    if (filtros.empresaId !== '') {
        const e = empresas.find(e => e.id_empresa === filtros.empresaId)
        activeChips.push({ label: `Empresa: ${e?.nombre ?? filtros.empresaId}`, clear: () => set('empresaId', '') })
    }

    if (filtros.fechaInicio)
        activeChips.push({ label: `Inicio desde: ${filtros.fechaInicio}`, clear: () => set('fechaInicio', '') })

    if (filtros.fechaFinalizacion)
        activeChips.push({ label: `Fin desde: ${filtros.fechaFinalizacion}`, clear: () => set('fechaFinalizacion', '') })

    const hayFiltrosActivos = activeChips.length > 0

    return (
        <div className="w-full flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Reportes de cursos</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {cursosFiltrados.length} de {cursosArmados.length} cursos
                    </p>
                </div>
                <button
                    onClick={() => setFiltersOpen(o => !o)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition cursor-pointer"
                >
                    <span>⚙ Filtros</span>
                    {hayFiltrosActivos && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                    <span className="text-zinc-500">{filtersOpen ? '▲' : '▼'}</span>
                </button>
            </div>

            {/* Panel de filtros */}
            {filtersOpen && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Filtros</p>
                        {hayFiltrosActivos && (
                            <button
                                onClick={() => setFiltros(FILTROS_INICIALES)}
                                className="text-xs text-zinc-500 hover:text-red-400 transition cursor-pointer"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Fecha de inicio */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Fecha de inicio (desde)</FieldLabel>
                            <input
                                type="date"
                                value={filtros.fechaInicio}
                                onChange={e => set('fechaInicio', e.target.value)}
                                className={inputBase}
                            />
                            {filtros.fechaInicio && (
                                <OrdenToggle value={filtros.fechaInicioOrden} onChange={v => set('fechaInicioOrden', v)} />
                            )}
                        </div>

                        {/* Fecha de finalización */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Fecha de finalización (desde)</FieldLabel>
                            <input
                                type="date"
                                value={filtros.fechaFinalizacion}
                                onChange={e => set('fechaFinalizacion', e.target.value)}
                                className={inputBase}
                            />
                            {filtros.fechaFinalizacion && (
                                <OrdenToggle value={filtros.fechaFinalizacionOrden} onChange={v => set('fechaFinalizacionOrden', v)} />
                            )}
                        </div>

                        {/* Estado */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Estado</FieldLabel>
                            <SelectFiltro value={filtros.estado} onChange={v => set('estado', v as Estado | '')}>
                                <option value="">Todos los estados</option>
                                {(Object.keys(ESTADO_CONFIG) as Estado[]).map(e => (
                                    <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
                                ))}
                            </SelectFiltro>
                        </div>

                        {/* Cotizado */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Cotizado</FieldLabel>
                            <SelectFiltro value={filtros.cotizado} onChange={v => set('cotizado', v as 'cotizado' | 'no_cotizado' | '')}>
                                <option value="">Todos</option>
                                <option value="cotizado">Cotizados</option>
                                <option value="no_cotizado">No cotizados</option>
                            </SelectFiltro>
                        </div>

                        {/* Empresa */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Empresa</FieldLabel>
                            <SelectFiltro
                                value={filtros.empresaId}
                                onChange={v => set('empresaId', v === '' ? '' : Number(v))}
                            >
                                <option value="">Todas las empresas</option>
                                {empresasRelevantes.map(e => (
                                    <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>
                                ))}
                            </SelectFiltro>
                        </div>

                        {/* Usuario */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Usuario</FieldLabel>
                            <SelectFiltro
                                value={filtros.usuarioId}
                                onChange={v => set('usuarioId', v === '' ? '' : Number(v))}
                            >
                                <option value="">Todos los usuarios</option>
                                {usuariosRelevantes.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                ))}
                            </SelectFiltro>
                        </div>

                        {/* Curso */}
                        <div className="flex flex-col gap-1">
                            <FieldLabel>Curso</FieldLabel>
                            <SelectFiltro
                                value={filtros.cursoId}
                                onChange={v => set('cursoId', v === '' ? '' : Number(v))}
                            >
                                <option value="">Todos los cursos</option>
                                {cursosRelevantes.map(c => (
                                    <option key={c.curso_id} value={c.curso_id}>{c.nombre}</option>
                                ))}
                            </SelectFiltro>
                        </div>

                    </div>

                    {/* Chips de filtros activos */}
                    {hayFiltrosActivos && (
                        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-zinc-800">
                            {activeChips.map(chip => (
                                <ActiveFilterChip key={chip.label} label={chip.label} onRemove={chip.clear} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tabla de resultados */}
            {cursosFiltrados.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-12 text-center">
                    <p className="text-zinc-500 text-sm">No hay cursos que coincidan con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-zinc-800 border-b border-zinc-700">
                                    {['Curso', 'Empresa', 'Profesor', 'Inicio', 'Finalización', 'Alumnos', 'Estado', "Cotizado"].map(h => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 ${h !== 'Curso' ? 'whitespace-nowrap' : 'min-w-[150px] max-w-[200px]'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {cursosFiltrados.map(c => (
                                    <tr key={c.curso_armado_id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 text-zinc-100 font-medium max-w-[200px] truncate" title={c.curso?.nombre ?? ''}>
                                            {c.curso?.nombre ?? <span className="text-zinc-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                                            {c.empresa?.nombre ?? <span className="text-zinc-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                                            {c.profesor?.nombre ?? <span className="text-zinc-600">—</span>}
                                        </td>

                                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono text-xs">
                                            {c.fecha_inicio ?? <span className="text-zinc-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono text-xs">
                                            {c.fecha_finalizacion ?? <span className="text-zinc-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold">
                                                {c.inscripciones.length}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge estado={c.estado} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.cotizado ? 'text-blue-400 bg-blue-950 border-blue-700' : 'text-gray-400 bg-gray-950 border-gray-700'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.cotizado ? 'bg-blue-400' : 'bg-gray-400'}`} />
                                                {c.cotizado ? 'COTIZADO' : 'NO COTIZADO'}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer con totales */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 bg-zinc-800/40 border-t border-zinc-700 text-xs text-zinc-500">
                        <span>
                            <span className="text-zinc-300 font-semibold">{cursosFiltrados.length}</span> cursos
                        </span>
                        <span>
                            <span className="text-zinc-300 font-semibold">
                                {cursosFiltrados.reduce((acc, c) => acc + c.inscripciones.length, 0)}
                            </span> alumnos en total
                        </span>
                        {(['ACTIVO', 'INACTIVO', 'FINALIZADO'] as Estado[]).map(e => {
                            const count = cursosFiltrados.filter(c => c.estado === e).length
                            if (count === 0) return null
                            return (
                                <span key={e}>
                                    <span className={`font-semibold ${ESTADO_CONFIG[e].color.split(' ')[0]}`}>{count}</span>
                                    {' '}{ESTADO_CONFIG[e].label.toLowerCase()}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}