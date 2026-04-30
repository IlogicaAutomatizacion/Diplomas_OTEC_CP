import type React from "react"
import type { cursoArmado } from "../../Api/cursos-armados"
import type { curso } from "../../Api/cursos"
import type { empresa } from "../../Api/empresas"
import type { inscripcion } from "../../Api/inscripciones"
import type { usuario } from "../../Api/usuarios"
import { Example } from "../../Componentes/DropdownMenu"
import { COTIZACION_FIELDS, INICIO_FIELDS, parseOptionalNumber } from "./armarCursoPanel.utils"

type DatosImportados = {
    filas: Record<string, unknown>[],
    cabeceras: { nombre: string, opcion: string }[]
} | null

// ─── Shared helpers ──────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl font-bold tracking-tight text-white text-center mt-16 mb-1">
        {children}
    </h2>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
        {children}
    </span>
)

const inputBase =
    "w-full bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-xl ${className}`}>
        {children}
    </div>
)

const Divider = () => <div className="border-t border-zinc-700 my-6" />

// ─── CotizacionSection ────────────────────────────────────────────────────────

export function CotizacionSection({
    idSuscriptor,
    cursoArmadoLocal,
    cursos,
    empresas,
    usuarios,
    cambiarEstadoCotizacion,
    hayCambiosCotizacion,
    guardandoCotizacion,
    hayFormatoDeCotizacion,
    descargandoCotizacion,
    mandandoCotizacion,
    cotizacionEnviadaCorrectamente,
    setCursoArmadoLocal,
    onGuardarCotizacion,
    onSubirFormatoCotizacion,
    onEliminarFormatoCotizacion,
    onDescargarCotizacion,
    onMandarCotizacion
}: {
    idSuscriptor: number,
    cursoArmadoLocal: cursoArmado,
    cursos: curso[],
    empresas: empresa[],
    usuarios: usuario[],
    hayCambiosCotizacion: boolean,
    guardandoCotizacion: boolean,
    hayFormatoDeCotizacion: boolean,
    descargandoCotizacion: boolean,
    mandandoCotizacion: boolean,
    cotizacionEnviadaCorrectamente: boolean,
    setCursoArmadoLocal: React.Dispatch<React.SetStateAction<cursoArmado>>,
    onGuardarCotizacion: () => Promise<void>,
    onSubirFormatoCotizacion: (file: File) => Promise<void>,
    onEliminarFormatoCotizacion: () => Promise<void>,
    onDescargarCotizacion: () => Promise<void>,
    onMandarCotizacion: () => Promise<void>,
    cambiarEstadoCotizacion: (cotizado: boolean) => Promise<void>
}) {
    return (
        <section className="flex flex-col gap-6">
            <SectionTitle>Cotización</SectionTitle>
            <div className="flex justify-center items-center">
                <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest border uppercase ${cursoArmadoLocal.cotizado ? "text-blue-400 bg-blue-950 border-fuchsia-700' " : "text-red-400 bg-red-950 border-red-700' "}`}>
                    {cursoArmadoLocal.cotizado ? "COTIZADO" : "NO COTIZADO"}
                </span>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Empresa */}
                    <div className="flex flex-col gap-1">
                        <FieldLabel>Empresa</FieldLabel>
                        <Example
                            seleccionado={cursoArmadoLocal.empresa?.nombre}
                            callbackOnSelect={(empresaSeleccionada) => {
                                setCursoArmadoLocal(prev => ({ ...prev, empresa: empresaSeleccionada }))
                            }}
                            opciones={empresas.map(empresa => ({ nombre: empresa.nombre, opcion: empresa }))}
                        />
                    </div>

                    {/* Curso */}
                    <div className="flex flex-col gap-1">
                        <FieldLabel>Curso</FieldLabel>
                        <Example
                            seleccionado={cursoArmadoLocal.curso?.nombre}
                            callbackOnSelect={(cursoSeleccionado) => {
                                setCursoArmadoLocal(prev => ({ ...prev, curso: cursoSeleccionado }))
                            }}
                            opciones={cursos.map(curso => ({ nombre: curso.nombre, opcion: curso }))}
                        />
                    </div>

                    {/* Contacto */}
                    <div className="flex flex-col gap-1">
                        <FieldLabel>Usuario de contacto</FieldLabel>
                        <Example
                            seleccionado={cursoArmadoLocal.contactoDeCotizacion?.nombre}
                            callbackOnSelect={(contacto) => {
                                setCursoArmadoLocal(prev => ({ ...prev, contactoDeCotizacion: contacto }))
                            }}
                            opciones={usuarios.map(usuario => ({ nombre: `${usuario.nombre} #${usuario.indice_suscriptor}`, opcion: usuario }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <FieldLabel>Vendedor</FieldLabel>
                        <Example
                            seleccionado={cursoArmadoLocal.vendedor?.nombre}
                            callbackOnSelect={(contacto) => {
                                setCursoArmadoLocal(prev => ({ ...prev, vendedor: contacto }))
                            }}
                            opciones={usuarios.map(usuario => ({ nombre: `${usuario.nombre} #${usuario.indice_suscriptor}`, opcion: usuario }))}
                        />
                    </div>

                    {/* Alumnos */}
                    <label className="flex flex-col gap-1">
                        <FieldLabel>Alumnos cotizados</FieldLabel>
                        <input
                            type="number"
                            value={cursoArmadoLocal.alumnosCotizados ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    alumnosCotizados: parseOptionalNumber(e.target.value) ?? 0
                                }))
                            }}
                            className={inputBase}
                        />
                    </label>

                    {/* Valor unitario */}
                    <label className="flex flex-col gap-1">
                        <FieldLabel>Valor unitario</FieldLabel>
                        <input
                            type="number"
                            value={cursoArmadoLocal.valorUnitario ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    valorUnitario: parseOptionalNumber(e.target.value) ?? 0
                                }))
                            }}
                            className={inputBase}
                        />
                    </label>

                    {/* Notas */}
                    <label className="flex flex-col gap-1 md:col-span-2">
                        <FieldLabel>Notas</FieldLabel>
                        <textarea
                            rows={4}
                            value={cursoArmadoLocal.notas_cotizacion ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({ ...prev, notas_cotizacion: e.target.value }))
                            }}
                            className={`${inputBase} resize-y`}
                        />
                    </label>
                </div>

                <Divider />

                <div className="flex justify-end">
                    <button
                        onClick={() => { void onGuardarCotizacion() }}
                        disabled={!hayCambiosCotizacion || guardandoCotizacion}
                        className={`
                            px-8 py-2.5 rounded-lg text-sm font-semibold transition-all
                            ${!hayCambiosCotizacion || guardandoCotizacion
                                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer'}
                        `}
                    >
                        {guardandoCotizacion ? (
                            <span className="flex items-center gap-2">
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </span>
                        ) : 'Guardar'}
                    </button>
                </div>
            </Card>

            {/* Formato de cotización */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Formato de cotización</h3>

                {!hayFormatoDeCotizacion ? (
                    <label className="flex flex-col gap-2">
                        <span className="text-sm text-zinc-400">Subir archivo <span className="text-zinc-500">.docx</span></span>
                        <input
                            key={idSuscriptor}
                            type="file"
                            accept=".docx"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) void onSubirFormatoCotizacion(file)
                            }}
                            className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                        />
                    </label>
                ) : (
                    <button
                        onClick={() => { void onEliminarFormatoCotizacion() }}
                        className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition cursor-pointer"
                    >
                        Eliminar formato de cotización
                    </button>
                )}
            </Card>

            {/* Acciones finales */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => { void onDescargarCotizacion() }}
                    className="flex-1 py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                    {descargandoCotizacion ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Descargando...
                        </span>
                    ) : '⬇ Descargar cotización'}
                </button>

                <button
                    onClick={() => {
                        cambiarEstadoCotizacion(!cursoArmadoLocal?.cotizado)
                    }}
                    className={`flex-1 py-2.5 px-6 rounded-lg ${cursoArmadoLocal.cotizado ? "bg-red-600 hover:bg-red-500" : "bg-fuchsia-600 hover:bg-fuchsia-500"} text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/30 cursor-pointer`}
                >
                    {cursoArmadoLocal.cotizado ? "X Desmarcar como cotizado" : '✓ Marcar como cotizado'}
                </button>

                {cotizacionEnviadaCorrectamente ? (
                    <div className="flex-1 py-2.5 px-6 rounded-lg bg-emerald-800 text-emerald-300 text-sm font-semibold text-center border border-emerald-700">
                        ✓ Cotización enviada correctamente
                    </div>
                ) : (
                    <button
                        onClick={() => { void onMandarCotizacion() }}
                        disabled={mandandoCotizacion}
                        className={`
                            flex-1 py-2.5 px-6 rounded-lg text-sm font-semibold transition cursor-pointer
                            ${mandandoCotizacion
                                ? 'bg-amber-700 text-amber-200 cursor-not-allowed'
                                : 'bg-sky-700 hover:bg-sky-600 text-white shadow-lg shadow-sky-900/30'}
                        `}
                    >
                        {mandandoCotizacion ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </span>
                        ) : '✉ Mandar cotización'}
                    </button>
                )}
            </div>
        </section >
    )
}

