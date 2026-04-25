import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeCursoAsync, borrarCursoAsync, type curso } from "../Api/cursos"
import { crearCursoDeSuscriptorAsync, crearCursosDeSuscriptorAsync, obtenerCursosDeSuscriptorAsync } from "../Api/suscripciones"
import { Example } from "../Componentes/DropdownMenu"
import { useExcelMapper } from "../Componentes/SeccionadorSapa"

// ─── Íconos SVG inline ────────────────────────────────────────────────────────

const IconBook = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
)
const IconClock = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
const IconChevron = ({ open }: { open: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)

// ─── Helpers de UI ────────────────────────────────────────────────────────────

const FIELD_LABELS: Partial<Record<keyof curso, string>> = {
    nombre: 'Nombre',
    duracion: 'Duración (hrs)',
    resumen: 'Resumen',
    temario: 'Temario',
}

const FieldRow = ({ fieldKey, value, onChange }: { fieldKey: string; value: unknown; onChange: (v: string) => void }) => {
    const label = FIELD_LABELS[fieldKey as keyof curso] ?? fieldKey
    return (
        <div className="grid grid-cols-[110px_1fr] gap-2 items-start py-2 border-b border-zinc-800 last:border-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pt-0.5 truncate">{label}</span>
            <EditableText onChange={onChange} text={String(value ?? '—')} />
        </div>
    )
}

// ─── CursoCard ────────────────────────────────────────────────────────────────

const CursoCard = ({ curso, setCursosState }: { curso: curso; setCursosState: React.Dispatch<React.SetStateAction<curso[]>> }) => {
    const [open, setOpen] = useState(false)
    const [cursoLocal, setCursoLocal] = useState<curso>(curso)
    const [cursoGuardado, setCursoGuardado] = useState<curso>(curso)
    const [guardando, setGuardando] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const numericFields: (keyof curso)[] = ['duracion']

    useEffect(() => { setCursoLocal(curso); setCursoGuardado(curso) }, [curso.curso_id])
    useEffect(() => {
        setCursosState(prev => prev.map(c => c.curso_id === cursoLocal.curso_id ? cursoLocal : c))
    }, [cursoLocal.curso_id, cursoLocal])

    async function handleDelete() {
        if (!cursoLocal.curso_id) return
        try {
            await borrarCursoAsync(cursoLocal.curso_id)
            setCursosState(prev => prev.filter(c => c.curso_id !== cursoLocal.curso_id))
        } catch (e) { console.log(e) }
    }

    function normalizarValor(key: keyof curso, val: string) {
        const v = val.trim()
        if (numericFields.includes(key)) {
            const n = Number(v)
            return Number.isNaN(n) ? cursoLocal[key] : n
        }
        return v
    }

    const hayCambios = (Object.entries(cursoLocal) as [keyof curso, curso[keyof curso]][])
        .some(([key, value]) => !String(key).toLowerCase().includes('id') && value !== cursoGuardado[key])

    async function guardarCambios() {
        if (!cursoLocal.curso_id || !hayCambios) return
        setGuardando(true)
        try {
            for (const [key, value] of Object.entries(cursoLocal) as [keyof curso, curso[keyof curso]][]) {
                if (String(key).toLowerCase().includes('id') || value === cursoGuardado[key]) continue
                await actualizarPropiedadDeCursoAsync(cursoLocal.curso_id, key, value as string | number)
            }
            setCursoGuardado(cursoLocal)
        } catch (e) {
            console.log(e)
            setCursoLocal(cursoGuardado)
        } finally {
            setGuardando(false) }
    }

    const duracion = cursoLocal.duracion

    return (
        <div
            className="group rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-200 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30"
            style={{ contain: 'layout' }}
        >
            {/* Header de la card */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-0.5 text-sky-500 shrink-0"><IconBook /></span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate leading-snug">
                            {cursoLocal.nombre ?? <span className="text-zinc-600 italic">Sin nombre</span>}
                        </p>
                        {duracion != null && (
                            <p className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                <IconClock /> {duracion} hrs
                            </p>
                        )}
                    </div>
                </div>
                <span className="text-zinc-500 shrink-0 mt-0.5"><IconChevron open={open} /></span>
            </button>

            {/* Cuerpo expandible */}
            {open && (
                <div className="border-t border-zinc-800 px-4 pt-3 pb-4 flex flex-col gap-3">
                    {/* Campos */}
                    <div className="rounded-lg bg-zinc-800/40 px-3 py-1">
                        {Object.entries(cursoLocal).map(([key, value]) => {
                            if (key.toLowerCase().includes('id')) return null
                            return (
                                <FieldRow
                                    key={key}
                                    fieldKey={key}
                                    value={value}
                                    onChange={(val) => {
                                        const k = key as keyof curso
                                        setCursoLocal(prev => ({ ...prev, [k]: normalizarValor(k, val) }))
                                    }}
                                />
                            )
                        })}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={guardarCambios}
                            disabled={!hayCambios || guardando}
                            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all
                                ${!hayCambios || guardando
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-md shadow-sky-900/40'
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
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default ({ cursos, idSuscriptor, setCursos }: {
    cursos: curso[]
    idSuscriptor: number
    setCursos: React.Dispatch<React.SetStateAction<curso[]>>
}) => {
    const [mensajeBoton, setMensajeBoton] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')

    const { datosImportados, setMapeo, cargarArchivo, construirResultado } =
        useExcelMapper<curso>(async (cursosExcel) => {
            const res = await crearCursosDeSuscriptorAsync(idSuscriptor, cursosExcel.filter(c => Object.values(c).some(Boolean)))
            setCursos(res)
        })

    useEffect(() => {
        (async () => {
            try {
                const data = await obtenerCursosDeSuscriptorAsync(idSuscriptor)
                setCursos(data)
            } catch { }
        })()
    }, [])

    useEffect(() => { setMensajeBoton(null) }, [cursos])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando…')
            const nuevo = await crearCursoDeSuscriptorAsync(idSuscriptor)
            setCursos(last => [...last, nuevo])
        } catch {
            setMensajeBoton('Error al crear.')
            setTimeout(() => setMensajeBoton(null), 2000)
        }
    }

    const q = busqueda.toLowerCase()
    const cursosFiltrados = cursos.filter(c =>
        (c.nombre ?? '').toLowerCase().includes(q) ||
        (c.resumen ?? '').toLowerCase().includes(q) ||
        (c.temario ?? '').toLowerCase().includes(q) ||
        String(c.duracion ?? '').includes(q)
    )

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Cursos</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {cursosFiltrados.length} de {cursos.length} cursos
                    </p>
                </div>
                <button
                    onClick={handleAddButton}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                    <IconPlus />
                    {mensajeBoton ?? 'Nuevo curso'}
                </button>
            </div>

            {/* ── Importación Excel ── */}
            {datosImportados ? (
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 flex flex-col gap-5">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-100">Relacionar columnas</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{datosImportados.filas.length} fila(s) encontradas · Cursos sin duración numérica serán ignorados</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {(['nombre', 'duracion', 'resumen', 'temario'] as const).map(campo => (
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
                                nombre: fila[m.nombre] ? String(fila[m.nombre]).trim() : undefined,
                                duracion: fila[m.duracion] && !isNaN(Number(fila[m.duracion])) ? Number(fila[m.duracion]) : undefined,
                                resumen: fila[m.resumen] ? String(fila[m.resumen]).trim() : undefined,
                                temario: fila[m.temario] ? String(fila[m.temario]).trim() : undefined,
                            }))
                        }}
                        className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-sky-900/30"
                    >
                        Crear cursos
                    </button>
                </div>
            ) : (
                /* ── Upload de archivo ── */
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

            {/* ── Buscador ── */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <IconSearch />
                </span>
                <input
                    type="text"
                    placeholder="Buscar por nombre, duración, resumen o temario…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button
                        onClick={() => setBusqueda('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition text-xs cursor-pointer"
                    >✕</button>
                )}
            </div>

            {/* ── Grid de cards ── */}
            {cursosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">📚</span>
                    <p className="text-zinc-400 font-medium">
                        {busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay cursos'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {busqueda ? 'Intenta con otro término' : 'Crea el primero con el botón de arriba'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cursosFiltrados.map(curso => (
                        <CursoCard key={curso.curso_id} curso={curso} setCursosState={setCursos} />
                    ))}
                </div>
            )}
        </div>
    )
}