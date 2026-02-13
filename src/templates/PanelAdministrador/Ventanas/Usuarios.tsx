import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeUsuarioAsync, borrarUsuarioAsync, eliminarFirmaAsync, eliminarFotoDePerfilAsync, subirFirmaAsync, subirFotoDePerfilAsync, type usuario } from "../Api/usuarios"
import { crearUsuarioDeSuscriptorAsync, crearUsuariosDeSuscriptorAsync, obtenerUsuariosDeSuscriptorAsync } from "../Api/suscripciones"
import { Example } from "../Componentes/DropdownMenu"
import type { empresa } from "../Api/empresas"
import { agregarRolAUsuarioAsync, eliminarRolPorIdDeUsuarioAsync, type rolEnum } from "../Api/roles"
import { agregarEmpresaVinculadaAsync, eliminarEmpresaVinculadaPorIdsAsync } from "../Api/empresasVinculadas"
import { useExcelMapper } from "../Componentes/SeccionadorSapa"
import { b2Url, b2UsuarioBucket } from "../../../vars"

const UsuarioCard = ({ usuario, setUsuarioState, empresas }: { empresas: empresa[], usuario: usuario, setUsuarioState: React.Dispatch<React.SetStateAction<usuario[]>> }) => {

    const [infoAbierta, setInfoAbierta] = useState(false)
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [usuarioLocal, setUsuarioLocal] = useState<usuario>(usuario)

    /**
     * Sync SOLO cuando cambia el usuario desde afuera
     */
    useEffect(() => {
        setUsuarioLocal(usuario)
    }, [usuario.id])

    /**
     * Propaga cambios locales al estado global
     */
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


    return <div className="border p-2 w-full overflow-y-auto overflow-x-hidden flex flex-col">
        <h2
            onClick={() => setInfoAbierta(last => !last)}
            className="   text-center
      font-medium
      cursor-pointer
      border-b
      pb-2
      hover:text-cyan-400
      transition"
        >
            {usuarioLocal.nombre ?? 'Sin nombre.'}
        </h2>

        {infoAbierta ? (
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
                <div className="flex flex-col sm:flex-row overflow-x-auto p-2 gap-6">
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
        ) : null}
    </div>

}

export default ({ usuarios, idSuscriptor, empresas, setUsuarios }: {
    usuarios: usuario[],
    empresas: empresa[]
    idSuscriptor: number,
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
}) => {
    //const [mensajeUsuarios, setMensajeUsuarios] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    const {
        datosImportados,
        //     mapeo,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<usuario>(async (usuariosExcel) => {

        const res = await crearUsuariosDeSuscriptorAsync(idSuscriptor, usuariosExcel);
        setUsuarios(res);
    });

    useEffect(() => {
        (async () => {
            try {
                const usuarios = await obtenerUsuariosDeSuscriptorAsync(idSuscriptor)

                setUsuarios(usuarios)
            } catch (e) {
                //      setMensajeUsuarios(`Hubo un error al obtener los usuarios: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [usuarios])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const usuarioNuevo = await crearUsuarioDeSuscriptorAsync(idSuscriptor)

            setUsuarios((last) => {
                return [...last, usuarioNuevo]
            })
        } catch (e) {
            setMensajeBoton('Hubo un problema al crear el usuario.')

            setTimeout(() => {
                setMensajeBoton(null)
            }, 2000);
        }
    }
    const [busqueda, setBusqueda] = useState('');


    return <>
        {/* HEADER */}
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                    Usuarios <span className="opacity-70">({usuarios.length})</span>
                </h2>

                <button
                    onClick={handleAddButton}
                    className="
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    px-4
                    py-2
                    rounded
                    transition
                    w-full
                    sm:w-auto
                "
                >
                    {mensajeBoton ?? 'Agregar'}
                </button>
            </div>
        </div>

        {/* IMPORTACIÓN */}
        {datosImportados ? (
            /* ... tu código se mantiene igual ... */
            <></>
        ) : (
            <div className="mt-6 flex justify-center">
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) cargarArchivo(file);
                    }}
                    className="
                    w-full
                    sm:w-auto
                    p-2
                    bg-slate-700
                    border
                    rounded
                    cursor-pointer
                "
                />
            </div>
        )}

        {/* 🔍 BUSCADOR */}
        <div className="mt-6 w-full flex justify-center">
            <input
                type="text"
                placeholder="Buscar usuario por nombre, rut, correo, especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="
                w-full
                sm:w-1/2
                p-2
                bg-slate-800
                border border-slate-700
                rounded
                text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
            "
            />
        </div>

        {/* 🔎 LÓGICA DEL FILTRO */}
        {(() => {
            const usuariosFiltrados = usuarios.filter(u =>
                (u.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (u.rut ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (u.email ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (u.especialidad ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (u.direccion ?? '').toLowerCase().includes(busqueda.toLowerCase())
            );

            return (
                <div
                    id="tabla-usuarios"
                    className="
                    mt-6
                    w-full
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-2
                    gap-4
                    overflow-y-auto
                    p-2
                "
                >
                    {usuariosFiltrados.map((usuario) => (
                        <UsuarioCard
                            key={usuario.id}
                            usuario={usuario}
                            empresas={empresas}
                            setUsuarioState={setUsuarios}
                        />
                    ))}

                    {usuariosFiltrados.length === 0 && (
                        <p className="text-center col-span-full opacity-70 mt-4">
                            No se encontraron usuarios.
                        </p>
                    )}
                </div>
            );
        })()}
    </>


}