// ─── InicioCursoSection ───────────────────────────────────────────────────────

const estadoConfig: Record<string, { label: string; color: string }> = {
    ACTIVO: { label: 'ACTIVO', color: 'text-emerald-400 bg-emerald-950 border-emerald-700' },
    INACTIVO: { label: 'INACTIVO', color: 'text-red-400 bg-red-950 border-red-700' },
    FINALIZADO: { label: 'FINALIZADO', color: 'text-fuchsia-400 bg-fuchsia-950 border-fuchsia-700' },
}

export function InicioCursoSection({
    cursoArmadoLocal,
    usuarios,
    hayCambiosInicio,
    guardandoInicio,
    setCursoArmadoLocal,
    onGuardarInicio
}: {
    cursoArmadoLocal: cursoArmado,
    usuarios: usuario[],
    hayCambiosInicio: boolean,
    guardandoInicio: boolean,
    setCursoArmadoLocal: React.Dispatch<React.SetStateAction<cursoArmado>>,
    onGuardarInicio: () => Promise<void>
}) {
    const estado = cursoArmadoLocal.estado ?? 'INACTIVO'
    const cfg = estadoConfig[estado] ?? estadoConfig['INACTIVO']

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 mt-14">
                <SectionTitle>Inicio de curso</SectionTitle>
                <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest border uppercase ${cfg.color}`}>
                    {cfg.label}
                </span>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-1">
                        <FieldLabel>Fecha de inicio</FieldLabel>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_inicio ?? ''}
                            onChange={(e) => setCursoArmadoLocal(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <FieldLabel>Fecha de finalización</FieldLabel>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_finalizacion ?? ''}
                            onChange={(e) => setCursoArmadoLocal(prev => ({ ...prev, fecha_finalizacion: e.target.value }))}
                            className={inputBase}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <FieldLabel>Profesor</FieldLabel>
                        <Example
                            seleccionado={cursoArmadoLocal.profesor?.nombre}
                            callbackOnSelect={(profesor) => setCursoArmadoLocal(prev => ({ ...prev, profesor }))}
                            opciones={usuarios.map(usuario => ({nombre: `${usuario.nombre} #${usuario.indice_suscriptor}`, opcion: usuario }))}
                        />
                    </div>

                    <label className="flex flex-col gap-1">
                        <FieldLabel>Lugar de realización</FieldLabel>
                        <input
                            type="text"
                            value={cursoArmadoLocal.lugar_de_realizacion ?? ''}
                            onChange={(e) => setCursoArmadoLocal(prev => ({ ...prev, lugar_de_realizacion: e.target.value }))}
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <FieldLabel>Nota aprobatoria teórica</FieldLabel>
                        <input
                            type="number"
                            value={cursoArmadoLocal.teorica ?? ''}
                            onChange={(e) => setCursoArmadoLocal(prev => ({ ...prev, teorica: parseOptionalNumber(e.target.value) }))}
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <FieldLabel>Nota aprobatoria práctica</FieldLabel>
                        <input
                            type="number"
                            value={cursoArmadoLocal.calificacion_aprobatoria ?? ''}
                            onChange={(e) => setCursoArmadoLocal(prev => ({ ...prev, calificacion_aprobatoria: parseOptionalNumber(e.target.value) }))}
                            className={inputBase}
                        />
                    </label>
                </div>

                <Divider />

                <div className="flex justify-end">
                    <button
                        onClick={() => { void onGuardarInicio() }}
                        disabled={!hayCambiosInicio || guardandoInicio}
                        className={`
                            px-8 py-2.5 rounded-lg text-sm font-semibold transition-all
                            ${!hayCambiosInicio || guardandoInicio
                                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer'}
                        `}
                    >
                        {guardandoInicio ? (
                            <span className="flex items-center gap-2">
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </span>
                        ) : 'Guardar'}
                    </button>
                </div>
            </Card>
        </section>
    )
}

