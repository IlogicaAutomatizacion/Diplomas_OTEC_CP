import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    crearSuscripcionAdminAsync,
    eliminarSuscripcionAdminAsync,
    obtenerTodasLasSuscripcionesAsync,
    vincularUsuarioExistenteASuscriptorAdminAsync,
    type suscripcionGlobal
} from "./Api/suscripciones";
import { obtenerUsuariosAsync, type usuario } from "./Api/usuarios";
import { Example } from "./Componentes/DropdownMenu";

type FormState = {
    nombre: string,
    rut: string,
    telefono_contacto: string,
    email_contacto: string,
    nombre_contacto: string,
}

const initialForm: FormState = {
    nombre: '',
    rut: '',
    telefono_contacto: '',
    email_contacto: '',
    nombre_contacto: '',
}

export default function PanelAdministradores() {
    const [suscripciones, setSuscripciones] = useState<suscripcionGlobal[]>([])
    const [usuarios, setUsuarios] = useState<usuario[]>([])
    const [form, setForm] = useState<FormState>(initialForm)
    const [mensaje, setMensaje] = useState('Cargando suscripciones...')
    const [guardando, setGuardando] = useState(false)
    const [eliminandoId, setEliminandoId] = useState<number | null>(null)
    const [confirmandoId, setConfirmandoId] = useState<number | null>(null)
    const [vinculandoId, setVinculandoId] = useState<number | null>(null)
    const [mensajesVinculacion, setMensajesVinculacion] = useState<Record<number, string>>({})

    async function cargarSuscripciones() {
        try {
            const res = await obtenerTodasLasSuscripcionesAsync()
            setSuscripciones(res)
            setMensaje('')
        } catch (e) {
            setMensaje(e instanceof Error ? e.message : 'No se pudieron cargar las suscripciones.')
        }
    }

    async function cargarUsuarios() {
        try {
            const res = await obtenerUsuariosAsync()
            setUsuarios(res)
        } catch (e) {
            setMensaje((prev) =>
                prev
                    ? `${prev} No se pudo cargar la lista de usuarios.`
                    : 'No se pudo cargar la lista de usuarios.'
            )
        }
    }

    useEffect(() => {
        cargarSuscripciones()
        cargarUsuarios()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form.nombre.trim()) {
            setMensaje('El nombre de la suscripcion es obligatorio.')
            return
        }

        setGuardando(true)
        setMensaje('Creando suscripcion...')

        try {
            const creada = await crearSuscripcionAdminAsync({
                nombre: form.nombre.trim(),
                rut: form.rut.trim() || undefined,
                telefono_contacto: form.telefono_contacto.trim() || undefined,
                email_contacto: form.email_contacto.trim() || undefined,
                nombre_contacto: form.nombre_contacto.trim() || undefined,
            })

            setSuscripciones((prev) =>
                [...prev, creada].sort((a, b) => a.nombre_suscripcion.localeCompare(b.nombre_suscripcion))
            )
            setForm(initialForm)
            setMensaje('Suscripcion creada correctamente.')
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'No se pudo crear la suscripcion.')
        } finally {
            setGuardando(false)
        }
    }

    async function confirmarEliminacion(suscripcion: suscripcionGlobal) {
        setEliminandoId(suscripcion.id_suscriptor)
        setMensaje(`Eliminando suscripcion "${suscripcion.nombre_suscripcion}"...`)

        try {
            await eliminarSuscripcionAdminAsync(suscripcion.id_suscriptor)
            setSuscripciones((prev) => prev.filter((item) => item.id_suscriptor !== suscripcion.id_suscriptor))
            setConfirmandoId(null)
            setMensaje('Suscripcion eliminada correctamente.')
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'No se pudo eliminar la suscripcion.')
        } finally {
            setEliminandoId(null)
        }
    }

    async function handleVincularUsuario(id_suscripcion: number, usuarioSeleccionado: usuario) {
        if (!usuarioSeleccionado.id) return

        setVinculandoId(id_suscripcion)
        setMensajesVinculacion((prev) => ({
            ...prev,
            [id_suscripcion]: 'Vinculando usuario...'
        }))

        try {
            const res = await vincularUsuarioExistenteASuscriptorAdminAsync(id_suscripcion, usuarioSeleccionado.id)
            setMensajesVinculacion((prev) => ({
                ...prev,
                [id_suscripcion]: res.message
            }))
        } catch (error) {
            setMensajesVinculacion((prev) => ({
                ...prev,
                [id_suscripcion]: error instanceof Error
                    ? error.message
                    : 'No se pudo vincular el usuario.'
            }))
        } finally {
            setVinculandoId((current) => current === id_suscripcion ? null : current)
        }
    }

    const opcionesUsuarios = usuarios
        .filter((usuario) => usuario.id)
        .map((usuario) => ({
            nombre: usuario.nombre?.trim() || usuario.correo?.trim() || usuario.rut?.trim() || `Usuario #${usuario.id}`,
            opcion: usuario,
        }))

    return (
        <div className="min-h-screen w-full bg-[#131516] text-white p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-4xl font-semibold">Panel de administradores</h1>
                    <p className="mt-2 text-white/60">
                        Desde aqui puedes crear nuevas suscripciones, entrar a administrarlas o eliminarlas con confirmacion.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-white/10 bg-[#1c1f21] p-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5"
                >
                    <input
                        value={form.nombre}
                        onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre de la suscripcion"
                        className="rounded-lg border border-white/10 bg-[#131516] px-3 py-2"
                    />
                    <input
                        value={form.rut}
                        onChange={(e) => setForm((prev) => ({ ...prev, rut: e.target.value }))}
                        placeholder="RUT (opcional)"
                        className="rounded-lg border border-white/10 bg-[#131516] px-3 py-2"
                    />
                    <input
                        value={form.telefono_contacto}
                        onChange={(e) => setForm((prev) => ({ ...prev, telefono_contacto: e.target.value }))}
                        placeholder="Telefono (opcional)"
                        className="rounded-lg border border-white/10 bg-[#131516] px-3 py-2"
                    />
                    <input
                        value={form.email_contacto}
                        onChange={(e) => setForm((prev) => ({ ...prev, email_contacto: e.target.value }))}
                        placeholder="Correo de contacto (opcional)"
                        className="rounded-lg border border-white/10 bg-[#131516] px-3 py-2"
                    />
                    <div className="flex gap-3">
                        <input
                            value={form.nombre_contacto}
                            onChange={(e) => setForm((prev) => ({ ...prev, nombre_contacto: e.target.value }))}
                            placeholder="Nombre del contacto (opcional)"
                            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#131516] px-3 py-2"
                        />
                        <button
                            type="submit"
                            disabled={guardando}
                            className={`rounded-lg px-4 py-2 font-medium ${guardando ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {guardando ? 'Creando...' : 'Crear'}
                        </button>
                    </div>
                </form>

                {mensaje ? <p className="text-sm text-white/70">{mensaje}</p> : null}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {suscripciones.map((suscripcion) => {
                        const confirmando = confirmandoId === suscripcion.id_suscriptor
                        const eliminando = eliminandoId === suscripcion.id_suscriptor

                        return (
                            <div
                                key={suscripcion.id_suscriptor}
                                className="rounded-2xl border border-white/10 bg-[#1c1f21] p-5 space-y-4"
                            >
                                <div>
                                    <h2 className="text-xl font-semibold">{suscripcion.nombre_suscripcion}</h2>
                                    <p className="text-sm text-white/60">Suscripcion #{suscripcion.id_suscriptor}</p>
                                    {suscripcion.rut ? <p className="text-sm text-white/50">RUT: {suscripcion.rut}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <span className="block text-sm text-white/70">
                                        Vincular usuario existente
                                    </span>
                                    <Example
                                        titulo={vinculandoId === suscripcion.id_suscriptor ? 'Vinculando...' : 'Seleccionar usuario'}
                                        noCambiarNombreAlSeleccionar={true}
                                        callbackOnSelect={(opcion) => handleVincularUsuario(suscripcion.id_suscriptor, opcion)}
                                        opciones={opcionesUsuarios}
                                    />
                                    {mensajesVinculacion[suscripcion.id_suscriptor] ? (
                                        <p className="text-xs text-white/60">
                                            {mensajesVinculacion[suscripcion.id_suscriptor]}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        to={`/panelAdminitradorCursos/${suscripcion.nombre_suscripcion}`}
                                        className="rounded-lg bg-blue-500/20 px-4 py-2 text-blue-300 hover:bg-blue-500/30"
                                    >
                                        Administrar
                                    </Link>

                                    {confirmando ? (
                                        <>
                                            <button
                                                onClick={() => confirmarEliminacion(suscripcion)}
                                                disabled={eliminando}
                                                className={`rounded-lg px-4 py-2 ${eliminando ? 'bg-slate-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                            >
                                                {eliminando ? 'Eliminando...' : 'Confirmar'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmandoId(null)}
                                                disabled={eliminando}
                                                className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmandoId(suscripcion.id_suscriptor)}
                                            className="rounded-lg bg-red-500/20 px-4 py-2 text-red-300 hover:bg-red-500/30"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {!mensaje && suscripciones.length === 0 ? (
                    <p className="text-white/50">No hay suscripciones registradas todavia.</p>
                ) : null}
            </div>
        </div>
    )
}
