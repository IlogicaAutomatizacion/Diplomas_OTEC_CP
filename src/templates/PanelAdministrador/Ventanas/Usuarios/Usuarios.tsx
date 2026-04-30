{/*Usuarios*/}

import { useState, useEffect } from "react"
import UsuariosPanel from "./UsuariosPanel"
import { borrarUsuariosAsyncBulk, type usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { crearUsuarioDeSuscriptorAsync, crearUsuariosDeSuscriptorAsync, obtenerUsuariosDeSuscriptorAsync } from "../../Api/suscripciones"
import { Example } from "../../Componentes/DropdownMenu"
import UsuariosCard from "./UsuariosCard"

// ─── Tipos de ordenamiento ────────────────────────────────────────────────────

type OrdenUsuario = 'nombre_asc' | 'nombre_desc' | 'id_asc' | 'id_desc'

const OPCIONES_ORDEN_USUARIOS: { label: string; value: OrdenUsuario }[] = [
    { label: 'ID menor→mayor', value: 'id_asc' },
    { label: 'ID mayor→menor', value: 'id_desc' },
    { label: 'Nombre A→Z', value: 'nombre_asc'  },
    { label: 'Nombre Z→A', value: 'nombre_desc' },
]

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
const IconUpload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)
const IconSort = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"  /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9"  y2="18" />
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

// ─── Campos del mapper ────────────────────────────────────────────────────────

const CAMPOS: { key: keyof usuario; label: string }[] = [
    { key: 'nombre',       label: 'Nombre'          },
    { key: 'correo',       label: 'Correo'          },
    { key: 'telefono',     label: 'Teléfono'        },
    { key: 'direccion',    label: 'Dirección'        },
    { key: 'rut',          label: 'RUT'              },
    { key: 'especialidad', label: 'Especialidad'     },
]

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
                className="text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 cursor-pointer hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition appearance-none pr-6"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
            >
                {opciones.map(o => (
                    <option key={o.value} value={o.value} className="bg-zinc-800 text-zinc-200">{o.label}</option>
                ))}
            </select>
        </div>
    )
}

// ─── UsuariosCard con soporte de selección ────────────────────────────────────
// NOTA: Este wrapper envuelve tu UsuariosCard existente añadiendo el checkbox
// y el borde de selección, sin necesidad de modificar UsuariosCard.

