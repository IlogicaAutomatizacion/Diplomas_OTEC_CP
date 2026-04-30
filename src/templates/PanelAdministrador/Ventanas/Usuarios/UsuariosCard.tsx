{/* UsuariosCard */ }

import type { usuario } from "../../Api/usuarios"

const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

export default ({
    usuario,
    setUsuarioSeleccionadoId,
}: {
    usuario: usuario
    setUsuarioSeleccionadoId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
    const inicial = (usuario.nombre ?? '?')[0].toUpperCase()
    const metaDatos = [usuario.id_suscripcion_usuario && `ID #${usuario.indice_suscriptor}`, usuario.correo, usuario.especialidad].filter(Boolean)

    return (
        <button
            onClick={() => setUsuarioSeleccionadoId(usuario.id!)}
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
            {/* Avatar */}
            <span className="
                w-9 h-9 rounded-full shrink-0
                bg-emerald-900 border border-emerald-700
                text-emerald-300 text-sm font-bold
                flex items-center justify-center
                uppercase select-none
            ">
                {inicial}
            </span>

            {/* Texto */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate leading-snug">
                    {usuario.nombre ?? <span className="text-zinc-600 italic">Sin nombre</span>}
                </p>
                {metaDatos.length > 0 && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {metaDatos.join(' · ')}
                    </p>
                )}
                {usuario.rut && (
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">{usuario.rut}</p>
                )}
            </div>

            {/* Flecha */}
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0">
                <IconChevronRight />
            </span>
        </button>
    )
}