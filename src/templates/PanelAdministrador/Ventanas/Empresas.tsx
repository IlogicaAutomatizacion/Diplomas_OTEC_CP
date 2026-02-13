import { useEffect, useState } from "react"
import EditableText from "../Componentes/EditableText"
import { actualizarPropiedadDeEmpresaAsync, borrarEmpresaAsync, type empresa } from "../Api/empresas"
import { crearEmpresaDeSuscriptorAsync, crearEmpresasDeSuscriptorAsync, obtenerEmpresasDeSuscriptorAsync } from "../Api/suscripciones"
import { useExcelMapper } from "../Componentes/SeccionadorSapa"
import { Example } from "../Componentes/DropdownMenu"

const EmpresaCard = ({ empresa, setEmpresaState }: { empresa: empresa, setEmpresaState: React.Dispatch<React.SetStateAction<empresa[]>> }) => {
    const [infoAbierta, setInfoAbierta] = useState(false)
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [empresaLocal, setEmpresaLocal] = useState<empresa>(empresa)

    /**
     * Sync SOLO cuando cambia la empresa desde afuera
     */
    useEffect(() => {
        setEmpresaLocal(empresa)
    }, [empresa.id_empresa])

    /**
     * Propaga cambios locales al estado global
     */
    useEffect(() => {
        setEmpresaState(prev =>
            prev.map(e =>
                e.id_empresa === empresaLocal.id_empresa ? empresaLocal : e
            )
        )
    }, [empresaLocal.id_empresa, empresaLocal])

    async function handleDelete() {
        if (!empresaLocal.id_empresa) return

        try {
            await borrarEmpresaAsync(empresaLocal.id_empresa)

            setEmpresaState(prev =>
                prev.filter(e => e.id_empresa !== empresaLocal.id_empresa)
            )
        } catch (e) {
            console.log(e)
        }
    }

    async function guardarParametro(
        nombreParametro: keyof empresa,
        nuevoValor: string
    ) {
        if (!empresaLocal.id_empresa) return

        const valorActual = empresaLocal[nombreParametro]
        const valorNuevo = nuevoValor.trim()

        if (valorActual === valorNuevo) return

        // optimistic update
        setEmpresaLocal(prev => ({
            ...prev,
            [nombreParametro]: valorNuevo
        }))

        try {
            await actualizarPropiedadDeEmpresaAsync(
                empresaLocal.id_empresa,
                nombreParametro,
                valorNuevo
            )
        } catch (e) {
            console.log(e)

            // rollback
            setEmpresaLocal(prev => ({
                ...prev,
                [nombreParametro]: valorActual
            }))
        }
    }


    return (
        <div className="border p-2 w-full max-w-full overflow-x-hidden flex flex-col">
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
                {empresaLocal.nombre ?? 'Sin dato'}
            </h2>

            {infoAbierta ? (
                <div
                    onMouseEnter={() => setBotonesVisible(true)}
                    onMouseLeave={() => setBotonesVisible(false)}
                    className="flex flex-col mt-4 sm:mt-5 gap-y-3 break-all"
                >
                    {/* INFO EMPRESA */}
                    <div
                        className="
                        overflow-y-auto
                        max-h-48 sm:max-h-64
                        text-sm sm:text-base
                        [&::-webkit-scrollbar]:hidden
                    "
                    >
                        {Object.entries(empresaLocal).map(([key, value]) => {
                            if (key.toLowerCase().includes('id')) return;

                            return (
                                <p key={key}>
                                    <span className="text-blue-400">{key}:</span>{' '}
                                    <EditableText
                                        lostFocusCallback={(e) => {
                                            guardarParametro((key) as keyof empresa, e.target.textContent ?? '')
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
    );

}


export default ({ empresas, idSuscriptor, setEmpresas }: {
    empresas: empresa[],
    idSuscriptor: number,
    setEmpresas: React.Dispatch<React.SetStateAction<empresa[]>>
}) => {

    // const [mensajeEmpresas, setMensajeEmpresas] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()
    const [busqueda, setBusqueda] = useState("");

    const {
        datosImportados,
        //  mapeo,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<empresa>(async (empresasExcel) => {

        const res = await crearEmpresasDeSuscriptorAsync(idSuscriptor, empresasExcel);
        setEmpresas(res);
    });

    useEffect(() => {
        (async () => {
            try {
                const empresas = await obtenerEmpresasDeSuscriptorAsync(idSuscriptor)

                setEmpresas(empresas)
            } catch (e) {
                //       setMensajeEmpresas(`Hubo un error al obtener las empresas: ${String(e)}`)
            }
        })()
    }, [])

    useEffect(() => {
        setMensajeBoton(null)
    }, [empresas])

    const handleAddButton = async () => {
        try {
            setMensajeBoton('Creando...')

            const empresaNueva = await crearEmpresaDeSuscriptorAsync(idSuscriptor)

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
        {/* Header */}
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                    Empresas <span className="opacity-70">({empresas.length})</span>
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

                <p className="text-center text-slate-400 text-sm">
                    No se agregarán empresas que ya tengan el mismo RUT o correo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                    <div className="flex flex-col gap-1 items-center">
                        <span>RUT</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, rut: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Teléfono</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, telefono_contacto: opcion }))
                            }
                        />
                    </div>

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
                        <span>Email contacto</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, email_contacto: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Nombre contacto</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, nombre_contacto: opcion }))
                            }
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        construirResultado((fila, m) => ({
                            rut: fila[m.rut]
                                ? String(fila[m.rut]).trim()
                                : undefined,

                            telefono_contacto: fila[m.telefono_contacto]
                                ? String(fila[m.telefono_contacto]).trim()
                                : undefined,

                            nombre: fila[m.nombre]
                                ? String(fila[m.nombre]).trim()
                                : undefined,

                            email_contacto: fila[m.email_contacto]
                                ? String(fila[m.email_contacto]).trim()
                                : undefined,

                            nombre_contacto: fila[m.nombre_contacto]
                                ? String(fila[m.nombre_contacto]).trim()
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
                    Crear empresas
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

        {/* 🔍 BUSCADOR EMPRESAS */}
        <div className="mt-6 w-full flex justify-center">
            <input
                type="text"
                placeholder="Buscar empresa por nombre, RUT, contacto, email..."
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

            const empresasFiltradas = empresas.filter(e =>
                (e.nombre ?? '').toLowerCase().includes(q) ||
                (e.rut ?? '').toLowerCase().includes(q) ||
                (e.contacto ?? '').toLowerCase().includes(q) ||
                (e.telefono ?? '').toLowerCase().includes(q) ||
                (e.email ?? '').toLowerCase().includes(q)
            );

            return (
                <div
                    id="tabla-empresas"
                    className="
                    mt-6
                    w-full
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-4
                    overflow-y-auto
                    p-2
                "
                >
                    {empresasFiltradas.map((empresa) => (
                        <EmpresaCard
                            key={empresa.id_empresa}
                            empresa={empresa}
                            setEmpresaState={setEmpresas}
                        />
                    ))}

                    {empresasFiltradas.length === 0 && (
                        <p className="text-center col-span-full opacity-70 mt-4">
                            No se encontraron empresas.
                        </p>
                    )}
                </div>
            );
        })()}
    </>


}