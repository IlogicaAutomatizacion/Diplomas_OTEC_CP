import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeCursoAsync, borrarCursoAsync, crearCursoAsync, obtenerCursosAsync, type curso } from "../Api/cursos"

const CursoCard = ({ curso, setCursosState }: { curso: curso, setCursosState: React.Dispatch<React.SetStateAction<curso[]>> }) => {
    const [infoAbierta, setInfoAbierta] = useState<boolean>(false)
    const [botonesVisible, setBotonesVisible] = useState<boolean>(false)

    const [cursoLocal, setCursoLocal] = useState<curso>(curso)

    useEffect(() => {
        setCursosState(last => {
            return last.map((cursoObjeto) => {
                return cursoObjeto.curso_id === curso.curso_id ? cursoLocal : cursoObjeto
            })
        })
    }, [cursoLocal])


    async function handleDelete() {
        await borrarCursoAsync(curso.curso_id)

        setCursosState(last => {
            const withoutDeleted = last.filter((cursoM) => {
                return cursoM.curso_id !== curso.curso_id
            })

            return withoutDeleted
        })
    }

    async function guardarParametro(nombreParametro: string, nuevoValor: string) {
        const ultimaVersion = cursoLocal[nombreParametro as keyof curso]
        const nuevaVersion = nuevoValor.trim() //cursoLocal[nombreParametro as keyof curso]

        console.log(ultimaVersion, nuevaVersion)
        if (ultimaVersion === nuevaVersion) { return }

        try {
            await actualizarPropiedadDeCursoAsync(curso.curso_id, nombreParametro, nuevaVersion)
            setCursoLocal(last => {
                const cambiado = { ...last, [nombreParametro]: nuevaVersion }

                return cambiado
            })

        } catch (e) {
            setCursoLocal(last => {
                const cambiado = { ...last, [nombreParametro]: ultimaVersion }

                return cambiado
            })
            console.log(e)
        }
    }

    return <div className={`border p-2 max-w-full overflow-x-hidden  flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{cursoLocal.nombre}</h2>

        {
            infoAbierta ? <div onMouseEnter={() => {
                setBotonesVisible(true)
            }} onMouseLeave={() => {
                setBotonesVisible(false)
            }} className="flex flex-col mt-5 gap-y-1 break-all">
                <div className="overflow-y-auto  [&::-webkit-scrollbar]:hidden whitespace-pre-line">
                    {Object.entries(cursoLocal).map(([key, value]) => {
                        if (key.toLowerCase().includes('id')) { return }

                        return <p key={key}><span className="text-red-400 ">{key}:</span> <EditableText lostFocusCallback={(e) => {
                            guardarParametro(key, e.target.textContent ?? '')
                        }} text={value ?? 'Sin dato'} /> </p>
                    })}
                </div>

                <div className='botones flex flex-col gap-y-2'>
                    <button onClick={handleDelete} className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}>
                        Eliminar
                    </button>
                </div>
            </div> : null
        }
    </div >
}



export default ({ cursos, setCursos }: {
    cursos: curso[],
    setCursos: React.Dispatch<React.SetStateAction<curso[]>>
}) => {

    const [mensajeCursos, setMensajeCursos] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    useEffect(() => {
        (async () => {
            try {
                const cursos = await obtenerCursosAsync()

                setCursos(cursos)
            } catch (e) {
                setMensajeCursos(`Hubo un error al obtener los cursos: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [cursos])


    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const cursoNuevo = await crearCursoAsync()

            setCursos((last) => {
                return [...last, cursoNuevo]
            })
        } catch (e) {
            setMensajeBoton('Hubo un problema al crear el curso.')

            setTimeout(() => {
                setMensajeBoton(null)
            }, 2000);
        }
    }

    return <>
        <h2 className="text-3xl mt-25">Cursos ({cursos.length})
            <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'>
                <button onClick={handleAddButton} className=' cursor-pointer'>{mensajeBoton ?? 'Agregar'}</button>
            </span>
        </h2>

        <div id="tabla-cursos" className="w-[95%] grid m-5 gap-y-2 grid-cols-1 p-2 overflow-y-scroll auto-rows-max content-start bg-scroll-[#131516]  border-5">
            {mensajeCursos ? <p>{mensajeCursos}</p> :
                cursos.map((curso) => {
                    return <CursoCard key={curso.curso_id} curso={curso} setCursosState={setCursos} />
                })
            }
        </div>
    </>
}