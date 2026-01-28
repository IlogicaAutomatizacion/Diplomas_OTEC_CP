import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeUsuarioAsync, borrarUsuarioAsync, crearUsuarioAsync, obtenerUsuariosAsync, type usuario } from "../Api/usuarios"

const UsuarioCard = ({ usuario, setUsuarioState }: { usuario: usuario, setUsuarioState: React.Dispatch<React.SetStateAction<usuario[]>> }) => {

    const [infoAbierta, setInfoAbierta] = useState<boolean>(false)
    const [botonesVisible, setBotonesVisible] = useState<boolean>(false)

    const [usuarioLocal, setUsuarioLocal] = useState<usuario>(usuario)

    useEffect(() => {
        setUsuarioState(last => {
            return last.map((usuarioObjeto) => {

                return usuarioObjeto.id === usuario.id ? usuarioLocal : usuarioObjeto
            })
        })
    }, [usuarioLocal])

    async function handleDelete() {
        await borrarUsuarioAsync(usuario.id)

        setUsuarioState(last => {
            const withoutDeleted = last.filter((usuarioM) => {
                return usuarioM.id !== usuario.id
            })

            return withoutDeleted
        })
    }

    async function guardarParametro(nombreParametro: string, nuevoValor: string) {
        const ultimaVersion = usuarioLocal[nombreParametro as keyof usuario]
        const nuevaVersion = nuevoValor.trim()

        if (ultimaVersion === nuevaVersion) { return }

        try {
            await actualizarPropiedadDeUsuarioAsync(usuario.id, nombreParametro, nuevaVersion)

            setUsuarioLocal(last => {
                const cambiado = { ...last, [nombreParametro]: nuevaVersion }

                return cambiado
            })


        } catch (e) {
            setUsuarioLocal(last => {
                const cambiado = { ...last, [nombreParametro]: ultimaVersion }

                return cambiado
            })
            console.log(e)
        }
    }

    return <div className={`border p-2 w-full h-auto overflow-x-hidden flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{usuarioLocal.nombre}</h2>

        {infoAbierta ? <div onMouseEnter={() => {
            setBotonesVisible(true)
        }} onMouseLeave={() => {
            setBotonesVisible(false)
        }} className="flex flex-col mt-5 gap-y-1 break-all">
            <div className="overflow-y-auto h-auto [&::-webkit-scrollbar]:hidden">
                {Object.entries(usuarioLocal).map(([key, value]) => {
                    if (key.toLowerCase().includes('id') || key.toLowerCase().includes('token')) { return }

                    return <p key={key}><span className="text-blue-400 ">{key}:</span> <EditableText lostFocusCallback={(e) => {
                        guardarParametro(key, e.target.textContent ?? '')
                    }} text={value ?? 'Sin dato'} /> </p>
                })}
            </div>

            <div className="h-25 flex flex-col justify-center mt-5 ">
                <div>
                    <div className="flex flex-row gap-x-5 ">
                        <h3 className="text-2xl text-center">Roles</h3>
                    </div>
                </div>

                <div className="overflow-y-auto h-20 border grid grid-cols-3 ">

                </div>

            </div>

            <div className='botones flex flex-col gap-y-2'>
                <button onClick={handleDelete} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}>
                    Eliminar
                </button>
            </div>
        </div> : null}
    </div >
}



export default ({ usuarios, setUsuarios }: {
    usuarios: usuario[],
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
}) => {
    const [mensajeUsuarios, setMensajeUsuarios] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    useEffect(() => {
        (async () => {
            try {
                const usuarios = await obtenerUsuariosAsync()

                setUsuarios(usuarios)
            } catch (e) {
                setMensajeUsuarios(`Hubo un error al obtener los usuarios: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [usuarios])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const usuarioNuevo = await crearUsuarioAsync()

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

    return <>

        <h2 className="text-3xl mt-25">Usuarios ({usuarios.length})
            <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'>
                <button onClick={handleAddButton} className='cursor-pointer'>{mensajeBoton ?? 'Agregar'}</button>
            </span>

        </h2>
        <div id="tabla-usuarios" className="w-[95%] auto-rows-max grid m-5 content-start gap-y-2 grid-cols-4 p-2 overflow-y-scroll h-145 bg-scroll-[#131516] border-5">
            {mensajeUsuarios ? <p>{mensajeUsuarios}</p> :
                usuarios.map((usuario) => {
                    return <UsuarioCard key={usuario.id} usuario={usuario} setUsuarioState={setUsuarios} />
                })
            }
        </div>
    </>
}