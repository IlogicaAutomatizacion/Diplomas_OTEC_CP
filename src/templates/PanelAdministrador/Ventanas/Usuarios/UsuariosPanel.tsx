import { useEffect, useState } from "react"
import { actualizarPropiedadDeUsuarioAsync, borrarUsuarioAsync, eliminarFirmaAsync, eliminarFotoDePerfilAsync, subirFirmaAsync, subirFotoDePerfilAsync, type usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import { agregarRolAUsuarioAsync, eliminarRolPorIdDeUsuarioAsync, type rolEnum } from "../../Api/roles"
import { agregarEmpresaVinculadaAsync, eliminarEmpresaVinculadaPorIdsAsync } from "../../Api/empresasVinculadas"
import EditableText from "../../Componentes/EditableText"
import { Example } from "../../Componentes/DropdownMenu"
import { b2Url, b2UsuarioBucket } from "../../../../vars"

export default ({ usuario, setUsuarioState, empresas, setUsuarioAVisualizar }: { setUsuarioAVisualizar: React.Dispatch<React.SetStateAction<usuario | null>>, empresas: empresa[], usuario: usuario, setUsuarioState: React.Dispatch<React.SetStateAction<usuario[]>> }) => {
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [usuarioLocal, setUsuarioLocal] = useState<usuario>(usuario)


    useEffect(() => {
        setUsuarioLocal(usuario)
    }, [usuario.id])

    useEffect(() => {
        setUsuarioState(prev =>
            prev.map(u =>
                u.id === usuarioLocal.id ? usuarioLocal : u
            )
        )
    }, [usuarioLocal.id, usuarioLocal])

    async function handleDelete() {
        if (!usuarioLocal.id) return

        try {
            await borrarUsuarioAsync(usuarioLocal.id)

            setUsuarioState(prev =>
                prev.filter(u => u.id !== usuarioLocal.id)
            )
        } catch (e) {
            console.log(e)
        }
    }

    async function guardarParametro(
        nombreParametro: keyof usuario,
        nuevoValor: string
    ) {
        if (!usuarioLocal.id) return

        const valorActual = usuarioLocal[nombreParametro]
        const valorNuevo = nuevoValor.trim()

        if (valorActual === valorNuevo) return

        // optimistic update
        setUsuarioLocal(prev => ({
            ...prev,
            [nombreParametro]: valorNuevo
        }))

        try {
            await actualizarPropiedadDeUsuarioAsync(
                usuarioLocal.id,
                nombreParametro,
                valorNuevo
            )
        } catch (e) {
            console.log(e)

            // rollback
            setUsuarioLocal(prev => ({
                ...prev,
                [nombreParametro]: valorActual
            }))
        }
    }

    async function handleRolCheckbox(checked: boolean, rol: rolEnum) {
        if (!usuarioLocal.id) return

        try {
            const roles = checked
                ? await agregarRolAUsuarioAsync({
                    usuario_id: usuarioLocal.id,
                    rol_enum: rol
                })
                : await eliminarRolPorIdDeUsuarioAsync({
                    usuario_id: usuarioLocal.id,
                    rol_enum: rol
                })

            if (roles) {
                setUsuarioLocal(prev => ({
                    ...prev,
                    rolesVinculados: roles
                }))
            }
        } catch (e) {
            console.log(e)
        }
    }

    async function handleAgregarEmpresaVinculada(empresa_id: number) {
        if (!usuarioLocal.id) return

        try {
            const empresas = await agregarEmpresaVinculadaAsync({
                usuario_id: usuarioLocal.id,
                empresa_id
            })

            if (empresas) {
                setUsuarioLocal(prev => ({
                    ...prev,
                    empresasVinculadas: empresas
                }))
            }
        } catch (e) {
            console.log(e)
        }
    }

    async function handleDeleteEmpresaVinculada(empresa_id: number) {
        if (!usuarioLocal.id) return

        try {
            const empresas = await eliminarEmpresaVinculadaPorIdsAsync({
                usuario_id: usuarioLocal.id,
                empresa_id
            })

            if (empresas) {
                setUsuarioLocal(prev => ({
                    ...prev,
                    empresasVinculadas: empresas
                }))
            }
        } catch (e) {
            console.log(e)
        }
    }


    return <div className="border mt-5 p-2 w-full overflow-y-auto overflow-x-hidden flex flex-col">

        <button
            onClick={() => {
                setUsuarioAVisualizar(null)
            }}
            className="
        bg-green-600
        hover:bg-green-700
        text-white
        px-4
        cursor-pointer
        py-2
        rounded
        transition
        w-full
        sm:w-auto
      "
        >
            {'Volver a la lista de usuarios'}
        </button>

        <div
            onMouseEnter={() => setBotonesVisible(true)}
            onMouseLeave={() => setBotonesVisible(false)}
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

                    ) {
                        return;
                    }

                    return (
                        <p key={key} className="text-sm sm:text-base">
                            <span className="text-blue-400">{key}:</span>{' '}
                            <EditableText
                                lostFocusCallback={(e) => {
                                    guardarParametro((key) as keyof usuario, e.target.textContent ?? '')
                                }}
                                text={value ?? 'Sin dato'}
                            />
                        </p>
                    );
                })}
            </div>

            {/* ROLES */}
            <div className="flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl text-center mb-2">Roles</h3>

                <div className="overflow-y-auto border grid grid-cols-1 sm:grid-cols-2 gap-y-2 p-2">
                    {[
                        ['PROFESOR', 'Profesor'],
                        ['ALUMNO', 'Alumno'],
                        ['EMPRESA', 'Empresa'],
                    ].map(([rol, label]) => (
                        <div key={rol} className="flex flex-row gap-x-2 items-center">
                            <input
                                type="checkbox"
                                onChange={(e) => handleRolCheckbox(e.target.checked, rol as rolEnum)}
                                defaultChecked={usuario.rolesVinculados?.includes(rol as rolEnum)}
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
                                if (!opcion?.id_empresa) return;
                                handleAgregarEmpresaVinculada(opcion.id_empresa);
                            }}
                            opciones={empresas?.map(empresa => ({
                                nombre: empresa.nombre,
                                opcion: empresa,
                            }))}
                        />
                    </span>
                </div>

                <div className="overflow-y-auto max-h-32 border flex flex-col gap-y-2 p-2">
                    {usuarioLocal.empresasVinculadas?.map(empresa => (
                        <div
                            key={empresa.id_empresa}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center"
                        >
                            <span className="w-full border p-1 text-center">
                                {empresa.nombre}
                            </span>
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
                                    if (!usuarioLocal?.id) return;
                                    const res = await eliminarFotoDePerfilAsync(usuarioLocal.id);
                                    if (res) {
                                        setUsuarioLocal(last => ({
                                            ...last,
                                            foto_perfil: undefined,
                                        }));
                                    }
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
                                if (!usuarioLocal.id) return;
                                const selected = e.target.files?.[0];
                                if (!selected) return;

                                const res = await subirFotoDePerfilAsync(selected, usuarioLocal.id);
                                setUsuarioLocal(last => ({
                                    ...last,
                                    foto_perfil: res.foto_perfil,
                                }));
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
                                    if (!usuarioLocal?.id) return;
                                    const res = await eliminarFirmaAsync(usuarioLocal.id);
                                    if (res) {
                                        setUsuarioLocal(last => ({
                                            ...last,
                                            firma: undefined,
                                        }));
                                    }
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
                                if (!usuarioLocal.id) return;
                                const selected = e.target.files?.[0];
                                if (!selected) return;

                                const res = await subirFirmaAsync(selected, usuarioLocal.id);
                                setUsuarioLocal(last => ({
                                    ...last,
                                    firma: res.firma,
                                }));
                            }}
                        />
                    )}
                </div>
            </div>

            {/* BOTÓN ELIMINAR */}
            <div className="flex flex-col gap-y-2">
                <button
                    onClick={handleDelete}
                    className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}
                >
                    Eliminar
                </button>
            </div>
        </div>

    </div>
}