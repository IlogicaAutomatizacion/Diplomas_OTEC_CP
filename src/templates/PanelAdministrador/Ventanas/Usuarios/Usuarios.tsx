import { useEffect, useState } from "react"

import UsuariosPanel from "./UsuariosPanel"
import type { usuario } from "../../Api/usuarios"
import type { empresa } from "../../Api/empresas"
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { crearUsuarioDeSuscriptorAsync, crearUsuariosDeSuscriptorAsync, obtenerUsuariosDeSuscriptorAsync } from "../../Api/suscripciones"
import { Example } from "../../Componentes/DropdownMenu"
import UsuariosCard from "./UsuariosCard"

export default ({ usuarios, idSuscriptor, empresas, setUsuarios }: {
    usuarios: usuario[],
    empresas: empresa[]
    idSuscriptor: number,
    setUsuarios: React.Dispatch<React.SetStateAction<usuario[]>>
}) => {
    //const [mensajeUsuarios, setMensajeUsuarios] = useState<string | null>()
    const [mensajeBoton, setMensajeBoton] = useState<string | null>()

    const [usuarioAVisualizar, setUsuarioAVisualizar] = useState<usuario | null>(null)

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
                        <span>Correo</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, correo: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>fono_fax</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, fono_fax: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>direccion</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, direccion: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>rut</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, rut: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>especialidad</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, especialidad: opcion }))
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

                            correo:
                                fila[m.correo]
                                    ? String(fila[m.correo]).trim()
                                    : undefined,

                            fono_fax: fila[m.fono_fax]
                                ? String(fila[m.fono_fax]).trim()
                                : undefined,

                            direccion: fila[m.direccion]
                                ? String(fila[m.direccion]).trim()
                                : undefined,
                            rut: fila[m.rut]
                                ? String(fila[m.rut]).trim()
                                : undefined,
                            especialidad: fila[m.especialidad]
                                ? String(fila[m.especialidad]).trim()
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
                    Crear usuarios
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

            return usuarioAVisualizar ? <div>
                <UsuariosPanel setUsuarioAVisualizar={setUsuarioAVisualizar} empresas={empresas} setUsuarioState={setUsuarios} usuario={usuarioAVisualizar} />

            </div> : <div
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
                    overscroll-none
                    p-2
                "
            >
                {usuariosFiltrados.map((usuario) => (
                    <UsuariosCard
                        key={usuario.id}
                        usuario={usuario}
                        setUsuarioAVisualizar={setUsuarioAVisualizar}
                    />
                ))}

                {usuariosFiltrados.length === 0 && (
                    <p className="text-center col-span-full opacity-70 mt-4">
                        No se encontraron usuarios.
                    </p>
                )}
            </div>

        })()}
    </>


}