// ─── InscripcionesSection ─────────────────────────────────────────────────────

export function InscripcionesSection({
    usuariosAbiertos,
    cursoArmadoLocal,
    usuarios,
    mensajeInscripciones,
    datosImportados,
    setMapeo,
    cargarArchivo,
    onConstruirInscripcionesImportadas,
    onToggleUsuariosAbiertos,
    onInscribirAlumno,
    onEliminarInscripcion,
    onActualizarInscripcion,
    onGuardarInscripciones,
    hayCambiosInscripciones,
    guardandoInscripciones
}: {
    usuariosAbiertos: boolean,
    cursoArmadoLocal: cursoArmado,
    usuarios: usuario[],
    mensajeInscripciones: string | null,
    datosImportados: DatosImportados,
    setMapeo: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    cargarArchivo: (file: File) => Promise<void>,
    onConstruirInscripcionesImportadas: () => void,
    onToggleUsuariosAbiertos: () => void,
    onInscribirAlumno: (usuario: usuario) => Promise<void>,
    onEliminarInscripcion: (idInscripcion: number) => Promise<void>,
    onActualizarInscripcion: (idInscripcion: number, propiedad: keyof inscripcion, nuevoValor: boolean | number | undefined) => void,
    onGuardarInscripciones: () => Promise<void>,
    hayCambiosInscripciones: boolean,
    guardandoInscripciones: boolean
}) {
    return (
        <Card className="mb-10">
            {/* Header con toggle + agregar */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                    onClick={onToggleUsuariosAbiertos}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-900 hover:bg-sky-800 border border-sky-700 rounded-xl text-sky-100 font-semibold text-base transition cursor-pointer"
                >
                    <span>Estudiantes</span>
                    <span className="px-2 py-0.5 bg-sky-700 rounded-full text-sm font-bold">
                        {cursoArmadoLocal.inscripciones.length}
                    </span>
                    <span className="ml-1 text-sky-400">{usuariosAbiertos ? '▲' : '▼'}</span>
                </button>

                <Example
                    titulo="+ Agregar alumno"
                    noCambiarNombreAlSeleccionar
                    callbackOnSelect={(usuarioSeleccionado) => {
                        if (usuarioSeleccionado) void onInscribirAlumno(usuarioSeleccionado)
                    }}
                    opciones={usuarios.map(usuario => ({ nombre: `${usuario.nombre} #${usuario.indice_suscriptor}`, opcion: usuario }))}
                />
            </div>

            {/* Mensajes / import / upload */}
            {mensajeInscripciones ? (
                <p className="text-zinc-300 text-sm bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 mt-2">
                    {mensajeInscripciones}
                </p>
            ) : datosImportados ? (
                <div className="mt-4 border border-zinc-700 bg-zinc-800/60 rounded-xl p-6 flex flex-col gap-5 items-center">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-white">
                            Relacionar columnas
                        </h2>
                        <span className="text-sm text-zinc-400">{datosImportados.filas.length} fila(s) detectadas</span>
                    </div>

                    <p className="text-xs text-amber-400 bg-amber-950/50 border border-amber-800 rounded-lg px-4 py-2 text-center max-w-lg">
                        No se agregarán alumnos ya inscritos ni alumnos cuyo RUT no pertenezca a un usuario existente.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 w-full">
                        {[
                            { label: 'RUT', key: 'rut' },
                            { label: 'Asistencias', key: 'asistencias' },
                            { label: 'Teórica', key: 'teorica' },
                            { label: 'Práctica', key: 'calificacion' },
                        ].map(({ label, key }) => (
                            <div key={key} className="flex flex-col gap-1 items-center min-w-[120px]">
                                <FieldLabel>{label}</FieldLabel>
                                <Example
                                    opciones={datosImportados.cabeceras}
                                    callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, [key]: opcion }))}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onConstruirInscripcionesImportadas}
                        className="px-6 py-2.5 bg-sky-700 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg border border-sky-600 transition cursor-pointer"
                    >
                        Crear inscripciones
                    </button>
                </div>
            ) : (
                <div className="mt-4">
                    <FieldLabel>Importar desde Excel</FieldLabel>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) void cargarArchivo(file)
                        }}
                        className="mt-2 w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                    />
                </div>
            )}

            {/* Tabla de inscripciones */}
            {usuariosAbiertos && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm border-collapse min-w-[540px]">
                        <thead>
                            <tr className="bg-zinc-800 border-b border-zinc-700">
                                {['', 'Nombre', 'Asistencias', 'Nota práctica', 'Nota teórica', 'Notificar'].map(h => (
                                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 first:text-center">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {cursoArmadoLocal.inscripciones.map(inscripcion => (
                                <InscripcionRow
                                    key={inscripcion.id_inscripcion}
                                    inscripcion={inscripcion}
                                    onEliminarInscripcion={onEliminarInscripcion}
                                    onActualizarInscripcion={onActualizarInscripcion}
                                />
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => { void onGuardarInscripciones() }}
                            disabled={!hayCambiosInscripciones || guardandoInscripciones}
                            className={`
                                px-8 py-2.5 rounded-lg text-sm font-semibold transition-all
                                ${!hayCambiosInscripciones || guardandoInscripciones
                                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer'}
                            `}
                        >
                            {guardandoInscripciones ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </span>
                            ) : 'Guardar cambios de estudiantes'}
                        </button>
                    </div>
                </div>
            )}
        </Card>
    )
}

