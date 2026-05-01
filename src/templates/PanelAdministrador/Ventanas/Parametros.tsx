import { useEffect, useMemo, useRef, useState } from "react"
import { b2Url, b2UsuarioBucket } from "../../../vars"
import type { usuario } from "../Api/usuarios"
import {
    actualizarParametrosDeSuscriptorAsync,
    eliminarLogoSuscriptorAsync,
    obtenerParametrosDeSuscriptorAsync,
    subirLogoSuscriptorAsync,
    type parametrosSuscriptor,
} from "../Api/suscripciones"
import { Example } from "../Componentes/DropdownMenu"
import { useSubscriptionRealtime } from "../../../realtime"
import type { SubscriptionRealtimeEvent } from "../../../socket"

type ParametrosProps = {
    idSuscriptor: number
    usuarios: usuario[]
    onLogoChange?: (logoKey: string | null) => void
}

const parametrosVacios: parametrosSuscriptor = {
    certificador: null,
    inicio_contador_certificados: 0,
    contador_cotizaciones: 0,
    logo: null,
}

export default function Parametros({ idSuscriptor, usuarios, onLogoChange }: ParametrosProps) {
    const [parametrosGuardados, setParametrosGuardados] = useState<parametrosSuscriptor>(parametrosVacios)
    const [parametrosEditados, setParametrosEditados] = useState<parametrosSuscriptor>(parametrosVacios)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState<string | null>(null)

    const [logoKey, setLogoKey] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [subiendoLogo, setSubiendoLogo] = useState(false)
    const [mensajeLogo, setMensajeLogo] = useState<string | null>(null)
    const inputLogoRef = useRef<HTMLInputElement>(null)

    async function recargarParametros() {
        setCargando(true)
        setMensaje(null)

        try {
            const parametros = await obtenerParametrosDeSuscriptorAsync(idSuscriptor)
            setParametrosGuardados(parametros)
            setParametrosEditados(parametros)
            setLogoKey(parametros.logo)
            onLogoChange?.(parametros.logo)
        } catch (e) {
            setMensaje(e instanceof Error ? e.message : 'No se pudieron cargar los parametros.')
        } finally {
            setCargando(false)
        }
    }

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
                    setLogoKey(parametros.logo)
                    onLogoChange?.(parametros.logo)
                } catch (e) {
                    if (!activo) return
                    setMensaje(e instanceof Error ? e.message : 'No se pudieron cargar los parametros.')
                } finally {
                    if (activo) setCargando(false)
                }
            })()

        return () => { activo = false }
    }, [idSuscriptor])

    useSubscriptionRealtime(
        idSuscriptor,
        (event: SubscriptionRealtimeEvent) => {
            if (event.resource !== 'parametros') return
            void recargarParametros()
        },
    )

    const opcionesUsuarios = useMemo(() => {
        return usuarios.map(u => ({
            nombre: u.nombre ?? `Usuario ${u.id}`,
            opcion: u,
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

    function onLogoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
        setMensajeLogo(null)
    }

    async function subirLogo() {
        if (!logoFile || subiendoLogo) return
        setSubiendoLogo(true)
        setMensajeLogo(null)

        try {
            const { logo } = await subirLogoSuscriptorAsync(idSuscriptor, logoFile)
            setLogoKey(logo)
            setLogoCacheBuster(Date.now())  // 👈 fuerza re-fetch
            onLogoChange?.(logo)
            setLogoFile(null)
            setLogoPreview(null)
            if (inputLogoRef.current) inputLogoRef.current.value = ''
            setMensajeLogo('Logo guardado correctamente.')
        } catch (e) {
            setMensajeLogo(e instanceof Error ? e.message : 'No se pudo subir el logo.')
        } finally {
            setSubiendoLogo(false)
        }
    }

    async function eliminarLogo() {
        if (subiendoLogo) return
        setSubiendoLogo(true)
        setMensajeLogo(null)

        try {
            await eliminarLogoSuscriptorAsync(idSuscriptor)
            setLogoKey(null)
            onLogoChange?.(null)
            setLogoPreview(null)
            setLogoFile(null)
            if (inputLogoRef.current) inputLogoRef.current.value = ''
            setMensajeLogo('Logo eliminado correctamente.')
        } catch (e) {
            setMensajeLogo(e instanceof Error ? e.message : 'No se pudo eliminar el logo.')
        } finally {
            setSubiendoLogo(false)
        }
    }

    const [logoCacheBuster, setLogoCacheBuster] = useState(() => Date.now())

    const logoUrl = logoPreview ?? (logoKey ? `https://${b2UsuarioBucket}.${b2Url}/${logoKey}?t=${logoCacheBuster}` : null)

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

            {/* ── LOGO ── */}
            {/* ── LOGO ── */}
            <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Logo</h3>

                <div className="w-full flex items-center justify-center bg-slate-900/60 rounded-xl border border-white/10 p-4 min-h-40">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo del suscriptor"
                            className="max-h-40 max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-sm opacity-50">Sin logo</span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        ref={inputLogoRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={onLogoSeleccionado}
                        className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600 file:cursor-pointer"
                    />

                    {logoFile && (
                        <button
                            type="button"
                            onClick={subirLogo}
                            disabled={subiendoLogo}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-sm font-medium"
                        >
                            {subiendoLogo ? 'Subiendo...' : 'Confirmar subida'}
                        </button>
                    )}

                    {logoKey && !logoFile && (
                        <button
                            type="button"
                            onClick={eliminarLogo}
                            disabled={subiendoLogo}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-sm font-medium"
                        >
                            {subiendoLogo ? 'Eliminando...' : 'Eliminar logo'}
                        </button>
                    )}
                </div>

                {mensajeLogo && (
                    <p className="text-sm opacity-80">{mensajeLogo}</p>
                )}
            </div>

            {/* ── PARÁMETROS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm opacity-75">Certificador</span>
                        <Example
                            opciones={opcionesUsuarios.map(opcion => {
                                return {
                                    nombre: `${opcion.nombre}   #${opcion.opcion.indice_suscriptor}`,
                                    opcion: opcion.opcion
                                }
                            })}
                            seleccionado={parametrosEditados.certificador?.nombre ?? null}
                            titulo={parametrosEditados.certificador?.nombre ?? 'Seleccionar usuario'}
                            callbackOnSelect={(usuarioSeleccionado) => {
                                setParametrosEditados(last => ({ ...last, certificador: usuarioSeleccionado }))
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setParametrosEditados(last => ({ ...last, certificador: null }))}
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
                            onChange={(e) => setParametrosEditados(last => ({
                                ...last,
                                inicio_contador_certificados: Math.max(0, Number(e.target.value) || 0)
                            }))}
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
                            onChange={(e) => setParametrosEditados(last => ({
                                ...last,
                                contador_cotizaciones: Math.max(0, Number(e.target.value) || 0)
                            }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </label>
                    <p className="text-sm opacity-75">
                        Si aqui pones <strong>100</strong>, la siguiente cotizacion usara el 101.
                    </p>
                </div>

                <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Vista previa certificador</h3>

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
