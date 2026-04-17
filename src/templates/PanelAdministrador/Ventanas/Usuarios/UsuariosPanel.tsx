import {
    actualizarPropiedadDeUsuarioAsync,
    borrarUsuarioAsync,
    eliminarFirmaAsync,
    eliminarFotoDePerfilAsync,
    subirFirmaAsync,
    subirFotoDePerfilAsync,
    type usuario,
} from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import { agregarRolAUsuarioAsync, eliminarRolPorIdDeUsuarioAsync, obtenerRolesDeUsuarioAsync, type rolEnum } from "../../Api/roles"
import { agregarEmpresaVinculadaAsync, eliminarEmpresaVinculadaPorIdsAsync } from "../../Api/empresasVinculadas"
import { desvincularUsuarioDeSuscriptorAsync } from "../../Api/suscripciones"
import EditableText from "../../Componentes/EditableText"
import { Example } from "../../Componentes/DropdownMenu"
import { b2Url, b2UsuarioBucket } from "../../../../vars"
import { useEffect, useState } from "react"

export default ({
    idSuscriptor,
    usuario,
    setUsuarioState,
    empresas,
    setUsuarioSeleccionadoId,
    onVinculacionChange,
}: {
    idSuscriptor: number,
    setUsuarioSeleccionadoId: React.Dispatch<React.SetStateAction<number | null>>,
    empresas: empresa[],
    usuario: usuario,
    setUsuarioState: React.Dispatch<React.SetStateAction<usuario[]>>,
    onVinculacionChange: () => Promise<void>
}) => {
    const [usuarioLocal, setUsuarioLocal] = useState(usuario)
    const [usuarioGuardado, setUsuarioGuardado] = useState(usuario)
    const [guardando, setGuardando] = useState(false)
    const [desvinculando, setDesvinculando] = useState(false)
    const [eliminandoUsuario, setEliminandoUsuario] = useState(false)
    const [rolesUsuarioActual, setRolesUsuarioActual] = useState<rolEnum[]>([])

    useEffect(() => {
        setUsuarioLocal(usuario)
        setUsuarioGuardado(usuario)
    }, [usuario.id])

    useEffect(() => {
        ; (async () => {
            try {
                const roles = await obtenerRolesDeUsuarioAsync()
                setRolesUsuarioActual(roles)
            } catch (e) {
                console.log(e)
            }
        })()
    }, [])

    function actualizarUsuario(cambios: Partial<usuario>) {
        setUsuarioLocal(prev => ({ ...prev, ...cambios }))
        setUsuarioState(prev =>
            prev.map(u => u.id === usuario.id ? { ...u, ...cambios } : u)
        )
    }

    async function handleDesvincular() {
        if (!usuarioLocal.id) return
        try {
            setDesvinculando(true)
            await desvincularUsuarioDeSuscriptorAsync(idSuscriptor, usuarioLocal.id)
            setUsuarioState(prev => prev.filter(u => u.id !== usuarioLocal.id))
            setUsuarioSeleccionadoId(null)
            await onVinculacionChange()
        } catch (e) {
            console.log(e)
        } finally {
            setDesvinculando(false)
        }
    }

    async function handleDelete() {
        if (!usuarioLocal.id) return
        try {
            setEliminandoUsuario(true)
            await borrarUsuarioAsync(usuarioLocal.id)
            setUsuarioState(prev => prev.filter(u => u.id !== usuarioLocal.id))
            setUsuarioSeleccionadoId(null)
            await onVinculacionChange()
        } catch (e) {
            console.log(e)
        } finally {
            setEliminandoUsuario(false)
        }
    }

    const hayCambios = (Object.entries(usuarioLocal) as [keyof usuario, usuario[keyof usuario]][])
        .some(([key, value]) => {
            const nombre = String(key).toLowerCase()

            if (
                nombre === 'id' ||
                nombre.includes('token') ||
                nombre.includes('roles') ||
                nombre.includes('vinculadas') ||
                nombre === 'firma' ||
                nombre === 'foto_perfil'
            ) return false

            return value !== usuarioGuardado[key]
        })

    async function guardarCambios() {
        if (!usuarioLocal.id || !hayCambios) return

        setGuardando(true)

        try {
            const entries = Object.entries(usuarioLocal) as [keyof usuario, usuario[keyof usuario]][]

            for (const [key, value] of entries) {
                const nombre = String(key).toLowerCase()

                if (
                    nombre === 'id' ||
                    nombre.includes('token') ||
                    nombre.includes('roles') ||
                    nombre.includes('vinculadas') ||
                    nombre === 'firma' ||
                    nombre === 'foto_perfil' ||
                    value === usuarioGuardado[key]
                ) continue

                await actualizarPropiedadDeUsuarioAsync(
                    usuarioLocal.id,
                    key,
                    String(value ?? '').trim()
                )
            }

            setUsuarioGuardado(usuarioLocal)
        } catch (e) {
            console.log(e)
            setUsuarioLocal(usuarioGuardado)
            setUsuarioState(prev => prev.map(u => u.id === usuarioGuardado.id ? usuarioGuardado : u))
        } finally {
            setGuardando(false)
        }
    }

    async function handleRolCheckbox(checked: boolean, rol: rolEnum) {
        if (!usuarioLocal.id) return
        try {
            const roles = checked
                ? await agregarRolAUsuarioAsync({ usuario_id: usuarioLocal.id, rol_enum: rol })
                : await eliminarRolPorIdDeUsuarioAsync({ usuario_id: usuarioLocal.id, rol_enum: rol })
            if (roles) actualizarUsuario({ rolesVinculados: roles })
        } catch (e) {
            console.log(e)
        }
    }

    async function handleAgregarEmpresaVinculada(empresa_id: number) {
        if (!usuarioLocal.id) return
        try {
            const result = await agregarEmpresaVinculadaAsync({ usuario_id: usuarioLocal.id, empresa_id })
            if (result) {
                actualizarUsuario({ empresasVinculadas: result })
                onVinculacionChange()
            }
        } catch (e) {
            console.log(e)
        }
    }

    async function handleDeleteEmpresaVinculada(empresa_id: number) {
        if (!usuarioLocal.id) return
        try {
            const result = await eliminarEmpresaVinculadaPorIdsAsync({ usuario_id: usuarioLocal.id, empresa_id })
            if (result) {
                actualizarUsuario({ empresasVinculadas: result })
                onVinculacionChange()
            }
        } catch (e) {
            console.log(e)
        }
    }

    const rolesDisponibles = [
        ['PROFESOR', 'Profesor'],
        ['ALUMNO', 'Alumno'],
        ['EMPRESA', 'Empresa'],
        ...(rolesUsuarioActual.includes('ADMINISTRADOR')
            ? [['ADMINISTRADOR', 'Administrador'] as const]
            : []),
    ] as const

    return (
        <div className="border mt-5 p-2 w-full overflow-y-auto overflow-x-hidden flex flex-col">
            <button
                onClick={() => setUsuarioSeleccionadoId(null)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 cursor-pointer py-2 rounded transition w-full sm:w-auto"
            >
                Volver a la lista de usuarios
            </button>

            <div
                // onMouseEnter={() => setBotonesVisible(true)}
                // onMouseLeave={() => setBotonesVisible(false)}
                className="flex flex-col mt-5 break-all gap-y-6"
            >
                {/* DATOS */}
                <div className="overflow-y-auto max-h-40 sm:max-h-56">
                    {Object.entries(usuarioLocal).map(([key, value]) => {
                        if (
                            key.toLowerCase() === 'id' ||
                            key.toLowerCase().includes('token') ||
                            key.toLowerCase().includes('roles') ||
                            key.toLowerCase().includes('vinculadas') ||
                            key.toLowerCase() === 'firma' ||
                            key.toLowerCase() === 'foto_perfil'
                        ) return null

                        return (
                            <p key={key} className="text-sm sm:text-base">
                                <span className="text-blue-400">{key}:</span>{' '}
                                <EditableText
                                    onChange={(value) =>
                                        actualizarUsuario({ [key]: value.trim() } as Partial<usuario>)
                                    }
                                    text={value ?? 'Sin dato'}
                                />
                            </p>
                        )
                    })}
                </div>

                {/* ROLES */}
                <div className="flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl text-center mb-2">Roles</h3>
                    <div className="overflow-y-auto border grid grid-cols-1 sm:grid-cols-2 gap-y-2 p-2">
                        {rolesDisponibles.map(([rol, label]) => (
                            <div key={rol} className="flex flex-row gap-x-2 items-center">
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleRolCheckbox(e.target.checked, rol as rolEnum)}
                                    checked={usuarioLocal.rolesVinculados?.includes(rol as rolEnum) ?? false}
                                />
                                <p>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EMPRESAS */}
                <div className="flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-x-2 mb-2 items-start sm:items-center">
                        <h3 className="text-xl sm:text-2xl">Empresas</h3>
                        <span className="sm:ml-auto w-full sm:w-auto">
                            <Example
                                titulo="Agregar"
                                noCambiarNombreAlSeleccionar={true}
                                callbackOnSelect={(opcion) => {
                                    if (!opcion?.id_empresa) return
                                    handleAgregarEmpresaVinculada(opcion.id_empresa)
                                }}
                                opciones={empresas?.map(e => ({ nombre: e.nombre, opcion: e }))}
                            />
                        </span>
                    </div>
                    <div className="overflow-y-auto max-h-32 border flex flex-col gap-y-2 p-2">
                        {usuarioLocal.empresasVinculadas?.map(empresa => (
                            <div key={empresa.id_empresa} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                                <span className="w-full border p-1 text-center">{empresa.nombre}</span>
                                <button
                                    onClick={() => handleDeleteEmpresaVinculada(empresa.id_empresa)}
                                    className="bg-red-500 rounded-3xl cursor-pointer p-1"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* IMÁGENES */}
                <div className="flex flex-col justify-center items-center sm:flex-row overflow-x-auto p-2 gap-6">
                    {/* FOTO PERFIL */}
                    <div className="flex flex-col justify-center shrink-0 min-w-[200px]">
                        <h3 className="text-xl text-center mb-2">Foto del usuario</h3>
                        {usuarioLocal.foto_perfil ? (
                            <div className="relative inline-block group self-center">
                                <img
                                    src={`https://${b2UsuarioBucket}.${b2Url}/${usuarioLocal.foto_perfil}`}
                                    alt="Foto de perfil"
                                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg"
                                />
                                <button
                                    onClick={async () => {
                                        if (!usuarioLocal?.id) return
                                        const res = await eliminarFotoDePerfilAsync(usuarioLocal.id)
                                        if (res) actualizarUsuario({ foto_perfil: undefined })
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <input
                                className="border h-10 p-2"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (!usuarioLocal.id) return
                                    const selected = e.target.files?.[0]
                                    if (!selected) return
                                    const res = await subirFotoDePerfilAsync(selected, usuarioLocal.id)
                                    actualizarUsuario({ foto_perfil: res.foto_perfil })
                                }}
                            />
                        )}
                    </div>

                    {/* FIRMA */}
                    <div className="flex flex-col justify-center shrink-0 min-w-[200px]">
                        <h3 className="text-xl text-center mb-2">Firma del usuario</h3>
                        {usuarioLocal.firma ? (
                            <div className="relative inline-block group self-center">
                                <img
                                    src={`https://${b2UsuarioBucket}.${b2Url}/${usuarioLocal.firma}`}
                                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg"
                                    alt=""
                                />
                                <button
                                    onClick={async () => {
                                        if (!usuarioLocal?.id) return
                                        const res = await eliminarFirmaAsync(usuarioLocal.id)
                                        if (res) actualizarUsuario({ firma: undefined })
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <input
                                className="border h-10 p-2"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (!usuarioLocal.id) return
                                    const selected = e.target.files?.[0]
                                    if (!selected) return
                                    const res = await subirFirmaAsync(selected, usuarioLocal.id)
                                    actualizarUsuario({ firma: res.firma })
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-y-2">
                    <button
                        onClick={guardarCambios}
                        disabled={!hayCambios || guardando}
                        className={`h-10 w-full cursor-pointer ${!hayCambios || guardando ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600'}`}
                    >
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                        onClick={handleDesvincular}
                        disabled={desvinculando}
                        className={`h-10 w-full mt-20 cursor-pointer ${desvinculando ? 'bg-red-300 cursor-not-allowed' : 'bg-red-400'}`}
                    >
                        {desvinculando ? 'Desvinculando...' : 'Desvincular'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={eliminandoUsuario}
                        className={`h-10 w-full cursor-pointer ${eliminandoUsuario ? 'bg-red-700 cursor-not-allowed' : 'bg-red-600'}`}
                    >
                        {eliminandoUsuario ? 'Eliminando usuario...' : 'Eliminar usuario'}
                    </button>
                </div>
            </div>
        </div>
    )
}