// ─── InscripcionRow ───────────────────────────────────────────────────────────

const tableInputBase =
    "w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition"

const InscripcionRow = ({
    inscripcion,
    onEliminarInscripcion,
    onActualizarInscripcion
}: {
    inscripcion: inscripcion,
    onEliminarInscripcion: (idInscripcion: number) => Promise<void>,
    onActualizarInscripcion: (idInscripcion: number, propiedad: keyof inscripcion, nuevoValor: boolean | number | undefined) => void
}) => {
    return (
        <tr className="hover:bg-zinc-800/50 transition-colors">
            <td className="px-3 py-2 text-center">
                <button
                    onClick={() => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            void onEliminarInscripcion(inscripcion.id_inscripcion)
                        }
                    }}
                    className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                    title="Eliminar"
                >
                    ✕
                </button>
            </td>

            <td className="px-3 py-2 text-zinc-200 font-medium whitespace-nowrap">
                {inscripcion.usuario?.nombre}
            </td>

            <td className="px-3 py-2">
                <input
                    type="number"
                    value={inscripcion.asistencias ?? ''}
                    onChange={(e) => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            onActualizarInscripcion(inscripcion.id_inscripcion, 'asistencias', parseOptionalNumber(e.target.value))
                        }
                    }}
                    className={tableInputBase}
                />
            </td>

            <td className="px-3 py-2">
                <input
                    type="number"
                    value={inscripcion.calificacion ?? ''}
                    onChange={(e) => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            onActualizarInscripcion(inscripcion.id_inscripcion, 'calificacion', parseOptionalNumber(e.target.value))
                        }
                    }}
                    className={tableInputBase}
                />
            </td>

            <td className="px-3 py-2">
                <input
                    type="number"
                    value={inscripcion.teorica ?? ''}
                    onChange={(e) => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            onActualizarInscripcion(inscripcion.id_inscripcion, 'teorica', parseOptionalNumber(e.target.value))
                        }
                    }}
                    className={tableInputBase}
                />
            </td>

            <td className="px-3 py-2 text-center">
                <input
                    type="checkbox"
                    checked={Boolean(inscripcion.notificar)}
                    onChange={(e) => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            onActualizarInscripcion(inscripcion.id_inscripcion, 'notificar', e.target.checked)
                        }
                    }}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
            </td>
        </tr>
    )
}

