import { useEffect, useState } from "react"
import type React from "react"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync, descargarCotizacionAsync, mandarCotizacionDeCurso, mandarEncuestasDeSatisfaccion, type cursoArmado } from "../../Api/cursos-armados"
import { obtenerFormatoEncuestaSatisfaccionClienteAsync, obtenerRespuestaEncuestaPorCursoArmadoAsync } from "../../Api/formatos-dinamicos"
import { crearInscripcionAsync, crearInscripcionesAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../../Api/inscripciones"
import type { usuario } from "../../Api/usuarios"
import { comprobarFormatoDeCotizacion, eliminarFormatoDeCotizacion, subirArchivoParaFormatoDeCotizacion } from "../../Api/suscripciones"
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { normalizarRut, parseOptionalNumber, tieneDatosImportables, type ImportOmitido } from "../../Componentes/importReport"
import type { RespuestaEncuesta } from "../../Componentes/CreadorDeEncuesta"
import { COTIZACION_FIELDS, INICIO_FIELDS, getRelacionId } from "./armarCursoPanel.utils"

type EstadoCurso = NonNullable<cursoArmado['estado']>

export function useArmarCursoPanel({
    cursoArmado,
    idSuscriptor,
    uuidSuscriptor,
    setCursoArmadoAVisualizar,
    setCursosArmadosState
}: {
    cursoArmado: cursoArmado,
    idSuscriptor: number,
    uuidSuscriptor: string,
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>,
    setCursosArmadosState: React.Dispatch<React.SetStateAction<cursoArmado[]>>
}) {
    const [usuariosAbiertos, setUsuariosAbiertos] = useState(false)

    // Guardamos una copia editable y otra persistida para habilitar guardado explícito por sección.
    const [cursoArmadoLocal, setCursoArmadoLocal] = useState<cursoArmado>(cursoArmado)
    const [cursoArmadoGuardado, setCursoArmadoGuardado] = useState<cursoArmado>(cursoArmado)
    const [mensajeInscripciones, setMensajeInscripciones] = useState<string | null>(null)
    const [hayFormatoDeCotizacion, setHayFormatoDeCotizacion] = useState(true)
    const [mandandoCotizacion, setMandandoCotizacion] = useState(false)
    const [cotizacionEnviadaCorrectamente, setCotizacionEnviadaCorrectamente] = useState(false)
    const [encuestasDeSatisfaccionEnvidasCorrectamente, setEncuestasDeSatisfaccionEnvidasCorrectamente] = useState(false)
    const [enviandoEncuestasDeSatisfaccion, setEnviandoEncuestasDeSatisfaccion] = useState(false)
    const [respuestasCliente, setRespuestasCliente] = useState<RespuestaEncuesta[] | null>()
    const [descargandoCotizacion, setDescargandoCotizacion] = useState(false)
    const [guardandoCotizacion, setGuardandoCotizacion] = useState(false)
    const [guardandoInicio, setGuardandoInicio] = useState(false)
    const [guardandoInscripciones, setGuardandoInscripciones] = useState(false)
    const [omitidosImportacionInscripciones, setOmitidosImportacionInscripciones] = useState<ImportOmitido[]>([])

    const actualizarCursoArmadoEnPadre = (cambios: Partial<cursoArmado>) => {
        setCursosArmadosState(prev =>
            prev.map(curso =>
                curso.curso_armado_id === cursoArmadoLocal.curso_armado_id
                    ? { ...curso, ...cambios }
                    : curso
            )
        )
    }

    const reemplazarCursoArmado = (actualizado: cursoArmado) => {
        setCursoArmadoLocal(actualizado)
        setCursoArmadoGuardado(actualizado)
        setCursosArmadosState(prev =>
            prev.map(curso =>
                curso.curso_armado_id === actualizado.curso_armado_id
                    ? actualizado
                    : curso
            )
        )
    }

    const {
        datosImportados,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<inscripcion>(async (inscripcionesExcel) => {
        const candidatos = inscripcionesExcel.filter(tieneDatosImportables)

        try {
            setMensajeInscripciones('Creando inscripciones...')
            const rutsAntes = new Set(
                cursoArmadoLocal.inscripciones
                    .map(inscripcion => normalizarRut(inscripcion.usuario?.rut))
                    .filter(Boolean)
            )

            const cursoArmadoActualizado = await crearInscripcionesAsync(
                candidatos.filter(inscripcion => inscripcion.rut)
            )

            const rutsDespues = new Set(
                cursoArmadoActualizado.inscripciones
                    .map(inscripcion => normalizarRut(inscripcion.usuario?.rut))
                    .filter(Boolean)
            )
            const rutsCreados = new Set([...rutsDespues].filter(rut => !rutsAntes.has(rut)))
            const rutsConsumidos = new Set<string>()

            setOmitidosImportacionInscripciones(candidatos.flatMap(inscripcion => {
                const rut = normalizarRut(inscripcion.rut)
                const etiqueta = inscripcion.rut || 'Fila sin RUT'

                if (!rut) return [{ etiqueta, motivo: 'RUT vacio o invalido.' }]
                if (rutsAntes.has(rut)) return [{ etiqueta, motivo: 'El usuario ya estaba inscrito en este curso.' }]
                if (rutsCreados.has(rut) && !rutsConsumidos.has(rut)) {
                    rutsConsumidos.add(rut)
                    return []
                }

                return [{ etiqueta, motivo: 'No existe un usuario con ese RUT en la suscripcion o estaba duplicado en el archivo.' }]
            }))
            reemplazarCursoArmado(cursoArmadoActualizado)
        } catch (e) {
            setOmitidosImportacionInscripciones(candidatos.map(inscripcion => ({
                etiqueta: inscripcion.rut || 'Fila sin RUT',
                motivo: e instanceof Error ? e.message : 'No se pudieron crear las inscripciones.',
            })))
        } finally {
            setMensajeInscripciones(null)
        }
    })

    const handleCargarArchivo = async (file: File) => {
        setOmitidosImportacionInscripciones([])
        await cargarArchivo(file)
    }

    useEffect(() => {
        ; (async () => {
            try {
                setHayFormatoDeCotizacion(await comprobarFormatoDeCotizacion(idSuscriptor))
            } catch {
                setHayFormatoDeCotizacion(false)
            }
        })()
    }, [idSuscriptor])

    useEffect(() => {
        setCursoArmadoLocal(cursoArmado)
        setCursoArmadoGuardado(cursoArmado)
    }, [cursoArmado])

    useEffect(() => {
        ; (async () => {
            if (!cursoArmadoLocal.contactoDeCotizacion?.token) {
                setRespuestasCliente(null)
                return
            }

            const formatoEncuesta = await obtenerFormatoEncuestaSatisfaccionClienteAsync(uuidSuscriptor)
            const respuestas = await obtenerRespuestaEncuestaPorCursoArmadoAsync(
                cursoArmadoLocal.contactoDeCotizacion.token,
                formatoEncuesta.id,
                cursoArmadoLocal.token_curso
            )

            setRespuestasCliente(respuestas ? [respuestas] : null)
        })()
    }, [cursoArmadoLocal.contactoDeCotizacion, cursoArmadoLocal.token_curso, uuidSuscriptor])

    useEffect(() => {
        if (!cotizacionEnviadaCorrectamente) return

        editarEstadoDeCotizacion(true)
        
        const timeoutId = window.setTimeout(() => {
            setCotizacionEnviadaCorrectamente(false)
        }, 2000)

        return () => window.clearTimeout(timeoutId)
    }, [cotizacionEnviadaCorrectamente])

    useEffect(() => {
        if (!encuestasDeSatisfaccionEnvidasCorrectamente) return

        const timeoutId = window.setTimeout(() => {
            setEncuestasDeSatisfaccionEnvidasCorrectamente(false)
        }, 2000)

        return () => window.clearTimeout(timeoutId)
    }, [encuestasDeSatisfaccionEnvidasCorrectamente])

    async function guardarParametro(
        nombreParametro: keyof cursoArmado,
        nuevoValor: string | number | boolean
    ) {
        await actualizarPropiedadDeCursoArmadoAsync(
            cursoArmadoLocal.curso_armado_id,
            nombreParametro,
            nuevoValor
        )
    }

    const hayCambiosSeccion = (campos: readonly (keyof cursoArmado)[]) => (
        campos.some(campo =>
            getRelacionId(cursoArmadoLocal[campo]) !== getRelacionId(cursoArmadoGuardado[campo])
        )
    )

    async function guardarSeccion(
        campos: readonly (keyof cursoArmado)[],
        setGuardando: React.Dispatch<React.SetStateAction<boolean>>
    ) {
        setGuardando(true)

        try {
            let proximoGuardado = cursoArmadoGuardado

            for (const campo of campos) {
                const valorLocal = cursoArmadoLocal[campo]
                const valorGuardado = cursoArmadoGuardado[campo]

                if (getRelacionId(valorLocal) === getRelacionId(valorGuardado)) continue

                const valorParaGuardar = (
                    campo === 'empresa' ||
                    campo === 'curso' ||
                    campo === 'contactoDeCotizacion' ||
                    campo === "vendedor" ||
                    campo === 'profesor'
                )
                    ? getRelacionId(valorLocal)
                    : valorLocal

                if (valorParaGuardar === undefined || valorParaGuardar === null) continue

                await guardarParametro(campo, valorParaGuardar as string | number)
                proximoGuardado = { ...proximoGuardado, [campo]: valorLocal }
            }

            setCursoArmadoGuardado(proximoGuardado)
            actualizarCursoArmadoEnPadre(proximoGuardado)
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(cursoArmadoGuardado)
        } finally {
            setGuardando(false)
        }
    }

    const hayCambiosCotizacion = hayCambiosSeccion(COTIZACION_FIELDS)
    const hayCambiosInicio = hayCambiosSeccion(INICIO_FIELDS)
    const hayCambiosDefaultsInscripciones =
        cursoArmadoLocal.asistencias_por_defecto !== cursoArmadoGuardado.asistencias_por_defecto ||
        cursoArmadoLocal.calificacion_por_defecto !== cursoArmadoGuardado.calificacion_por_defecto ||
        cursoArmadoLocal.teorica_por_defecto !== cursoArmadoGuardado.teorica_por_defecto

    const hayCambiosRegistrosInscripciones = cursoArmadoLocal.inscripciones.some((inscripcionLocal) => {
        const inscripcionGuardada = cursoArmadoGuardado.inscripciones.find(
            i => i.id_inscripcion === inscripcionLocal.id_inscripcion
        )

        if (!inscripcionGuardada) return false

        return inscripcionLocal.asistencias !== inscripcionGuardada.asistencias ||
            inscripcionLocal.calificacion !== inscripcionGuardada.calificacion ||
            inscripcionLocal.teorica !== inscripcionGuardada.teorica ||
            inscripcionLocal.notificar !== inscripcionGuardada.notificar
    })
    const hayCambiosInscripciones = hayCambiosDefaultsInscripciones || hayCambiosRegistrosInscripciones

    const volverALaLista = () => {
        setCursoArmadoAVisualizar(null)
    }

    const eliminarCursoArmado = async () => {
        try {
            await borrarCursoArmadoAsync(cursoArmado.curso_armado_id)

            setCursosArmadosState(prev =>
                prev.filter(c => c.curso_armado_id !== cursoArmado.curso_armado_id)
            )

            volverALaLista()
        } catch (e) {
            console.log(e)
        }
    }

    const guardarCotizacion = () => guardarSeccion(COTIZACION_FIELDS, setGuardandoCotizacion)
    const guardarInicio = () => guardarSeccion(INICIO_FIELDS, setGuardandoInicio)

    const inscribirAlumno = async (usuario: usuario) => {
        if (!usuario.id) return

        try {
            const actualizado = await crearInscripcionAsync({
                cursoArmado: cursoArmadoLocal.curso_armado_id,
                usuario: usuario.id
            })

            reemplazarCursoArmado(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    const eliminarInscripcion = async (idInscripcion: number) => {
        try {
            const actualizado = await eliminarInscripcionAsync(idInscripcion)
            reemplazarCursoArmado(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    const actualizarInscripcion = (
        idInscripcion: number,
        propiedad: keyof inscripcion,
        nuevoValor: boolean | number | undefined
    ) => {
        setCursoArmadoLocal(prev => ({
            ...prev,
            inscripciones: prev.inscripciones.map(inscripcion =>
                inscripcion.id_inscripcion === idInscripcion
                    ? { ...inscripcion, [propiedad]: nuevoValor }
                    : inscripcion
            )
        }))
    }

    const guardarInscripciones = async () => {
        if (!hayCambiosInscripciones) return

        setGuardandoInscripciones(true)

        try {
            let cursoActualizado: cursoArmado = cursoArmadoLocal
            let inscripcionesActualizadas = cursoArmadoLocal.inscripciones

            const defaultsInscripciones = [
                'asistencias_por_defecto',
                'calificacion_por_defecto',
                'teorica_por_defecto',
            ] as const satisfies readonly (keyof cursoArmado)[]

            for (const campo of defaultsInscripciones) {
                const valorLocal = cursoArmadoLocal[campo]

                if (valorLocal === cursoArmadoGuardado[campo]) continue
                if (valorLocal === undefined || valorLocal === null) continue

                await guardarParametro(campo, valorLocal as number)
                cursoActualizado = { ...cursoActualizado, [campo]: valorLocal }
            }

            for (const inscripcionLocal of cursoArmadoLocal.inscripciones) {
                const id = inscripcionLocal.id_inscripcion
                if (!id) continue

                const inscripcionGuardada = cursoArmadoGuardado.inscripciones.find(i => i.id_inscripcion === id)
                if (!inscripcionGuardada) continue

                const payload: {
                    asistencias?: number,
                    calificacion?: number,
                    teorica?: number,
                    notificar?: boolean
                } = {}

                if (inscripcionLocal.asistencias !== inscripcionGuardada.asistencias) {
                    payload.asistencias = inscripcionLocal.asistencias
                }

                if (inscripcionLocal.calificacion !== inscripcionGuardada.calificacion) {
                    payload.calificacion = inscripcionLocal.calificacion
                }

                if (inscripcionLocal.teorica !== inscripcionGuardada.teorica) {
                    payload.teorica = inscripcionLocal.teorica
                }

                if (inscripcionLocal.notificar !== inscripcionGuardada.notificar) {
                    payload.notificar = inscripcionLocal.notificar
                }

                if (Object.keys(payload).length === 0) continue

                const inscripcionActualizada = await editarInscripcionAsync(id, payload)

                inscripcionesActualizadas = inscripcionesActualizadas.map(inscripcion =>
                    inscripcion.id_inscripcion === id ? inscripcionActualizada : inscripcion
                )
            }

            reemplazarCursoArmado({
                ...cursoActualizado,
                inscripciones: inscripcionesActualizadas
            })
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(cursoArmadoGuardado)
        } finally {
            setGuardandoInscripciones(false)
        }
    }

    const construirInscripcionesImportadas = () => {
        construirResultado((fila, mapeo) => ({
            cursoArmado: cursoArmadoLocal.curso_armado_id,
            rut: fila[mapeo.rut] ? String(fila[mapeo.rut]).trim() : undefined,
            asistencias: parseOptionalNumber(fila[mapeo.asistencias]),
            calificacion: parseOptionalNumber(fila[mapeo.calificacion]),
            teorica: parseOptionalNumber(fila[mapeo.teorica]),
        }))
    }

    const subirFormatoCotizacion = async (file: File) => {
        try {
            await subirArchivoParaFormatoDeCotizacion(idSuscriptor, file)
            setHayFormatoDeCotizacion(true)
        } catch {
            setHayFormatoDeCotizacion(false)
        }
    }

    const eliminarFormatoCotizacionHandler = async () => {
        const result = await eliminarFormatoDeCotizacion(idSuscriptor)

        if (result === true) {
            setHayFormatoDeCotizacion(false)
        }
    }

    const descargarCotizacionHandler = async () => {
        if (descargandoCotizacion) return

        try {
            setDescargandoCotizacion(true)
            await descargarCotizacionAsync(cursoArmadoLocal.curso_armado_id)
        } finally {
            setDescargandoCotizacion(false)
        }
    }

    const mandarCotizacionHandler = async () => {
        if (mandandoCotizacion) return

        setMandandoCotizacion(true)

        try {
            await mandarCotizacionDeCurso(cursoArmadoLocal.curso_armado_id)
            setCotizacionEnviadaCorrectamente(true)
        } finally {
            setMandandoCotizacion(false)
        }
    }

    const cambiarEstado = async (estado: EstadoCurso) => {
        if (cursoArmadoLocal.estado === estado) return

        const estadoAnterior = cursoArmadoLocal.estado

        setCursoArmadoLocal(prev => ({
            ...prev,
            estado
        }))

        try {
            await guardarParametro('estado', estado)
            setCursoArmadoGuardado(prev => ({
                ...prev,
                estado
            }))
            actualizarCursoArmadoEnPadre({ estado })
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(prev => ({
                ...prev,
                estado: estadoAnterior
            }))
        }
    }

    const editarEstadoDeCotizacion = async (cotizado: boolean) => {
        if (cursoArmadoLocal.cotizado === cotizado) return

        const estadoAnterior = cursoArmadoLocal.cotizado

        setCursoArmadoLocal(prev => ({
            ...prev,
            cotizado
        }))

        try {
            await guardarParametro('cotizado', cotizado)
            setCursoArmadoGuardado(prev => ({
                ...prev,
                cotizado
            }))
            actualizarCursoArmadoEnPadre({ cotizado })
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(prev => ({
                ...prev,
                cotizado: estadoAnterior
            }))
        }
    }

    const mandarEncuestasDeSatisfaccionHandler = async () => {
        if (enviandoEncuestasDeSatisfaccion) return

        setEnviandoEncuestasDeSatisfaccion(true)

        try {
            await mandarEncuestasDeSatisfaccion(cursoArmadoLocal.curso_armado_id)
            setEncuestasDeSatisfaccionEnvidasCorrectamente(true)
        } finally {
            setEnviandoEncuestasDeSatisfaccion(false)
        }
    }

    return {
        cursoArmadoLocal,
        respuestasCliente,
        usuariosAbiertos,
        datosImportados,
        omitidosImportacionInscripciones,
        mensajeInscripciones,
        hayFormatoDeCotizacion,
        hayCambiosCotizacion,
        hayCambiosInicio,
        hayCambiosInscripciones,
        guardandoCotizacion,
        guardandoInicio,
        guardandoInscripciones,
        descargandoCotizacion,
        mandandoCotizacion,
        cotizacionEnviadaCorrectamente,
        enviandoEncuestasDeSatisfaccion,
        encuestasDeSatisfaccionEnvidasCorrectamente,
        setCursoArmadoLocal,
        setMapeo,
        cargarArchivo: handleCargarArchivo,
        volverALaLista,
        eliminarCursoArmado,
        guardarCotizacion,
        guardarInicio,
        inscribirAlumno,
        eliminarInscripcion,
        actualizarInscripcion,
        guardarInscripciones,
        construirInscripcionesImportadas,
        toggleUsuariosAbiertos: () => setUsuariosAbiertos(prev => !prev),
        subirFormatoCotizacion,
        eliminarFormatoCotizacion: eliminarFormatoCotizacionHandler,
        descargarCotizacion: descargarCotizacionHandler,
        mandarCotizacion: mandarCotizacionHandler,
        cambiarEstado,
        editarEstadoDeCotizacion,
        mandarEncuestasDeSatisfaccion: mandarEncuestasDeSatisfaccionHandler
    }
}
