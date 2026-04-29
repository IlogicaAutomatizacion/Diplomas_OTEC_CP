import type React from "react"
import type { cursoArmado } from "../../Api/cursos-armados"
import type { curso } from "../../Api/cursos"
import type { empresa } from "../../Api/empresas"
import type { usuario } from "../../Api/usuarios"
import ArmarCursoPanelRegistros from "./ArmarCursoPanelRegistros"
import { CotizacionSection, EstadoCursoAcciones, InicioCursoSection, InscripcionesSection } from "./ArmarCursoPanelSections"
import { useArmarCursoPanel } from "./useArmarCursoPanel"

export default function ArmarCursoPanel({
    cursoArmado,
    setCursosArmadosState,
    idSuscriptor,
    uuidSuscriptor,
    setCursoArmadoAVisualizar,
    cursos,
    empresas,
    usuarios
}: {
    cursoArmado: cursoArmado,
    idSuscriptor: number,
    uuidSuscriptor: string,
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>,
    setCursosArmadosState: React.Dispatch<React.SetStateAction<cursoArmado[]>>,
    cursos: curso[],
    empresas: empresa[],
    usuarios: usuario[]
}) {
    const panel = useArmarCursoPanel({
        cursoArmado,
        idSuscriptor,
        uuidSuscriptor,
        setCursoArmadoAVisualizar,
        setCursosArmadosState
    })

    return (
        <div className="flex flex-col gap-4 boder overflow-y-auto pr-1">
            <button
                onClick={panel.volverALaLista}
                className="bg-green-600 hover:bg-green-700 text-white px-4 cursor-pointer py-2 rounded transition w-full sm:w-auto"
            >
                Volver a la lista de cursos armados
            </button>

            <p className="text-slate-600/80">Curso armado ID #{cursoArmado.curso_armado_id}</p>
            {/* El panel principal ahora solo compone secciones y delega la lógica al hook local. */}
            <CotizacionSection
                idSuscriptor={idSuscriptor}
                cursoArmadoLocal={panel.cursoArmadoLocal}
                cursos={cursos}
                empresas={empresas}
                usuarios={usuarios}
                hayCambiosCotizacion={panel.hayCambiosCotizacion}
                guardandoCotizacion={panel.guardandoCotizacion}
                hayFormatoDeCotizacion={panel.hayFormatoDeCotizacion}
                descargandoCotizacion={panel.descargandoCotizacion}
                mandandoCotizacion={panel.mandandoCotizacion}
                cotizacionEnviadaCorrectamente={panel.cotizacionEnviadaCorrectamente}
                setCursoArmadoLocal={panel.setCursoArmadoLocal}
                onGuardarCotizacion={panel.guardarCotizacion}
                onSubirFormatoCotizacion={panel.subirFormatoCotizacion}
                onEliminarFormatoCotizacion={panel.eliminarFormatoCotizacion}
                onDescargarCotizacion={panel.descargarCotizacion}
                onMandarCotizacion={panel.mandarCotizacion}
                cambiarEstadoCotizacion={panel.editarEstadoDeCotizacion}
            />

            <InicioCursoSection
                cursoArmadoLocal={panel.cursoArmadoLocal}
                usuarios={usuarios}
                hayCambiosInicio={panel.hayCambiosInicio}
                guardandoInicio={panel.guardandoInicio}
                setCursoArmadoLocal={panel.setCursoArmadoLocal}
                onGuardarInicio={panel.guardarInicio}
            />

            <InscripcionesSection
                usuariosAbiertos={panel.usuariosAbiertos}
                cursoArmadoLocal={panel.cursoArmadoLocal}
                usuarios={usuarios}
                mensajeInscripciones={panel.mensajeInscripciones}
                datosImportados={panel.datosImportados}
                setMapeo={panel.setMapeo}
                cargarArchivo={panel.cargarArchivo}
                onConstruirInscripcionesImportadas={panel.construirInscripcionesImportadas}
                onToggleUsuariosAbiertos={panel.toggleUsuariosAbiertos}
                onInscribirAlumno={panel.inscribirAlumno}
                onEliminarInscripcion={panel.eliminarInscripcion}
                onActualizarInscripcion={panel.actualizarInscripcion}
                onGuardarInscripciones={panel.guardarInscripciones}
                hayCambiosInscripciones={panel.hayCambiosInscripciones}
                guardandoInscripciones={panel.guardandoInscripciones}
            />

            <EstadoCursoAcciones
                enviandoEncuestasDeSatisfaccion={panel.enviandoEncuestasDeSatisfaccion}
                encuestasDeSatisfaccionEnvidasCorrectamente={panel.encuestasDeSatisfaccionEnvidasCorrectamente}
                onCambiarEstado={panel.cambiarEstado}
                onMandarEncuestasDeSatisfaccion={panel.mandarEncuestasDeSatisfaccion}
            />

            <ArmarCursoPanelRegistros
                idSuscriptor={idSuscriptor}
                curso={cursoArmado.curso}
                uuidSuscriptor={uuidSuscriptor}
                inscripciones={panel.cursoArmadoLocal.inscripciones}
                respuestasCliente={panel.respuestasCliente}
                cliente={panel.cursoArmadoLocal.contactoDeCotizacion}
            />

            <div className="grid grid-cols-1 gap-2 cursor-pointer mt-10">
                <button onClick={() => { void panel.eliminarCursoArmado() }} className="btn h-10 cursor-pointer bg-red-500">
                    Eliminar curso armado
                </button>
            </div>
        </div>
    )
}