// ─── EstadoCursoAcciones ──────────────────────────────────────────────────────

export function EstadoCursoAcciones({
    enviandoEncuestasDeSatisfaccion,
    encuestasDeSatisfaccionEnvidasCorrectamente,
    onCambiarEstado,
    onMandarEncuestasDeSatisfaccion
}: {
    enviandoEncuestasDeSatisfaccion: boolean,
    encuestasDeSatisfaccionEnvidasCorrectamente: boolean,
    onCambiarEstado: (estado: NonNullable<cursoArmado['estado']>) => Promise<void>,
    onMandarEncuestasDeSatisfaccion: () => Promise<void>
}) {
    return (
        <div className="mt-10 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Acciones del curso</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                    onClick={() => { void onCambiarEstado('ACTIVO') }}
                    className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                    ▶ Iniciar
                </button>

                <button
                    onClick={() => { void onCambiarEstado('INACTIVO') }}
                    className="py-2.5 px-5 rounded-xl bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-semibold transition cursor-pointer"
                >
                    ⏸ Desactivar
                </button>

                <button
                    onClick={() => { void onCambiarEstado('FINALIZADO') }}
                    className="py-2.5 px-5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-sm font-semibold transition shadow-lg shadow-sky-900/30 cursor-pointer"
                >
                    ✓ Finalizar
                </button>
            </div>

            {encuestasDeSatisfaccionEnvidasCorrectamente ? (
                <div className="py-2.5 px-5 rounded-xl bg-emerald-900/60 text-emerald-300 text-sm font-semibold text-center border border-emerald-700">
                    ✓ Encuestas de satisfacción enviadas correctamente
                </div>
            ) : (
                <button
                    onClick={() => { void onMandarEncuestasDeSatisfaccion() }}
                    disabled={enviandoEncuestasDeSatisfaccion}
                    className={`
                        py-2.5 px-5 rounded-xl text-sm font-semibold transition cursor-pointer
                        ${enviandoEncuestasDeSatisfaccion
                            ? 'bg-amber-800 text-amber-200 cursor-not-allowed'
                            : 'bg-indigo-800 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30'}
                    `}
                >
                    {enviandoEncuestasDeSatisfaccion ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando encuestas...
                        </span>
                    ) : '✉ Mandar encuestas de satisfacción'}
                </button>
            )}
        </div>
    )
}

export { COTIZACION_FIELDS, INICIO_FIELDS }