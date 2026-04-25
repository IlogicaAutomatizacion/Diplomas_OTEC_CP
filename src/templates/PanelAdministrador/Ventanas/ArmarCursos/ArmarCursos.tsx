import React, { useContext, useEffect, useState } from "react"
import type { usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import type { curso } from "../../Api/cursos"
import { type cursoArmado } from "../../Api/cursos-armados"
import { crearCursoArmadoDeSuscriptorAsync, obtenerCursosArmadosDeSuscriptorAsync } from "../../Api/suscripciones"
import { ErrorContext } from "../../../../Error/ErrorContext"
import CursoArmadoCard from "./ArmarCursoCard"
import ArmarCursoPanel from "./ArmarCursoPanel"

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

// ─── Componente ───────────────────────────────────────────────────────────────

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
    const [cursoArmadoAVisualizar, setCursoArmadoAVisualizar] = useState<cursoArmado | null>(null)
    const { setError } = useContext(ErrorContext)!

    useEffect(() => {
        ;(async () => {
            try {
                const data = await obtenerCursosArmadosDeSuscriptorAsync(idSuscriptor)
                setCursosArmados(data)
            } catch { }
        })()
    }, [empresas, cursos, usuarios])

    useEffect(() => { setMensajeBoton(null) }, [cursosArmados])

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

    const q = busqueda.toLowerCase().trim()
    const cursosFiltrados = cursosArmados.filter(ca =>
        !q ||
        ca.curso?.nombre?.toLowerCase().includes(q) ||
        ca.empresa?.nombre?.toLowerCase().includes(q)
    )

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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Gestionar cursos</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {cursosFiltrados.length} de {cursosArmados.length} cursos
                    </p>
                </div>
                <button
                    onClick={handleAddButton}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
                >
                    <IconPlus />
                    {mensajeBoton ?? 'Nuevo curso'}
                </button>
            </div>

            {/* Buscador */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <IconSearch />
                </span>
                <input
                    type="text"
                    placeholder="Buscar por nombre de curso o empresa…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
                {busqueda && (
                    <button
                        onClick={() => setBusqueda('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs transition cursor-pointer"
                    >✕</button>
                )}
            </div>

            {/* Grid de cards */}
            {cursosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">🎓</span>
                    <p className="text-zinc-400 font-medium">
                        {busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay cursos armados'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {busqueda ? 'Intenta con otro término' : 'Crea el primero con el botón de arriba'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cursosFiltrados.map(ca => (
                        <CursoArmadoCard
                            key={ca.curso_armado_id}
                            cursoArmado={ca}
                            setCursoArmadoAVisualizar={setCursoArmadoAVisualizar}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}