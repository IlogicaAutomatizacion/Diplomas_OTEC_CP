import { useEffect, useState } from "react"
import type React from "react"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync, descargarCotizacionAsync, mandarCotizacionDeCurso, mandarEncuestasDeSatisfaccion, type cursoArmado } from "../../Api/cursos-armados"
import { obtenerFormatoEncuestaSatisfaccionClienteAsync, obtenerRespuestaEncuestaPorCursoArmadoAsync } from "../../Api/formatos-dinamicos"
import { crearInscripcionAsync, crearInscripcionesAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../../Api/inscripciones"
import type { usuario } from "../../Api/usuarios"
import { comprobarFormatoDeCotizacion, eliminarFormatoDeCotizacion, subirArchivoParaFormatoDeCotizacion } from "../../Api/suscripciones"
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
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

    const reemplazarCursoArmado = (actualizado: cursoArmado) => {
        setCursoArmadoLocal(actualizado)
        setCursoArmadoGuardado(actualizado)
    }

    const {
        datosImportados,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<inscripcion>(async (inscripcionesExcel) => {
        try {
            setMensajeInscripciones('Creando inscripciones...')

            const cursoArmadoActualizado = await crearInscripcionesAsync(
                inscripcionesExcel.filter(inscripcion => inscripcion.rut)
            )

            reemplazarCursoArmado(cursoArmadoActualizado)
        } finally {
            setMensajeInscripciones(null)
        }
    })

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
    }, [cursoArmado.curso_armado_id])

    useEffect(() => {
        setCursosArmadosState(prev =>
            prev.map(c =>
                c.curso_armado_id === cursoArmadoLocal.curso_armado_id
                    ? cursoArmadoLocal
                    : c
            )
        )
    }, [cursoArmadoLocal, setCursosArmadosState])

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
        nuevoValor: string | number
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
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(cursoArmadoGuardado)
        } finally {
            setGuardando(false)
        }
    }

    const hayCambiosCotizacion = hayCambiosSeccion(COTIZACION_FIELDS)
    const hayCambiosInicio = hayCambiosSeccion(INICIO_FIELDS)
    const hayCambiosInscripciones = cursoArmadoLocal.inscripciones.some((inscripcionLocal) => {
        const inscripcionGuardada = cursoArmadoGuardado.inscripciones.find(
            i => i.id_inscripcion === inscripcionLocal.id_inscripcion
        )

        if (!inscripcionGuardada) return false

        return inscripcionLocal.asistencias !== inscripcionGuardada.asistencias ||
            inscripcionLocal.calificacion !== inscripcionGuardada.calificacion ||
            inscripcionLocal.teorica !== inscripcionGuardada.teorica ||
            inscripcionLocal.notificar !== inscripcionGuardada.notificar
    })

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
            let inscripcionesActualizadas = cursoArmadoLocal.inscripciones

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
                ...cursoArmadoLocal,
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
            asistencias: Number(fila[mapeo.asistencias]) ? Number(fila[mapeo.asistencias]) : undefined,
            calificacion: Number(fila[mapeo.calificacion]) ? Number(fila[mapeo.calificacion]) : undefined,
            teorica: Number(fila[mapeo.teorica]) ? Number(fila[mapeo.teorica]) : undefined,
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
        } catch (e) {
            console.log(e)
            setCursoArmadoLocal(prev => ({
                ...prev,
                estado: estadoAnterior
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
        cargarArchivo,
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
        mandarEncuestasDeSatisfaccion: mandarEncuestasDeSatisfaccionHandler
    }
}
