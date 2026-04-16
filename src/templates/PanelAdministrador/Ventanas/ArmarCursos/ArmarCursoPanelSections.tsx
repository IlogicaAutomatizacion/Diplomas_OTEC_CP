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

export function CotizacionSection({
    idSuscriptor,
    cursoArmadoLocal,
    cursos,
    empresas,
    usuarios,
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
    onMandarCotizacion: () => Promise<void>
}) {
    return (
        <>
            <h2 className="text-4xl text-center mt-20">Cotización</h2>

            <div className="border rounded p-10 flex flex-col justify-center items-center gap-10 ">
                <div className="grid grid-cols-2 gap-10">
                    <div id="selector-empresa" className="flex flex-col col-1 row-1">
                        <span className="text-cyan-400 text-center">Empresa</span>
                        <Example
                            seleccionado={cursoArmadoLocal.empresa?.nombre}
                            callbackOnSelect={(empresaSeleccionada) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    empresa: empresaSeleccionada
                                }))
                            }}
                            opciones={empresas.map(empresa => ({ nombre: empresa.nombre, opcion: empresa }))}
                        />
                    </div>

                    <div id="selector-curso" className="flex flex-col col-1 row-2">
                        <span className="text-cyan-400 text-center">Curso</span>
                        <Example
                            seleccionado={cursoArmadoLocal.curso?.nombre}
                            callbackOnSelect={(cursoSeleccionado) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    curso: cursoSeleccionado
                                }))
                            }}
                            opciones={cursos.map(curso => ({ nombre: curso.nombre, opcion: curso }))}
                        />
                    </div>

                    <div id="selector-contacto-de-cotizacion" className="flex flex-col col-1 row-3">
                        <span className="text-cyan-400 text-center">Usuario de contacto</span>
                        <Example
                            seleccionado={cursoArmadoLocal.contactoDeCotizacion?.nombre}
                            callbackOnSelect={(contacto) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    contactoDeCotizacion: contacto
                                }))
                            }}
                            opciones={usuarios.map(usuario => ({ nombre: usuario.nombre, opcion: usuario }))}
                        />
                    </div>

                    <label id="alumnos-cotizados" className="flex flex-col gap-1 col-2 row-1">
                        <span className="text-cyan-200/80">Alumnos cotizados</span>
                        <input
                            type="number"
                            value={cursoArmadoLocal.alumnosCotizados ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    alumnosCotizados: parseOptionalNumber(e.target.value) ?? 0
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label id="valor-de-curso" className="flex flex-col gap-1 col-2 row-2">
                        <span className="text-cyan-200/80">Valor unitario</span>
                        <input
                            type="number"
                            value={cursoArmadoLocal.valorUnitario ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    valorUnitario: parseOptionalNumber(e.target.value) ?? 0
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label id="notas_cotizacion" className="flex flex-col gap-1 row-span-3 row-start-4 col-span-2 resize">
                        <span className="text-cyan-200/80">Notas</span>
                        <textarea
                            value={cursoArmadoLocal.notas_cotizacion ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    notas_cotizacion: e.target.value
                                }))
                            }}
                            className="border bg-transparent p-1 rounded h-auto resize-y"
                        />
                    </label>
                </div>

                <button
                    onClick={() => { void onGuardarCotizacion() }}
                    disabled={!hayCambiosCotizacion || guardandoCotizacion}
                    className={`px-6 py-2 rounded border ${!hayCambiosCotizacion || guardandoCotizacion ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
                >
                    {guardandoCotizacion ? 'Guardando...' : 'Guardar'}
                </button>

                <h3 className="mt-5 text-2xl">Subir formato de cotización</h3>

                {!hayFormatoDeCotizacion ? (
                    <input
                        key={idSuscriptor}
                        type="file"
                        accept=".docx"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                void onSubirFormatoCotizacion(file)
                            }
                        }}
                        className="w-[70%] p-2 bg-slate-700 border rounded cursor-pointer"
                    />
                ) : (
                    <button
                        className="p-2 bg-red-500 cursor-pointer"
                        onClick={() => { void onEliminarFormatoCotizacion() }}
                    >
                        Eliminar formato de cotización
                    </button>
                )}
            </div>

            <button
                id="emitir-cotizacion"
                onClick={() => { void onDescargarCotizacion() }}
                className="btn bg-green-600 h-10 cursor-pointer"
            >
                {descargandoCotizacion ? "Descargando cotización..." : "Descargar cotización"}
            </button>

            {cotizacionEnviadaCorrectamente ? (
                <button className="btn bg-green-600 h-10 cursor-pointer">
                    Cotización enviada correctamente.
                </button>
            ) : mandandoCotizacion ? (
                <button className="btn bg-orange-600 h-10 cursor-pointer">
                    Enviando cotización...
                </button>
            ) : (
                <button
                    id="emitir-cotizacion"
                    onClick={() => { void onMandarCotizacion() }}
                    className="btn bg-blue-600 h-10 cursor-pointer"
                >
                    Mandar cotización
                </button>
            )}
        </>
    )
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
    return (
        <>
            <h2 className="text-4xl text-center mt-15">Inicio de curso</h2>

            <p
                id="estado-curso"
                className={`
                    font-semibold
                    ${cursoArmadoLocal.estado === 'ACTIVO'
                        ? 'text-green-400'
                        : cursoArmadoLocal.estado === 'INACTIVO'
                            ? 'text-red-400'
                            : 'text-fuchsia-400'}
                    text-2xl
                    text-center
                `}
            >
                {cursoArmadoLocal.estado}
            </p>

            <div className="border rounded p-2 flex flex-col justify-center items-center">
                <div className="p-10 grid grid-cols-2 gap-10">
                    <label id="selector-fecha-inicio" className="flex flex-col gap-1">
                        <span className="text-cyan-400">Inicio</span>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_inicio ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    fecha_inicio: e.target.value
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label id="selector-fecha-de-termino" className="flex flex-col gap-1">
                        <span className="text-cyan-400">Finalización</span>
                        <input
                            type="date"
                            value={cursoArmadoLocal.fecha_finalizacion ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    fecha_finalizacion: e.target.value
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <div id="selector-profesor" className="flex flex-col col-1 row-3">
                        <span className="text-cyan-400 text-center">Profesor</span>
                        <Example
                            seleccionado={cursoArmadoLocal.profesor?.nombre}
                            callbackOnSelect={(profesor) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    profesor
                                }))
                            }}
                            opciones={usuarios.map(usuario => ({ nombre: usuario.nombre, opcion: usuario }))}
                        />
                    </div>

                    <label id="nota-aprobatoria-1" className="flex flex-col gap-1 order-3 col-1 row-2">
                        <span className="text-cyan-200">Nota aprobatoria 1 (teorica)</span>
                        <input
                            type="number"
                            value={cursoArmadoLocal.teorica ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    teorica: parseOptionalNumber(e.target.value)
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label id="nota-aprobatoria-2" className="flex flex-col gap-1 order-6 col-2 row-2">
                        <span className="text-cyan-200">Nota aprobatoria 2 (practica)</span>
                        <input
                            type="number"
                            value={cursoArmadoLocal.calificacion_aprobatoria ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    calificacion_aprobatoria: parseOptionalNumber(e.target.value)
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>

                    <label id="lugar_de_realizacion" className="flex flex-col gap-1 col-2 row-3">
                        <span className="text-cyan-200/80">Lugar de realización</span>
                        <input
                            type="text"
                            value={cursoArmadoLocal.lugar_de_realizacion ?? ''}
                            onChange={(e) => {
                                setCursoArmadoLocal(prev => ({
                                    ...prev,
                                    lugar_de_realizacion: e.target.value
                                }))
                            }}
                            className="border bg-transparent p-1 rounded"
                        />
                    </label>
                </div>

                <button
                    onClick={() => { void onGuardarInicio() }}
                    disabled={!hayCambiosInicio || guardandoInicio}
                    className={`px-6 py-2 rounded border ${!hayCambiosInicio || guardandoInicio ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
                >
                    {guardandoInicio ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </>
    )
}

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
        <div className="border rounded p-2 flex flex-col justify-center items-center mb-10">
            <div className="flex items-center gap-2">
                <h3
                    onClick={onToggleUsuariosAbiertos}
                    className="cursor-pointer text-3xl font-medium mr-5 p-4 bg-cyan-800 border-2 rounded-2xl hover:bg-cyan-800"
                >
                    Estudiantes ({cursoArmadoLocal.inscripciones.length})
                </h3>

                <Example
                    titulo="Agregar"
                    noCambiarNombreAlSeleccionar
                    callbackOnSelect={(usuarioSeleccionado) => {
                        if (usuarioSeleccionado) {
                            void onInscribirAlumno(usuarioSeleccionado)
                        }
                    }}
                    opciones={usuarios.map(usuario => ({ nombre: usuario.nombre, opcion: usuario }))}
                />
            </div>

            {mensajeInscripciones ? (
                <p className="mt-5">{mensajeInscripciones}</p>
            ) : datosImportados ? (
                <div className="mt-6 border p-4 rounded flex flex-col gap-6 items-center">
                    <h2 className="text-center text-lg font-medium">
                        Relacionar columnas{" "}
                        <span className="opacity-70">({datosImportados.filas.length} fila(s))</span>
                    </h2>

                    <h3 className="text-sm sm:text-3xl font-semibold text-center">
                        No se agregarán alumnos que ya estén inscritos o alumnos cuyo rut no pertenezca a un usuario.
                    </h3>

                    <div className="flex justify-center flex-row items-center gap-4 w-full">
                        <div className="flex flex-col gap-1 items-center">
                            <span>RUT</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, rut: opcion }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Asistencias</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, asistencias: opcion }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Teórica</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, teorica: opcion }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span>Práctica</span>
                            <Example
                                opciones={datosImportados.cabeceras}
                                callbackOnSelect={(opcion) => setMapeo(last => ({ ...last, calificacion: opcion }))}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onConstruirInscripcionesImportadas}
                        className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded border transition"
                    >
                        Crear inscripciones
                    </button>
                </div>
            ) : (
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            void cargarArchivo(file)
                        }
                    }}
                    className="mx-10 w-[70%] mt-5 p-2 bg-slate-700 border rounded cursor-pointer"
                />
            )}

            {usuariosAbiertos && (
                <div className="mt-3 overflow-x-auto w-[95%] py-3">
                    <div className="grid grid-cols-6 gap-2 text-center text-sm min-w-[500px]">
                        {['Eliminar', 'Nombre', 'Asistencias', 'Nota práctica', 'Nota teórica', 'Notificar'].map(header => (
                            <div key={header} className="bg-neutral-700 p-1 border">
                                {header}
                            </div>
                        ))}

                        {cursoArmadoLocal.inscripciones.map(inscripcion => (
                            <InscripcionRow
                                key={inscripcion.id_inscripcion}
                                inscripcion={inscripcion}
                                onEliminarInscripcion={onEliminarInscripcion}
                                onActualizarInscripcion={onActualizarInscripcion}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => { void onGuardarInscripciones() }}
                        disabled={!hayCambiosInscripciones || guardandoInscripciones}
                        className={`mt-4 px-6 py-2 rounded border ${!hayCambiosInscripciones || guardandoInscripciones ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
                    >
                        {guardandoInscripciones ? 'Guardando...' : 'Guardar cambios de estudiantes'}
                    </button>
                </div>
            )}
        </div>
    )
}

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
        <>
            <button
                onClick={() => {
                    if (inscripcion.id_inscripcion !== undefined) {
                        void onEliminarInscripcion(inscripcion.id_inscripcion)
                    }
                }}
                className="bg-red-500 hover:bg-red-600 transition text-white"
            >
                X
            </button>

            <div className="border p-1">{inscripcion.usuario?.nombre}</div>

            <input
                type="number"
                value={inscripcion.asistencias ?? ''}
                onChange={(e) => {
                    if (inscripcion.id_inscripcion !== undefined) {
                        onActualizarInscripcion(inscripcion.id_inscripcion, 'asistencias', parseOptionalNumber(e.target.value))
                    }
                }}
                className="border p-1"
            />

            <input
                type="number"
                value={inscripcion.calificacion ?? ''}
                onChange={(e) => {
                    if (inscripcion.id_inscripcion !== undefined) {
                        onActualizarInscripcion(inscripcion.id_inscripcion, 'calificacion', parseOptionalNumber(e.target.value))
                    }
                }}
                className="border p-1"
            />

            <input
                type="number"
                value={inscripcion.teorica ?? ''}
                onChange={(e) => {
                    if (inscripcion.id_inscripcion !== undefined) {
                        onActualizarInscripcion(inscripcion.id_inscripcion, 'teorica', parseOptionalNumber(e.target.value))
                    }
                }}
                className="border p-1"
            />

            <div className="flex justify-center items-center">
                <input
                    className="size-10"
                    type="checkbox"
                    checked={Boolean(inscripcion.notificar)}
                    onChange={(e) => {
                        if (inscripcion.id_inscripcion !== undefined) {
                            onActualizarInscripcion(inscripcion.id_inscripcion, 'notificar', e.target.checked)
                        }
                    }}
                />
            </div>
        </>
    )
}

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
        <div className="grid grid-cols-1 gap-2 cursor-pointer mt-10">
            <button
                onClick={() => { void onCambiarEstado('ACTIVO') }}
                className="btn cursor-pointer h-10 bg-green-600"
            >
                Iniciar
            </button>

            <button
                onClick={() => { void onCambiarEstado('INACTIVO') }}
                className="btn cursor-pointer h-10 bg-gray-500"
            >
                Desactivar
            </button>

            <button
                onClick={() => { void onCambiarEstado('FINALIZADO') }}
                className="btn cursor-pointer h-10 bg-blue-500"
            >
                Finalizar
            </button>

            {encuestasDeSatisfaccionEnvidasCorrectamente ? (
                <button className="btn bg-green-600 h-10 cursor-pointer">
                    Encuestas de satisfacción enviadas correctamente.
                </button>
            ) : enviandoEncuestasDeSatisfaccion ? (
                <button className="btn bg-orange-600 h-10 cursor-pointer">
                    Enviando encuestas de satisfacción...
                </button>
            ) : (
                <button
                    onClick={() => { void onMandarEncuestasDeSatisfaccion() }}
                    className="btn cursor-pointer h-10 bg-blue-900"
                >
                    Mandar encuestas de satisfacción
                </button>
            )}
        </div>
    )
}

export { COTIZACION_FIELDS, INICIO_FIELDS }
