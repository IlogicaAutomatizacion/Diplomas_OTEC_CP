// Empresas.tsx

import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { borrarEmpresaAsync, borrarEmpresasAsyncBulk, type empresa } from "../Api/empresas"
import { crearEmpresaDeSuscriptorAsync, crearEmpresasDeSuscriptorAsync, editarEmpresaDeSuscriptorAsync, obtenerEmpresasDeSuscriptorAsync } from "../Api/suscripciones"
import { useExcelMapper } from "../Componentes/SeccionadorSapa"
import { Example } from "../Componentes/DropdownMenu"
import { agregarUsuarioVinculadoConEmpresaAsync, eliminarEmpresaVinculadaPorIdAsync, obtenerUsuariosVinculadosAEmpresaPorIdEmpresaAsync } from "../Api/empresasVinculadas"
import type { usuario } from "../Api/usuarios"

export type vinculacion = {
    vinculacion_id: number
    empresa_id: number
    usuario: usuario
}

// ─── Tipos de ordenamiento ────────────────────────────────────────────────────

type OrdenEmpresa = 'nombre_asc' | 'nombre_desc'

const OPCIONES_ORDEN_EMPRESAS: { label: string; value: OrdenEmpresa }[] = [
    { label: 'Nombre A→Z', value: 'nombre_asc'  },
    { label: 'Nombre Z→A', value: 'nombre_desc' },
]

// ─── Íconos SVG inline ────────────────────────────────────────────────────────

const IconBuilding = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2" /><line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
)
const IconChevron = ({ open }: { open: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)
const IconSave = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
)
const IconUserPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
)
const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)
const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const IconUpload = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)
const IconX = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const IconSort = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"  /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9"  y2="18" />
    </svg>
)
const IconCheck = () => (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 6 5 9 10 3" />
    </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIELD_LABELS: Partial<Record<keyof empresa, string>> = {
    nombre: 'Nombre',
    rut: 'RUT',
}

const FieldRow = ({ fieldKey, value, onChange }: { fieldKey: string; value: unknown; onChange: (v: string) => void }) => {
    const label = FIELD_LABELS[fieldKey as keyof empresa] ?? fieldKey
    return (
        <div className="grid grid-cols-[90px_1fr] gap-2 items-start py-2 border-b border-zinc-800 last:border-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pt-0.5 truncate">{label}</span>
            <EditableText onChange={onChange} text={String(value ?? '—')} />
        </div>
    )
}

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
                className="text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 cursor-pointer hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition appearance-none pr-6"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
            >
                {opciones.map(o => (
                    <option key={o.value} value={o.value} className="bg-zinc-800 text-zinc-200">{o.label}</option>
                ))}
            </select>
        </div>
    )
}

// ─── EmpresaCard ──────────────────────────────────────────────────────────────

