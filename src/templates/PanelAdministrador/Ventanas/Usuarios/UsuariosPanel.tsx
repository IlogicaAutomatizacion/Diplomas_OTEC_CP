{/*UsuariosPanel*/ }

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
        <div className="flex flex-col gap-6 p-4 w-full overflow-y-auto overflow-x-hidden">

            {/* HEADER */}
            <button
                onClick={() => setUsuarioSeleccionadoId(null)}
                className="self-start flex items-center gap-2 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800"
            >
                ← Volver a usuarios
            </button>

            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center font-medium text-sm shrink-0">
                    {usuarioLocal.nombre?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
                <div>
                    <p className="font-medium text-base">{usuarioLocal.nombre ?? 'Sin nombre'}</p>
                    <p className="text-xs text-slate-500">ID #{usuarioLocal.id}</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={guardarCambios}
                        disabled={!hayCambios || guardando}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 disabled:cursor-not-allowed transition"
                    >
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>

            {/* DATOS */}
            <div className="border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 bg-slate-900/40">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Información personal</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(usuarioLocal).map(([key, value]) => {
                        if (['id', 'firma', 'foto_perfil'].includes(key) ||
                            key.toLowerCase().includes('token') ||
                            key.toLowerCase().includes('roles') ||
                            key.toLowerCase().includes('vinculadas')) return null
                        return (
                            <div key={key} className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500">{key}</span>
                                <div className="text-sm px-3 py-1.5 rounded-md border border-slate-700/60 bg-slate-800/60">
                                    <EditableText
                                        onChange={(v) => actualizarUsuario({ [key]: v.trim() } as Partial<usuario>)}
                                        text={String(value ?? '')}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ROLES */}
            <div className="border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 bg-slate-900/40">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Roles asignados</p>
                <div className="flex flex-col gap-2">
                    {rolesDisponibles.map(([rol, label]) => {
                        const activo = usuarioLocal.rolesVinculados?.includes(rol as rolEnum) ?? false
                        return (
                            <label key={rol} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleRolCheckbox(e.target.checked, rol as rolEnum)}
                                    checked={activo}
                                    className="accent-blue-500"
                                />
                                <span className={`text-sm px-3 py-1 rounded-full border transition ${activo
                                        ? 'bg-blue-900/50 border-blue-700/60 text-blue-300'
                                        : 'border-slate-700/60 text-slate-400'
                                    }`}>
                                    {label}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* EMPRESAS */}
            <div className="border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 bg-slate-900/40">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Empresas vinculadas</p>
                    <Example
                        titulo="+ Agregar"
                        noCambiarNombreAlSeleccionar={true}
                        callbackOnSelect={(opcion) => {
                            if (!opcion?.id_empresa) return
                            handleAgregarEmpresaVinculada(opcion.id_empresa)
                        }}
                        opciones={empresas?.map(e => ({ nombre: e.nombre, opcion: e }))}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    {usuarioLocal.empresasVinculadas?.map(empresa => (
                        <div key={empresa.id_empresa} className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-700/60 bg-slate-800/40 text-sm">
                            <span>{empresa.nombre}</span>
                            <button
                                onClick={() => handleDeleteEmpresaVinculada(empresa.id_empresa)}
                                className="w-6 h-6 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-950/40 flex items-center justify-center text-xs transition"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {!usuarioLocal.empresasVinculadas?.length && (
                        <p className="text-xs text-slate-600 italic">Sin empresas vinculadas</p>
                    )}
                </div>
            </div>

            {/* IMÁGENES */}
            <div className="border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 bg-slate-900/40">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Imágenes</p>
                <div className="flex flex-wrap gap-8">
                    {[
                        { label: 'Foto de perfil', field: 'foto_perfil', src: usuarioLocal.foto_perfil, onDelete: () => eliminarFotoDePerfilAsync(usuarioLocal.id!).then(r => r && actualizarUsuario({ foto_perfil: undefined })), onUpload: (f: File) => subirFotoDePerfilAsync(f, usuarioLocal.id!).then(r => actualizarUsuario({ foto_perfil: r.foto_perfil })) },
                        { label: 'Firma', field: 'firma', src: usuarioLocal.firma, onDelete: () => eliminarFirmaAsync(usuarioLocal.id!).then(r => r && actualizarUsuario({ firma: undefined })), onUpload: (f: File) => subirFirmaAsync(f, usuarioLocal.id!).then(r => actualizarUsuario({ firma: r.firma })) },
                    ].map(({ label, src, onDelete, onUpload }) => (
                        <div key={label} className="flex flex-col gap-2 items-start">
                            <span className="text-xs text-slate-500">{label}</span>
                            {src ? (
                                <div className="relative group">
                                    <img
                                        src={`https://${b2UsuarioBucket}.${b2Url}/${src}`}
                                        className="w-20 h-20 object-cover rounded-lg border border-slate-700/60"
                                        alt={label}
                                    />
                                    <button
                                        onClick={() => { if (usuarioLocal.id) onDelete() }}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 hover:bg-red-700 transition flex items-center justify-center"
                                    >✕</button>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-xs px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-400 transition">
                                    Subir imagen
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        if (!usuarioLocal.id) return
                                        const f = e.target.files?.[0]
                                        if (f) onUpload(f)
                                    }} />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ZONA DE PELIGRO */}
            <div className="border border-red-900/40 rounded-xl p-4 flex flex-col gap-3 bg-red-950/10">
                <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Zona de peligro</p>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 rounded-md border border-slate-700/60">
                        <div>
                            <p className="text-sm font-medium">Desvincular usuario</p>
                            <p className="text-xs text-slate-500">Quita la asociación con este suscriptor</p>
                        </div>
                        <button
                            onClick={handleDesvincular}
                            disabled={desvinculando}
                            className="px-3 py-1.5 text-sm rounded-md border border-red-800/60 text-red-400 hover:bg-red-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {desvinculando ? 'Desvinculando...' : 'Desvincular'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-red-900/50 bg-red-950/20">
                        <div>
                            <p className="text-sm font-medium text-red-300">Eliminar usuario</p>
                            <p className="text-xs text-red-700">Esta acción no se puede deshacer</p>
                        </div>
                        <button
                            onClick={handleDelete}
                            disabled={eliminandoUsuario}
                            className="px-3 py-1.5 text-sm rounded-md bg-red-700 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {eliminandoUsuario ? 'Eliminando...' : 'Eliminar usuario'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}
