import { useEffect, useMemo, useState } from "react"
import { b2Url, b2UsuarioBucket } from "../../../vars"
import type { usuario } from "../Api/usuarios"
import {
    actualizarParametrosDeSuscriptorAsync,
    obtenerParametrosDeSuscriptorAsync,
    type parametrosSuscriptor,
} from "../Api/suscripciones"
import { Example } from "../Componentes/DropdownMenu"

type ParametrosProps = {
    idSuscriptor: number
    usuarios: usuario[]
}

const parametrosVacios: parametrosSuscriptor = {
    certificador: null,
    inicio_contador_certificados: 0,
    contador_cotizaciones: 0,
}

export default function Parametros({ idSuscriptor, usuarios }: ParametrosProps) {
    const [parametrosGuardados, setParametrosGuardados] = useState<parametrosSuscriptor>(parametrosVacios)
    const [parametrosEditados, setParametrosEditados] = useState<parametrosSuscriptor>(parametrosVacios)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState<string | null>(null)

    useEffect(() => {
        let activo = true

        ; (async () => {
            setCargando(true)
            setMensaje(null)

            try {
                const parametros = await obtenerParametrosDeSuscriptorAsync(idSuscriptor)

                if (!activo) return

                setParametrosGuardados(parametros)
                setParametrosEditados(parametros)
            } catch (e) {
                if (!activo) return

                setMensaje(e instanceof Error ? e.message : 'No se pudieron cargar los parametros.')
            } finally {
                if (activo) setCargando(false)
            }
        })()

        return () => {
            activo = false
        }
    }, [idSuscriptor])

    const opcionesUsuarios = useMemo(() => {
        return usuarios.map(usuario => ({
            nombre: usuario.nombre ?? `Usuario ${usuario.id}`,
            opcion: usuario
        }))
    }, [usuarios])

    const hayCambios =
        (parametrosEditados.certificador?.id ?? null) !== (parametrosGuardados.certificador?.id ?? null) ||
        Number(parametrosEditados.inicio_contador_certificados) !== Number(parametrosGuardados.inicio_contador_certificados) ||
        Number(parametrosEditados.contador_cotizaciones) !== Number(parametrosGuardados.contador_cotizaciones)

    async function guardarCambios() {
        if (!hayCambios || guardando) return

        setGuardando(true)
        setMensaje(null)

        try {
            const guardados = await actualizarParametrosDeSuscriptorAsync(idSuscriptor, {
                certificador: parametrosEditados.certificador?.id ?? null,
                inicio_contador_certificados: Number(parametrosEditados.inicio_contador_certificados) || 0,
                contador_cotizaciones: Number(parametrosEditados.contador_cotizaciones) || 0,
            })

            setParametrosGuardados(guardados)
            setParametrosEditados(guardados)
            setMensaje('Parametros guardados correctamente.')
        } catch (e) {
            setMensaje(e instanceof Error ? e.message : 'No se pudieron guardar los parametros.')
        } finally {
            setGuardando(false)
        }
    }

    if (cargando) {
        return <p className="text-center opacity-80">Cargando parametros...</p>
    }

    return (
        <div className="w-full max-w-4xl mx-auto border border-white/10 bg-white/5 rounded-xl p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold">Parametros</h2>
                <p className="text-sm opacity-75">
                    Cada suscriptor mantiene su propio certificador, su inicio de contador y su inicio de cotizador.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm opacity-75">Certificador</span>
                        <Example
                            opciones={opcionesUsuarios}
                            seleccionado={parametrosEditados.certificador?.nombre ?? null}
                            titulo={parametrosEditados.certificador?.nombre ?? 'Seleccionar usuario'}
                            callbackOnSelect={(usuarioSeleccionado) => {
                                setParametrosEditados(last => ({
                                    ...last,
                                    certificador: usuarioSeleccionado
                                }))
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setParametrosEditados(last => ({
                                ...last,
                                certificador: null
                            }))
                        }}
                        className="w-fit px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                    >
                        Limpiar certificador
                    </button>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm opacity-75">Inicio de contador</span>
                        <input
                            type="number"
                            min={0}
                            value={parametrosEditados.inicio_contador_certificados}
                            onChange={(e) => {
                                setParametrosEditados(last => ({
                                    ...last,
                                    inicio_contador_certificados: Math.max(0, Number(e.target.value) || 0)
                                }))
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </label>

                    <p className="text-sm opacity-75">
                        Si aqui pones <strong>100</strong>, el siguiente certificado quedara contado desde el 101.
                    </p>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm opacity-75">Inicio de cotizador</span>
                        <input
                            type="number"
                            min={0}
                            value={parametrosEditados.contador_cotizaciones}
                            onChange={(e) => {
                                setParametrosEditados(last => ({
                                    ...last,
                                    contador_cotizaciones: Math.max(0, Number(e.target.value) || 0)
                                }))
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </label>

                    <p className="text-sm opacity-75">
                        Si aqui pones <strong>100</strong>, la siguiente cotizacion usara el 101.
                    </p>
                </div>

                <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Vista previa</h3>

                    {parametrosEditados.certificador?.firma ? (
                        <img
                            src={`https://${b2UsuarioBucket}.${b2Url}/${parametrosEditados.certificador.firma}`}
                            alt="Firma del certificador"
                            className="h-24 object-contain bg-white rounded p-2"
                        />
                    ) : (
                        <div className="h-24 rounded bg-slate-900/60 border border-dashed border-white/15 flex items-center justify-center text-sm opacity-70">
                            Sin firma cargada
                        </div>
                    )}

                    <div className="text-sm leading-6">
                        <p><span className="opacity-70">Nombre:</span> {parametrosEditados.certificador?.nombre ?? 'Sin seleccionar'}</p>
                        <p><span className="opacity-70">Especialidad:</span> {parametrosEditados.certificador?.especialidad ?? 'Sin dato'}</p>
                        <p><span className="opacity-70">Inicio contador:</span> {parametrosEditados.inicio_contador_certificados}</p>
                        <p><span className="opacity-70">Inicio cotizador:</span> {parametrosEditados.contador_cotizaciones}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm min-h-5 opacity-80">{mensaje}</p>
                <button
                    type="button"
                    onClick={guardarCambios}
                    disabled={!hayCambios || guardando}
                    className={`${!hayCambios || guardando ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} px-4 py-2 rounded font-medium`}
                >
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </div>
    )
}
