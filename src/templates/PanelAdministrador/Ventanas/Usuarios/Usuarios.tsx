{/*Usuarios*/}

import { useState, useEffect } from "react"
import UsuariosPanel from "./UsuariosPanel"
import type { usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { crearUsuarioDeSuscriptorAsync, crearUsuariosDeSuscriptorAsync, obtenerUsuariosDeSuscriptorAsync } from "../../Api/suscripciones"
import { Example } from "../../Componentes/DropdownMenu"
import UsuariosCard from "./UsuariosCard"

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

// ─── Campos del mapper ────────────────────────────────────────────────────────

const CAMPOS: { key: keyof usuario; label: string }[] = [
    { key: 'nombre',      label: 'Nombre' },
    { key: 'correo',      label: 'Correo' },
    { key: 'fono_fax',    label: 'Teléfono / Fax' },
    { key: 'direccion',   label: 'Dirección' },
    { key: 'rut',         label: 'RUT' },
    { key: 'especialidad',label: 'Especialidad' },
]

// ─── Componente ───────────────────────────────────────────────────────────────

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
    const usuarioAVisualizar = usuarios.find(u => u.id === usuarioSeleccionadoId) ?? null

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

    const q = busqueda.toLowerCase()
    const usuariosFiltrados = usuarios.filter(u =>
        (u.nombre ?? '').toLowerCase().includes(q) ||
        (u.rut ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.especialidad ?? '').toLowerCase().includes(q) ||
        (u.direccion ?? '').toLowerCase().includes(q)
    )

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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Usuarios</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {usuariosFiltrados.length} de {usuarios.length} usuarios
                    </p>
                </div>
                <button
                    onClick={handleAddButton}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                    <IconPlus />
                    {mensajeBoton ?? 'Nuevo usuario'}
                </button>
            </div>

            {/* Importación Excel */}
            {datosImportados ? (
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
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) cargarArchivo(f) }}
                    />
                </label>
            )}

            {/* Buscador */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <IconSearch />
                </span>
                <input
                    type="text"
                    placeholder="Buscar por nombre, RUT, correo, especialidad…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button
                        onClick={() => setBusqueda('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs transition cursor-pointer"
                    >✕</button>
                )}
            </div>

            {/* Grid de cards */}
            {usuariosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">👤</span>
                    <p className="text-zinc-400 font-medium">
                        {busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay usuarios'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {busqueda ? 'Intenta con otro término' : 'Crea el primero con el botón de arriba'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {usuariosFiltrados.map(usuario => (
                        <UsuariosCard
                            key={usuario.id}
                            usuario={usuario}
                            setUsuarioSeleccionadoId={setUsuarioSeleccionadoId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}