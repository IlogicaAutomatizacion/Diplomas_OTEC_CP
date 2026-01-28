import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeEmpresaAsync, borrarEmpresaAsync, crearEmpresaAsync, obtenerEmpresasAsync, type empresa } from "../Api/empresas"



const EmpresaCard = ({ empresa, setEmpresaState }: { empresa: empresa, setEmpresaState: React.Dispatch<React.SetStateAction<empresa[]>> }) => {
    const [infoAbierta, setInfoAbierta] = useState<boolean>(false)
    const [botonesVisible, setBotonesVisible] = useState<boolean>(false)

    const [empresaLocal, setEmpresaLocal] = useState<empresa>(empresa)

    useEffect(() => {
        setEmpresaState(last => {
            return last.map((empresaObjeto) => {
                return empresaObjeto.id_empresa === empresa.id_empresa ? empresaLocal : empresaObjeto
            })
        })
    }, [empresaLocal])

    async function handleDelete() {
        await borrarEmpresaAsync(empresa.id_empresa)

        setEmpresaState(last => {
            const withoutDeleted = last.filter((empresaM) => {
                return empresaM.id_empresa !== empresa.id_empresa
            })

            return withoutDeleted
        })
    }

    async function guardarParametro(nombreParametro: string, nuevoValor: string) {
        const ultimaVersion = empresaLocal[nombreParametro as keyof empresa]
        const nuevaVersion = nuevoValor.trim()

        if (ultimaVersion === nuevaVersion) { return }

        try {
            await actualizarPropiedadDeEmpresaAsync(empresa.id_empresa, nombreParametro, nuevaVersion)
            setEmpresaLocal(last => {
                const cambiado = { ...last, [nombreParametro]: nuevaVersion }

                return cambiado
            })

        } catch (e) {
            setEmpresaLocal(last => {
                const cambiado = { ...last, [nombreParametro]: ultimaVersion }

                return cambiado
            })
            console.log(e)
        }
    }

    return <div className={`border p-2 w-full h-auto overflow-x-hidden  overflow-y-auto flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{empresaLocal.nombre}</h2>

        {infoAbierta ? <div onMouseEnter={() => {
            setBotonesVisible(true)
        }} onMouseLeave={() => {
            setBotonesVisible(false)
        }} className="flex flex-col mt-5 gap-y-1 break-all">
            <div className="overflow-y-auto h-auto [&::-webkit-scrollbar]:hidden">

                {Object.entries(empresaLocal).map(([key, value]) => {
                    if (key.toLowerCase().includes('id')) { return }

                    return <p key={key}><span className="text-blue-400 ">{key}:</span> <EditableText lostFocusCallback={(e) => {
                        guardarParametro(key, e.target.textContent ?? '')
                    }} text={value ?? 'Sin dato'} /> </p>
                })}

            </div>

            <div className='botones flex flex-col gap-y-2'>
                <button onClick={handleDelete} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}>
                    Eliminar
                </button>
            </div>
        </div> : null}
    </div>
}


export default ({ empresas, setEmpresas }: {
    empresas: empresa[],
    setEmpresas: React.Dispatch<React.SetStateAction<empresa[]>>
}) => {

    const [mensajeEmpresas, setMensajeEmpresas] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    useEffect(() => {
        (async () => {
            try {
                const empresas = await obtenerEmpresasAsync()

                setEmpresas(empresas)
            } catch (e) {
                setMensajeEmpresas(`Hubo un error al obtener las empresas: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [empresas])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const empresaNueva = await crearEmpresaAsync()

            setEmpresas((last) => {
                return [...last, empresaNueva]
            })
        } catch (e) {
            setMensajeBoton('Hubo un problema al crear la empresa.')

            setTimeout(() => {
                setMensajeBoton(null)
            }, 2000);
        }
    }

    return <>
        <h2 className="text-3xl mt-25">Empresas ({empresas.length})

            <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'>
                <button onClick={handleAddButton} className='cursor-pointer'>{mensajeBoton ?? 'Agregar'}</button>
            </span>
        </h2>
        <div id="tabla-empresas" className="w-[95%] grid m-5 gap-y-2 grid-cols-4 p-2 overflow-y-scroll h-145 bg-scroll-[#131516] auto-rows-max border-5">
            {mensajeEmpresas ? <p>{mensajeEmpresas}</p> :
                empresas.map((empresa) => {
                    return <EmpresaCard key={empresa.id_empresa} empresa={empresa} setEmpresaState={setEmpresas} />
                })
            }
        </div></>
}