const EmpresaCard = ({
    empresa,
    setEmpresaState,
    refreshKey,
    onVinculacionChange,
    id_suscriptor,
    usuarios,
    modoSeleccion,
    seleccionado,
    onToggleSeleccion,
}: {
    empresa: empresa
    setEmpresaState: React.Dispatch<React.SetStateAction<empresa[]>>
    refreshKey: number
    usuarios: usuario[]
    id_suscriptor: number
    onVinculacionChange: () => void
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
    modoSeleccion: boolean
    seleccionado: boolean
    onToggleSeleccion: (id: number) => void
}) => {
    const [open, setOpen] = useState(false)
    const [empresaLocal, setEmpresaLocal] = useState<empresa>(empresa)
    const [empresaGuardada, setEmpresaGuardada] = useState<empresa>(empresa)
    const [guardando, setGuardando] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [usuariosVinculados, setUsuariosVinculados] = useState<vinculacion[] | null>(null)
    const [activeTab, setActiveTab] = useState<'datos' | 'usuarios'>('datos')

    useEffect(() => {
        ;(async () => {
            if (!empresaLocal?.id_empresa) return
            const data = await obtenerUsuariosVinculadosAEmpresaPorIdEmpresaAsync({ empresa_id: empresaLocal.id_empresa })
            setUsuariosVinculados(data)
        })()
    }, [refreshKey])

    // ✅ Solo reinicializar cuando cambia el ID (nueva empresa montada), no en cada render
    useEffect(() => { setEmpresaLocal(empresa); setEmpresaGuardada(empresa) }, [empresa.id_empresa])

    // ✅ ELIMINADO: el useEffect que subía cambios locales al padre en cada keystroke
    // Era el causante de que el filtro/orden se recalculara mientras se editaba,
    // lo que podía resetear el estado local de la card.

    async function handleEliminarVinculacion(id_vinculacion: number) {
        try {
            await eliminarEmpresaVinculadaPorIdAsync(id_vinculacion)
            setUsuariosVinculados(last => last?.filter(v => v.vinculacion_id !== id_vinculacion) ?? null)
            onVinculacionChange()
        } catch (e) { console.log(e) }
    }

    async function agregarUsuario(usuario: usuario, empresa_id: number) {
        if (!usuario.id) return
        try {
            const vinculacion = await agregarUsuarioVinculadoConEmpresaAsync({ usuario_id: usuario.id, empresa_id })
            setUsuariosVinculados(last => (last ? [...last, vinculacion] : [vinculacion]))
            onVinculacionChange()
        } catch { }
    }

    async function handleDelete() {
        if (!empresaLocal.id_empresa) return
        try {
            await borrarEmpresaAsync(empresaLocal.id_empresa)
            // ✅ Actualizar el padre solo al confirmar eliminación
            setEmpresaState(prev => prev.filter(e => e.id_empresa !== empresaLocal.id_empresa))
        } catch (e) { console.log(e) }
    }

    const hayCambios = (Object.entries(empresaLocal) as [keyof empresa, empresa[keyof empresa]][])
        .some(([key, value]) => !String(key).toLowerCase().includes('id') && value !== empresaGuardada[key])

    async function guardarCambios() {
        if (!empresaLocal.id_empresa || !hayCambios) return
        setGuardando(true)
        try {
            for (const [key, value] of Object.entries(empresaLocal) as [keyof empresa, empresa[keyof empresa]][]) {
                if (String(key).toLowerCase().includes('id') || value === empresaGuardada[key]) continue
                await editarEmpresaDeSuscriptorAsync(id_suscriptor, empresaLocal.id_empresa, key, String(value ?? '').trim())
            }
            setEmpresaGuardada(empresaLocal)
            // ✅ Actualizar el padre solo al guardar exitosamente
            setEmpresaState(prev => prev.map(e => e.id_empresa === empresaLocal.id_empresa ? empresaLocal : e))
        } catch (e) {
            console.log(e)
            setEmpresaLocal(empresaGuardada)
        } finally {
            setGuardando(false)
        }
    }

    const nVinculados = usuariosVinculados?.length ?? 0

    return (
        <div
            onClick={modoSeleccion && empresaLocal.id_empresa ? () => onToggleSeleccion(empresaLocal.id_empresa!) : undefined}
            className={`rounded-xl border bg-zinc-900 overflow-hidden transition-all duration-200
                ${modoSeleccion
                    ? `cursor-pointer ${seleccionado
                        ? 'border-violet-500 ring-2 ring-violet-500/20 shadow-lg shadow-violet-900/20'
                        : 'border-zinc-700 hover:border-zinc-500'}`
                    : 'border-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30'
                }`}
        >
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3.5">
                {/* Checkbox — solo visible en modo selección */}
                {modoSeleccion && (
                    <span className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150
                        ${seleccionado ? 'bg-violet-500 border-violet-500' : 'border-zinc-500 bg-transparent'}`}
                    >
                        {seleccionado && <IconCheck />}
                    </span>
                )}

                <button
                    disabled={modoSeleccion}
                    onClick={modoSeleccion ? undefined : () => setOpen(o => !o)}
                    className="flex-1 flex items-start justify-between gap-3 text-left min-w-0"
                >
                    <div className="flex items-start gap-2.5 min-w-0">
                        <span className="mt-0.5 text-violet-400 shrink-0"><IconBuilding /></span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-100 truncate leading-snug">
                                {empresaLocal.nombre ?? <span className="text-zinc-600 italic">Sin nombre</span>}
                            </p>
                            {empresaLocal.rut && (
                                <p className="text-xs text-zinc-500 mt-0.5 font-mono">{empresaLocal.rut}</p>
                            )}
                        </div>
                    </div>
                    {!modoSeleccion && (
                        <div className="flex items-center gap-2 shrink-0">
                            {nVinculados > 0 && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-900/50 border border-violet-700 text-violet-300 text-xs font-semibold">
                                    {nVinculados}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </span>
                            )}
                            <span className="text-zinc-500"><IconChevron open={open} /></span>
                        </div>
                    )}
                </button>
            </div>

            {/* Body — oculto en modo selección */}
            {!modoSeleccion && open && (
                <div className="border-t border-zinc-800 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-zinc-800">
                        {(['datos', 'usuarios'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors cursor-pointer
                                    ${activeTab === tab
                                        ? 'text-white border-b-2 border-violet-500 -mb-px bg-zinc-800/30'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab === 'datos' ? 'Datos' : `Usuarios${nVinculados ? ` (${nVinculados})` : ''}`}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Datos */}
                    {activeTab === 'datos' && (
                        <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                            <div className="rounded-lg bg-zinc-800/40 px-3 py-1">
                                {Object.entries(empresaLocal).map(([key, value]) => {
                                    if (key.toLowerCase().includes('id')) return null
                                    return (
                                        <FieldRow
                                            key={key}
                                            fieldKey={key}
                                            value={value}
                                            onChange={(val) => {
                                                const k = key as keyof empresa
                                                setEmpresaLocal(prev => ({ ...prev, [k]: val.trim() }))
                                            }}
                                        />
                                    )
                                })}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={guardarCambios}
                                    disabled={!hayCambios || guardando}
                                    className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all
                                        ${!hayCambios || guardando
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : 'bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-md shadow-violet-900/40'
                                        }`}
                                >
                                    <IconSave />
                                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                                </button>

                                {!confirmDelete ? (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-950/40 border border-zinc-700 hover:border-red-800 transition-all cursor-pointer"
                                    >
                                        <IconTrash />
                                    </button>
                                ) : (
                                    <div className="flex gap-1">
                                        <button onClick={handleDelete} className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all">Confirmar</button>
                                        <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all">Cancelar</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Usuarios */}
                    {activeTab === 'usuarios' && (
                        <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconUserPlus /> Agregar usuario
                                </p>
                                <Example
                                    titulo="Seleccionar usuario…"
                                    noCambiarNombreAlSeleccionar
                                    callbackOnSelect={(usuario) => {
                                        if (!usuario || !empresaLocal?.id_empresa) return
                                        agregarUsuario(usuario, empresaLocal.id_empresa)
                                    }}
                                    opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                                />
                            </div>

                            {usuariosVinculados && usuariosVinculados.length > 0 ? (
                                <ul className="flex flex-col gap-1.5">
                                    {usuariosVinculados.map(({ usuario, vinculacion_id }) => (
                                        <li
                                            key={usuario.id}
                                            className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-6 h-6 rounded-full bg-violet-900 border border-violet-700 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                                                    {(usuario.nombre ?? '?')[0]}
                                                </span>
                                                <span className="text-sm text-zinc-200 truncate">{usuario.nombre}</span>
                                            </div>
                                            <button
                                                onClick={() => handleEliminarVinculacion(vinculacion_id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                                            >
                                                <IconX />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-zinc-600 text-center py-4">Sin usuarios vinculados</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default ({
    empresas, usuarios, idSuscriptor, setEmpresas, refreshKey, onVinculacionChange, setUsuarios,
}: {
    empresas: empresa[]
    usuarios: usuario[]
    idSuscriptor: number
    setEmpresas: React.Dispatch<React.SetStateAction<empresa[]>>
    refreshKey: number
    onVinculacionChange: () => void
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
}) => {
    const [mensajeBoton, setMensajeBoton] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState<OrdenEmpresa>('nombre_asc')

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
            await borrarEmpresasAsyncBulk([...seleccionados])
            setEmpresas(prev => prev.filter(e => !seleccionados.has(e.id_empresa!)))
            cancelarModoSeleccion()
        } catch (e) {
            console.log(e)
        } finally {
            setEliminandoBulk(false)
        }
    }

    // ── Excel mapper ──────────────────────────────────────────────────────────
    const refrescarEmpresas = async () => {
        const data = await obtenerEmpresasDeSuscriptorAsync(idSuscriptor)
        setEmpresas(data)
    }

    const { datosImportados, setMapeo, cargarArchivo, construirResultado } =
        useExcelMapper<empresa>(async (empresasExcel) => {
            await crearEmpresasDeSuscriptorAsync(idSuscriptor, empresasExcel.filter(e => Object.values(e).some(Boolean)))
            await refrescarEmpresas()
        })

    useEffect(() => {
        ;(async () => {
            try {
                const data = await obtenerEmpresasDeSuscriptorAsync(idSuscriptor)
                setEmpresas(data)
            } catch { }
        })()
    }, [])

    useEffect(() => { setMensajeBoton(null) }, [empresas])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando…')
            const nueva = await crearEmpresaDeSuscriptorAsync(idSuscriptor)
            setEmpresas(last => [...last, nueva])
        } catch {
            setMensajeBoton('Error al crear.')
            setTimeout(() => setMensajeBoton(null), 2000)
        }
    }

    // ── Filtrado y ordenamiento ───────────────────────────────────────────────
    const q = busqueda.toLowerCase()
    const empresasFiltradas = empresas.filter(e =>
        (e.nombre ?? '').toLowerCase().includes(q) ||
        (e.rut ?? '').toLowerCase().includes(q)
    )

    const empresasOrdenadas = [...empresasFiltradas].sort((a, b) => {
        if (orden === 'nombre_desc') return (b.nombre ?? '').localeCompare(a.nombre ?? '', 'es', { sensitivity: 'base' })
        return (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es', { sensitivity: 'base' })
    })

    return (
        <div className="flex flex-col gap-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Empresas</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {empresasOrdenadas.length} de {empresas.length} empresas
                        {modoSeleccion && seleccionados.size > 0 && (
                            <span className="ml-2 text-violet-400 font-semibold">· {seleccionados.size} seleccionada{seleccionados.size !== 1 ? 's' : ''}</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!modoSeleccion && (
                        <SortSelect value={orden} onChange={setOrden} opciones={OPCIONES_ORDEN_EMPRESAS} />
                    )}

                    {modoSeleccion ? (
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
                                    <span className="text-xs text-zinc-300">¿Eliminar {seleccionados.size} empresa{seleccionados.size !== 1 ? 's' : ''}?</span>
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
                        <>
                            <button
                                onClick={activarModoSeleccion}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
                            >
                                Seleccionar
                            </button>
                            <button
                                onClick={handleAddButton}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/30 cursor-pointer"
                            >
                                <IconPlus />
                                {mensajeBoton ?? 'Nueva empresa'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Importación Excel ── */}
            {!modoSeleccion && (
                datosImportados ? (
                    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 flex flex-col gap-5">
                        <div>
                            <h3 className="text-base font-semibold text-zinc-100">Relacionar columnas</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {datosImportados.filas.length} fila(s) · Empresas con RUT duplicado o datos inválidos serán omitidas
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(['rut', 'nombre'] as const).map(campo => (
                                <div key={campo} className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        {FIELD_LABELS[campo] ?? campo}
                                    </span>
                                    <Example
                                        opciones={datosImportados.cabeceras}
                                        callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, [campo]: opcion }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                construirResultado((fila, m) => ({
                                    rut:    fila[m.rut]    ? String(fila[m.rut]).trim()    : undefined,
                                    nombre: fila[m.nombre] ? String(fila[m.nombre]).trim() : undefined,
                                }))
                            }}
                            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-violet-900/30"
                        >
                            Crear empresas
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 transition-all px-6 py-10 cursor-pointer group">
                        <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors"><IconUpload /></span>
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-300">Importar desde Excel</p>
                            <p className="text-xs text-zinc-600 mt-0.5">Arrastra un archivo .xlsx o .xls, o haz clic para seleccionar</p>
                        </div>
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) cargarArchivo(f) }} />
                    </label>
                )
            )}

            {/* ── Buscador ── */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"><IconSearch /></span>
                <input
                    type="text"
                    placeholder="Buscar por nombre o RUT…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition text-xs cursor-pointer">✕</button>
                )}
            </div>

            {/* ── Grid ── */}
            {empresasOrdenadas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">🏢</span>
                    <p className="text-zinc-400 font-medium">{busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay empresas'}</p>
                    <p className="text-zinc-600 text-sm mt-1">{busqueda ? 'Intenta con otro término' : 'Crea la primera con el botón de arriba'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {empresasOrdenadas.map(empresa => (
                        <EmpresaCard
                            key={empresa.id_empresa}
                            empresa={empresa}
                            id_suscriptor={idSuscriptor}
                            setEmpresaState={setEmpresas}
                            refreshKey={refreshKey}
                            onVinculacionChange={onVinculacionChange}
                            usuarios={usuarios}
                            setUsuarios={setUsuarios}
                            modoSeleccion={modoSeleccion}
                            seleccionado={seleccionados.has(empresa.id_empresa!)}
                            onToggleSeleccion={toggleSeleccion}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}