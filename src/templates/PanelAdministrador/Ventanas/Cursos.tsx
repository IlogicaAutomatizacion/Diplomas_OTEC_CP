import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeCursoAsync, borrarCursoAsync, type curso } from "../Api/cursos"
import { crearCursoDeSuscriptorAsync, crearCursosDeSuscriptorAsync, obtenerCursosDeSuscriptorAsync } from "../Api/suscripciones"
import { Example } from "../Componentes/DropdownMenu"
import { useExcelMapper } from "../Componentes/SeccionadorSapa"

const CursoCard = ({ curso, setCursosState }: { curso: curso, setCursosState: React.Dispatch<React.SetStateAction<curso[]>> }) => {
    const [infoAbierta, setInfoAbierta] = useState(false)
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [cursoLocal, setCursoLocal] = useState<curso>(curso)

    /**
     * Sync SOLO cuando cambia el curso desde afuera
     */
    useEffect(() => {
        setCursoLocal(curso)
    }, [curso.curso_id])

    /**
     * Propaga cambios locales al estado global
     * (una sola fuente de verdad por ID)
     */
    useEffect(() => {
        setCursosState(prev =>
            prev.map(c =>
                c.curso_id === cursoLocal.curso_id ? cursoLocal : c
            )
        )
    }, [cursoLocal.curso_id, cursoLocal])

    async function handleDelete() {
        if (!cursoLocal.curso_id) return

        try {
            await borrarCursoAsync(cursoLocal.curso_id)

            setCursosState(prev =>
                prev.filter(c => c.curso_id !== cursoLocal.curso_id)
            )
        } catch (e) {
            console.log(e)
        }
    }

    async function guardarParametro(
        nombreParametro: keyof curso,
        nuevoValor: string
    ) {
        if (!cursoLocal.curso_id) return

        const valorActual = cursoLocal[nombreParametro]
        let valorNuevo: string | number = nuevoValor.trim()

        if (!isNaN(Number(valorNuevo))) {
            valorNuevo = Number(valorNuevo)
        }

        if (valorActual === valorNuevo) return

        // optimistic update
        setCursoLocal(prev => ({
            ...prev,
            [nombreParametro]: valorNuevo
        }))

        try {
            await actualizarPropiedadDeCursoAsync(
                cursoLocal.curso_id,
                nombreParametro,
                valorNuevo
            )
        } catch (e) {
            console.log(e)

            // rollback
            setCursoLocal(prev => ({
                ...prev,
                [nombreParametro]: valorActual
            }))
        }
    }


    return <div className="border p-2 w-full max-w-full overflow-x-hidden flex flex-col">
        <h2
            onClick={() => {
                setInfoAbierta(last => !last)
            }}
            className="   text-center
      font-medium
      cursor-pointer
      border-b
      pb-2
      hover:text-cyan-400
      transition"
        >
            {cursoLocal.nombre}
        </h2>

        {infoAbierta ? (
            <div
                onMouseEnter={() => setBotonesVisible(true)}
                onMouseLeave={() => setBotonesVisible(false)}
                className="flex flex-col mt-4 sm:mt-5 gap-y-3 break-all"
            >
                {/* INFO CURSO */}
                <div className="
                overflow-y-auto
                max-h-48 sm:max-h-64
                whitespace-pre-line
                text-sm sm:text-base
                [&::-webkit-scrollbar]:hidden
            ">
                    {Object.entries(cursoLocal).map(([key, value]) => {
                        if (key.toLowerCase().includes('id')) return;

                        return (
                            <p key={key}>
                                <span className="text-red-400">{key}:</span>{' '}
                                <EditableText
                                    lostFocusCallback={(e) => {
                                        guardarParametro((key) as keyof curso, e.target.textContent ?? '')
                                    }}
                                    text={value ?? 'Sin dato'}
                                />
                            </p>
                        );
                    })}
                </div>

                {/* BOTONES */}
                <div className="flex flex-col gap-y-2 pt-2">
                    <button
                        onClick={handleDelete}
                        className={`
                        ${botonesVisible ? '' : 'hidden'}
                        h-10
                        w-full
                        cursor-pointer
                        bg-red-400
                        text-sm sm:text-base
                    `}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ) : null}
    </div>

}

export default ({ cursos, idSuscriptor, setCursos }: {
    cursos: curso[],
    idSuscriptor: number,
    setCursos: React.Dispatch<React.SetStateAction<curso[]>>
}) => {

    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    const [busqueda, setBusqueda] = useState('');

    

    const {
        datosImportados,
        // mapeo,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<curso>(async (cursosExcel) => {
        const res = await crearCursosDeSuscriptorAsync(idSuscriptor, cursosExcel);
        setCursos(res);
    });

    useEffect(() => {
        (async () => {
            try {
                const cursos = await obtenerCursosDeSuscriptorAsync(idSuscriptor)

                console.log(cursos)
                setCursos(cursos)
            } catch (e) {
                //setMensajeCursos(`Hubo un error al obtener los cursos: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [cursos])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const cursoNuevo = await crearCursoDeSuscriptorAsync(idSuscriptor)

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
        {/* Header */}
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                    Cursos <span className="opacity-70">({cursos.length})</span>
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

        {/* Importación / mapeo */}
        {datosImportados ? (
            <div className="mt-6 border p-4 rounded flex flex-col gap-6 items-center">
                <h2 className="text-center text-lg font-medium">
                    Relacionar columnas{" "}
                    <span className="opacity-70">
                        ({datosImportados.filas.length} fila(s))
                    </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">

                    <div className="flex flex-col gap-1 items-center">
                        <span>Nombre</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, nombre: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Duración</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, duracion: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Resumen</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, resumen: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Temario</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, temario: opcion }))
                            }
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        construirResultado((fila, m) => ({
                            nombre: fila[m.nombre]
                                ? String(fila[m.nombre]).trim()
                                : undefined,

                            duracion:
                                fila[m.duracion] && !isNaN(Number(fila[m.duracion]))
                                    ? Number(fila[m.duracion])
                                    : undefined,

                            resumen: fila[m.resumen]
                                ? String(fila[m.resumen]).trim()
                                : undefined,

                            temario: fila[m.temario]
                                ? String(fila[m.temario]).trim()
                                : undefined,
                        }));
                    }}
                    className="
                    bg-slate-700
                    hover:bg-slate-600
                    px-6
                    py-2
                    rounded
                    border
                    transition
                "
                >
                    Crear cursos
                </button>
            </div>
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
                placeholder="Buscar curso por nombre, duración, resumen, temario..."
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
            const q = busqueda.toLowerCase();

            const cursosFiltrados = cursos.filter(c =>
                (c.nombre ?? '').toLowerCase().includes(q) ||
                (c.resumen ?? '').toLowerCase().includes(q) ||
                (c.temario ?? '').toLowerCase().includes(q) ||
                String(c.duracion ?? '').toLowerCase().includes(q)
            );

            return (
                <div
                    id="tabla-cursos"
                    className="
                    mt-6
                    w-full
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-4
                    overflow-y-auto
                    p-2
                "
                >
                    {cursosFiltrados.map((curso) => (
                        <CursoCard
                            key={curso.curso_id}
                            curso={curso}
                            setCursosState={setCursos}
                        />
                    ))}

                    {cursosFiltrados.length === 0 && (
                        <p className="text-center col-span-full opacity-70 mt-4">
                            No se encontraron cursos.
                        </p>
                    )}
                </div>
            );
        })()}
    </>

}