import type { cursoArmado } from "../../Api/cursos-armados"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

type Estado = NonNullable<cursoArmado['estado']>
type Cotizado = NonNullable<cursoArmado['cotizado']>
type CotizadoEnum = "COTIZADO" | "NO_COTIZADO"

const ESTADO_CONFIG: Record<Estado, { label: string; dot: string; text: string }> = {
    ACTIVO: { label: 'Activo', dot: 'bg-emerald-400', text: 'text-emerald-400' },
    INACTIVO: { label: 'Inactivo', dot: 'bg-red-400', text: 'text-red-400' },
    FINALIZADO: { label: 'Finalizado', dot: 'bg-fuchsia-400', text: 'text-fuchsia-400' },
}



const COTIZADO_CONFIG: Record<CotizadoEnum, { label: string; dot: string; text: string }> = {
    "COTIZADO": { label: 'COTIZADO', dot: 'bg-blue-400', text: 'text-blue-400' },
    "NO_COTIZADO": { label: 'NO COTIZADO', dot: 'bg-gray-400', text: 'text-gray-400' },
}

const EstadoDot = ({ estado }: { estado?: Estado }) => {
    if (!estado || !ESTADO_CONFIG[estado]) return null
    const cfg = ESTADO_CONFIG[estado]
    return (
        <span className={`flex items-center gap-1 text-xs font-semibold ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}


const CotizadoDot = ({ cotizado }: { cotizado?: Cotizado }) => {
    const cfg = COTIZADO_CONFIG[cotizado ? "COTIZADO" : "NO_COTIZADO"]

    return (
        <span className={`flex items-center gap-1 text-xs font-semibold ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

// ─── Componente ───────────────────────────────────────────────────────────────

const CursoArmadoCard = ({
    cursoArmado,
    setCursoArmadoAVisualizar,
}: {
    cursoArmado: cursoArmado
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>
}) => {
    const inicial = (cursoArmado.curso?.nombre ?? '?')[0].toUpperCase()
    const tieneAlumnos = (cursoArmado.inscripciones?.length ?? 0) > 0

    return (
        <button
            onClick={() => setCursoArmadoAVisualizar(cursoArmado)}
            className="
                group w-full text-left
                flex items-center gap-3
                px-4 py-3 rounded-xl
                bg-zinc-900 border border-zinc-800
                hover:border-zinc-600 hover:bg-zinc-800/60
                hover:shadow-md hover:shadow-black/30
                transition-all duration-150 cursor-pointer
            "
        >
            {/* Avatar / inicial */}
            <span className="
                w-9 h-9 rounded-full shrink-0
                bg-amber-900 border border-amber-700
                text-amber-300 text-sm font-bold
                flex items-center justify-center
                uppercase select-none
            ">
                {inicial}
            </span>

            {/* Texto */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate leading-snug">
                    {cursoArmado.curso?.nombre ?? <span className="italic text-zinc-600">Sin nombre</span>}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">ID #{cursoArmado.indice_suscriptor}</p>

                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {cursoArmado.empresa?.nombre && (
                        <span className="text-xs text-zinc-500 truncate">
                            {cursoArmado.empresa.nombre}
                        </span>
                    )}
                    {cursoArmado.empresa?.nombre && cursoArmado.estado && (
                        <span className="text-zinc-700 text-xs">·</span>
                    )}
                    <EstadoDot estado={cursoArmado.estado as Estado} />
                    <CotizadoDot cotizado={cursoArmado.cotizado as Cotizado} />

                </div>

                <div className="flex items-center gap-3 mt-1">
                    {cursoArmado.fecha_inicio && (
                        <span className="text-xs text-zinc-600 font-mono">
                            {cursoArmado.fecha_inicio}
                        </span>
                    )}
                    {tieneAlumnos && (
                        <span className="text-xs text-zinc-500">
                            {cursoArmado.inscripciones.length} alumno{cursoArmado.inscripciones.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Flecha */}
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0">
                <IconChevronRight />
            </span>
        </button>
    )
}

export default CursoArmadoCard