const UsuariosCardSeleccionable = ({
    usuario,
    setUsuarioSeleccionadoId,
    modoSeleccion,
    seleccionado,
    onToggleSeleccion,
}: {
    usuario: usuario
    setUsuarioSeleccionadoId: React.Dispatch<React.SetStateAction<number | null>>
    modoSeleccion: boolean
    seleccionado: boolean
    onToggleSeleccion: (id: number) => void
}) => {
    return (
        <div
            onClick={modoSeleccion && usuario.id ? () => onToggleSeleccion(usuario.id!) : undefined}
            className={`relative rounded-xl transition-all duration-200
                ${modoSeleccion ? 'cursor-pointer' : ''}`}
        >
            {/* Overlay de selección — borde y checkbox encima de la card existente */}
            {modoSeleccion && (
                <div className={`absolute inset-0 rounded-xl z-10 pointer-events-none border-2 transition-all duration-150
                    ${seleccionado
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-900/20'
                        : 'border-zinc-700'
                    }`}
                />
            )}

            {/* Checkbox flotante */}
            {modoSeleccion && (
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150
                        ${seleccionado ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-400 bg-zinc-900'}`}
                    >
                        {seleccionado && <IconCheck />}
                    </span>
                </div>
            )}

            {/* Card original — deshabilitada en modo selección para evitar navegación */}
            <div className={modoSeleccion ? 'pointer-events-none select-none' : ''}>
                <UsuariosCard
                    usuario={usuario}
                    setUsuarioSeleccionadoId={setUsuarioSeleccionadoId}
                />
            </div>
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default ({
    usuarios,
    idSuscriptor,
    empresas,
    setUsuarios,
    usuarioSeleccionadoId,
    setUsuarioSeleccionadoId,
}: {
    usuarios: usuario[]
    empresas: empresa[]
    idSuscriptor: number
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
    refreshKey?: number
    onVinculacionChange?: () => void
    usuarioSeleccionadoId: number | null
    setUsuarioSeleccionadoId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
    const [mensajeBoton, setMensajeBoton] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState<OrdenUsuario>('id_desc')
    const usuarioAVisualizar = usuarios.find(u => u.id === usuarioSeleccionadoId) ?? null

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
            await borrarUsuariosAsyncBulk([...seleccionados]) // ← tu función de API
            setUsuarios(prev => prev.filter(u => !seleccionados.has(u.id!)))
            cancelarModoSeleccion()
        } catch (e) {
            console.log(e)
        } finally {
            setEliminandoBulk(false)
        }
    }

    // ── Excel mapper ──────────────────────────────────────────────────────────
    const refrescarUsuarios = async () => {
        const data = await obtenerUsuariosDeSuscriptorAsync(idSuscriptor)
        setUsuarios(data)
    }

    const { datosImportados, setMapeo, cargarArchivo, construirResultado } =
        useExcelMapper<usuario>(async (usuariosExcel) => {
            await crearUsuariosDeSuscriptorAsync(idSuscriptor, usuariosExcel.filter(u => Object.values(u).some(Boolean)))
            await refrescarUsuarios()
        })

    useEffect(() => {
        ;(async () => {
            try {
                const data = await obtenerUsuariosDeSuscriptorAsync(idSuscriptor)
                setUsuarios(data)
            } catch { }
        })()
    }, [])

    useEffect(() => { setMensajeBoton(null) }, [usuarios])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando…')
            const nuevo = await crearUsuarioDeSuscriptorAsync(idSuscriptor)
            setUsuarios(last => [...last, nuevo])
        } catch {
            setMensajeBoton('Error al crear.')
            setTimeout(() => setMensajeBoton(null), 2000)
        }
    }

    // ── Filtrado y ordenamiento ───────────────────────────────────────────────
    const q = busqueda.toLowerCase()
    const usuariosFiltrados = usuarios.filter(u =>
        (u.nombre ?? '').toLowerCase().includes(q) ||
        String(u.indice_suscriptor ?? '').includes(q) ||
        (u.rut ?? '').toLowerCase().includes(q) ||
        (u.correo ?? '').toLowerCase().includes(q) ||
        (u.especialidad ?? '').toLowerCase().includes(q) ||
        (u.direccion ?? '').toLowerCase().includes(q)
    )

    const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
        switch (orden) {
            case 'id_asc': return (a.indice_suscriptor ?? 0) - (b.indice_suscriptor ?? 0)
            case 'id_desc': return (b.indice_suscriptor ?? 0) - (a.indice_suscriptor ?? 0)
            case 'nombre_desc': return (b.nombre ?? '').localeCompare(a.nombre ?? '', 'es', { sensitivity: 'base' })
            default: return (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es', { sensitivity: 'base' })
        }
    })

    // ── Panel de detalle ──────────────────────────────────────────────────────
    if (usuarioAVisualizar) {
        return (
            <UsuariosPanel
                idSuscriptor={idSuscriptor}
                setUsuarioSeleccionadoId={setUsuarioSeleccionadoId}
                empresas={empresas}
                setUsuarioState={setUsuarios}
                usuario={usuarioAVisualizar}
                onVinculacionChange={refrescarUsuarios}
            />
        )
    }

    // ── Vista de lista ────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Usuarios</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {usuariosOrdenados.length} de {usuarios.length} usuarios
                        {modoSeleccion && seleccionados.size > 0 && (
                            <span className="ml-2 text-emerald-400 font-semibold">· {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!modoSeleccion && (
                        <SortSelect value={orden} onChange={setOrden} opciones={OPCIONES_ORDEN_USUARIOS} />
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
                                    <span className="text-xs text-zinc-300">¿Eliminar {seleccionados.size} usuario{seleccionados.size !== 1 ? 's' : ''}?</span>
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
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                            >
                                <IconPlus />
                                {mensajeBoton ?? 'Nuevo usuario'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Importación Excel */}
            {!modoSeleccion && (
                datosImportados ? (
                    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 flex flex-col gap-5">
                        <div>
                            <h3 className="text-base font-semibold text-zinc-100">Relacionar columnas</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {datosImportados.filas.length} fila(s) · Usuarios con correo o RUT duplicado serán omitidos
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CAMPOS.map(({ key, label }) => (
                                <div key={key} className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
                                    <Example
                                        opciones={datosImportados.cabeceras}
                                        callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, [key]: opcion }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                construirResultado((fila, m) =>
                                    Object.fromEntries(
                                        CAMPOS.map(({ key }) => [
                                            key,
                                            fila[(m as Record<string, string>)[key]]
                                                ? String(fila[(m as Record<string, string>)[key]]).trim()
                                                : undefined,
                                        ])
                                    ) as Partial<usuario>
                                )
                            }}
                            className="self-start px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
                        >
                            Crear usuarios
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

            {/* Buscador */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"><IconSearch /></span>
                <input
                    type="text"
                    placeholder="Buscar por ID, nombre, RUT, correo, especialidad…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs transition cursor-pointer">✕</button>
                )}
            </div>

            {/* Grid de cards */}
            {usuariosOrdenados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">👤</span>
                    <p className="text-zinc-400 font-medium">{busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay usuarios'}</p>
                    <p className="text-zinc-600 text-sm mt-1">{busqueda ? 'Intenta con otro término' : 'Crea el primero con el botón de arriba'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {usuariosOrdenados.map(usuario => (
                        <UsuariosCardSeleccionable
                            key={usuario.id}
                            usuario={usuario}
                            setUsuarioSeleccionadoId={setUsuarioSeleccionadoId}
                            modoSeleccion={modoSeleccion}
                            seleccionado={seleccionados.has(usuario.id!)}
                            onToggleSeleccion={toggleSeleccion}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}