import type { cursoArmado } from "../../Api/cursos-armados";
import { useExcelMapper } from "../../Componentes/SeccionadorSapa"
import { crearInscripcionAsync, crearInscripcionesAsync, editarInscripcionAsync, eliminarInscripcionAsync, type inscripcion } from "../../Api/inscripciones"
import { Example } from "../../Componentes/DropdownMenu"
import React, { useEffect, useState } from "react"
import { actualizarPropiedadDeCursoArmadoAsync, borrarCursoArmadoAsync } from "../../Api/cursos-armados"
import type { usuario } from "../../Api/usuarios"
import type { curso } from "../../Api/cursos";
import type { empresa } from "../../Api/empresas";


export default ({
    cursoArmado,
    setCursosArmadosState,
    setCursoArmadoAVisualizar,
    cursos,
    empresas,
    usuarios
}: {
    cursoArmado: cursoArmado,
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>,
    setCursosArmadosState: React.Dispatch<React.SetStateAction<cursoArmado[]>>,
    cursos: curso[],
    empresas: empresa[]
    usuarios: usuario[]
}) => {
    const [usuariosAbiertos, setUsuariosAbiertos] = useState(false)
    const [botonesVisible, setBotonesVisible] = useState(false)

    const [cursoArmadoLocal, setCursoArmadoLocal] = useState<cursoArmado>(cursoArmado)

    const [mensajeInscripciones, setMensajeInscripciones] = useState<string | null>(null)

    const {
        datosImportados,
        mapeo,
        setMapeo,
        cargarArchivo,
        construirResultado
    } = useExcelMapper<inscripcion>(async (inscripcionesExcel) => {
        try {
            setMensajeInscripciones('Creando inscripciones...')

            const cursoArmadoActualizado = await crearInscripcionesAsync(inscripcionesExcel);
            setCursoArmadoLocal(cursoArmadoActualizado)

        } finally {
            setMensajeInscripciones(null)
        }

    });

    useEffect(() => {
        console.log(mapeo)

        setCursoArmadoLocal(cursoArmado)
    }, [cursoArmado.curso_armado_id])

    useEffect(() => {
        console.log(cursoArmadoLocal)

        setCursosArmadosState(prev =>
            prev.map(c =>
                c.curso_armado_id === cursoArmadoLocal.curso_armado_id
                    ? cursoArmadoLocal
                    : c
            )
        )
    }, [cursoArmadoLocal.curso_armado_id, cursoArmadoLocal])

    async function handleDelete() {
        try {
            await borrarCursoArmadoAsync(cursoArmado.curso_armado_id)

            setCursosArmadosState(prev =>
                prev.filter(c => c.curso_armado_id !== cursoArmado.curso_armado_id)
            )

            setCursoArmadoAVisualizar(null)
        } catch (e: any) {
            console.log(e)
        }
    }



    async function guardarParametro(
        nombreParametro: keyof cursoArmado,
        nuevoValor: string | number
    ) {

        try {
            await actualizarPropiedadDeCursoArmadoAsync(
                cursoArmadoLocal.curso_armado_id,
                nombreParametro,
                nuevoValor
            )
        } catch (e: any) {
            console.log(e)

            // rollback
            setCursoArmadoLocal(prev => ({
                ...prev,
                [nombreParametro]: nuevoValor
            }))
        }
    }

    async function inscribirAlumno(usuario: usuario) {
        if (!usuario?.id) return

        try {
            const actualizado = await crearInscripcionAsync({
                cursoArmado: cursoArmadoLocal.curso_armado_id,
                usuario: usuario.id
            })

            setCursoArmadoLocal(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    async function eliminarInscripcion(id_inscripcion: number) {
        try {
            const actualizado = await eliminarInscripcionAsync(id_inscripcion)
            setCursoArmadoLocal(actualizado)
        } catch (e) {
            console.log(e)
        }
    }

    async function actualizarInscripcion(
        id_inscripcion: number,
        propiedad: keyof inscripcion,
        nuevoValor: any
    ) {
        if (nuevoValor === undefined || nuevoValor === null) return

        try {
            const inscripcionActualizada = await editarInscripcionAsync(
                id_inscripcion,
                { [propiedad]: nuevoValor }
            )

            setCursoArmadoLocal(prev => ({
                ...prev,
                inscripciones: prev.inscripciones.map(i =>
                    i.id_inscripcion === id_inscripcion
                        ? inscripcionActualizada
                        : i
                )
            }))
        } catch (e) {
            console.log(e)
        }
    }


    return <div
        onMouseEnter={() => setBotonesVisible(true)}
        onMouseLeave={() => setBotonesVisible(false)}
        className="
        flex
        flex-col
        gap-4
        boder
        overflow-y-auto
        pr-1
      "
    >

        <button
            onClick={() => {
                setCursoArmadoAVisualizar(null)
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
            {'Volver a la lista de cursos armados'}
        </button>
        {/* Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col">
                <span className="text-cyan-400 text-center">Curso</span>
                <Example
                    seleccionado={cursoArmadoLocal.curso?.nombre}
                    callbackOnSelect={(e) => {
                        const valorActual = cursoArmadoLocal["curso"]

                        if (valorActual === e) return

                        setCursoArmadoLocal(prev => ({
                            ...prev,
                            ["curso"]: e
                        }))

                        if (e?.curso_id) guardarParametro('curso', e.curso_id)
                    }}
                    opciones={cursos.map(c => ({ nombre: c.nombre, opcion: c }))}
                />
            </div>

            <div className="flex flex-col">
                <span className="text-cyan-400 text-center">Profesor</span>
                <Example


                    seleccionado={cursoArmadoLocal.profesor?.nombre}
                    callbackOnSelect={(e) => {
                        const valorActual = cursoArmadoLocal["profesor"]

                        if (valorActual === e) return

                        setCursoArmadoLocal(prev => ({
                            ...prev,
                            ["profesor"]: e
                        }))

                        if (e?.id) guardarParametro('profesor', e.id)
                    }}
                    opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                />
            </div>

            <div className="flex flex-col">
                <span className="text-cyan-400 text-center">Empresa</span>
                <Example
                    seleccionado={cursoArmadoLocal.empresa?.nombre}
                    callbackOnSelect={(e) => {
                        const valorActual = cursoArmadoLocal["empresa"]

                        if (valorActual === e) return

                        setCursoArmadoLocal(prev => ({
                            ...prev,
                            ["empresa"]: e
                        }))


                        if (e?.id_empresa) guardarParametro('empresa', e.id_empresa)
                    }}
                    opciones={empresas.map(e => ({ nombre: e.nombre, opcion: e }))}
                />
            </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
                <span className="text-cyan-400">Inicio</span>
                <input
                    type="date"
                    value={cursoArmadoLocal.fecha_inicio ?? ''}
                    onChange={(e) => {
                        const valorActual = cursoArmadoLocal["fecha_inicio"]

                        const valorNormalizado = e.target.value

                        if (valorActual === valorNormalizado) return

                        setCursoArmadoLocal(prev => ({
                            ...prev,

                            ["fecha_inicio"]: valorNormalizado
                        }))

                        guardarParametro('fecha_inicio', e.target.value)
                    }}
                    className="border bg-transparent p-1 rounded"
                />
            </label>

            <label className="flex flex-col gap-1">
                <span className="text-cyan-400">Finalización</span>
                <input
                    type="date"
                    value={cursoArmadoLocal.fecha_finalizacion ?? ''}
                    onChange={(e) => {
                        const valorActual = cursoArmadoLocal["fecha_finalizacion"]

                        const valorNormalizado = e.target.value

                        if (valorActual === valorNormalizado) return

                        setCursoArmadoLocal(prev => ({
                            ...prev,

                            ["fecha_finalizacion"]: valorNormalizado
                        }))
                        guardarParametro('fecha_finalizacion', e.target.value)
                    }}
                    className="border bg-transparent p-1 rounded"
                />
            </label>
        </div>


        <label className="flex flex-col gap-1">
            <span className="text-cyan-200">Nota aprobatoria 1 (teorica)</span>
            <input
                type="number"
                defaultValue={cursoArmadoLocal.teorica ?? ''}
                onBlur={(e) => {
                    const v = parseFloat(e.target.value)

                    const valorActual = cursoArmadoLocal["teorica"]

                    if (valorActual === v) return

                    setCursoArmadoLocal(prev => ({
                        ...prev,

                        ["teorica"]: v
                    }))

                    if (!isNaN(v)) guardarParametro('teorica', v)
                }}
                className="border bg-transparent p-1 rounded"
            />
        </label>


        {/* Calificación */}
        <label className="flex flex-col gap-1">
            <span className="text-cyan-200">Nota aprobatoria 2 (practica)</span>
            <input
                type="number"
                defaultValue={cursoArmadoLocal.calificacion_aprobatoria ?? ''}
                onBlur={(e) => {
                    const v = parseFloat(e.target.value)

                    const valorActual = cursoArmadoLocal["calificacion_aprobatoria"]

                    if (valorActual === v) return

                    setCursoArmadoLocal(prev => ({
                        ...prev,

                        ["calificacion_aprobatoria"]: v
                    }))

                    if (!isNaN(v)) guardarParametro('calificacion_aprobatoria', v)
                }}
                className="border bg-transparent p-1 rounded"
            />
        </label>

        {/* Estado */}
        <p
            className={`
                            font-semibold
                            ${cursoArmadoLocal.estado === 'ACTIVO'
                    ? 'text-green-400'
                    : cursoArmadoLocal.estado === 'INACTIVO'
                        ? 'text-red-400'
                        : 'text-fuchsia-400'
                }
                      `}
        >
            {cursoArmadoLocal.estado}
        </p>

        {/* Estudiantes */}
        <div className="border rounded p-2 flex flex-col justify-center items-center">
            <div className="flex  items-center gap-2">
                <h3
                    onClick={() => setUsuariosAbiertos(v => !v)}
                    className="cursor-pointer font-medium"
                >
                    Estudiantes ({cursoArmadoLocal.inscripciones.length})
                </h3>

                <Example
                    titulo="Agregar"
                    noCambiarNombreAlSeleccionar
                    callbackOnSelect={inscribirAlumno}
                    opciones={usuarios.map(u => ({ nombre: u.nombre, opcion: u }))}
                />
            </div>


            {mensajeInscripciones ? <p className="mt-5">{mensajeInscripciones}</p> : datosImportados ? (<div className="mt-6 border p-4 rounded flex flex-col gap-6 items-center">
                <h2 className="text-center text-lg font-medium">
                    Relacionar columnas{" "}
                    <span className="opacity-70">
                        ({datosImportados.filas.length} fila(s))
                    </span>
                </h2>

                <p className="text-center text-slate-400 text-sm">
                    No se agregarán alumnos que ya estén inscritos
                </p>

                <div className="flex justify-center items-center flex-col gap-4 w-full">
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
                        <span>Asistencias</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, asistencias: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Teórica</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, teorica: opcion }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span>Práctica</span>
                        <Example
                            opciones={datosImportados.cabeceras}
                            callbackOnSelect={(opcion) =>
                                setMapeo(last => ({ ...last, calificacion: opcion }))
                            }
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        construirResultado((fila, m) => ({
                            cursoArmado: cursoArmadoLocal.curso_armado_id,

                            rut: fila[m.rut]
                                ? String(fila[m.rut]).trim()
                                : undefined,

                            asistencias: Number(fila[m.asistencias])
                                ? Number(fila[m.asistencias])
                                : undefined,

                            calificacion: Number(fila[m.calificacion])
                                ? Number(fila[m.calificacion])
                                : undefined,

                            teorica: Number(fila[m.teorica])
                                ? Number(fila[m.teorica])
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
                    Crear inscripciones
                </button>
            </div>) : <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) cargarArchivo(file);
                }}
                className="
                                    mx-10
                                    w-[70%]
                                    mt-5
                                    p-2
                                    bg-slate-700
                                    border
                                    rounded
                                    cursor-pointer
                                "
            />}

            {usuariosAbiertos && (
                <div className="mt-3 overflow-x-auto w-[95%] py-3">
                    <div className="grid grid-cols-6 gap-2 text-center text-sm min-w-[500px]">
                        {['Eliminar', 'Nombre', 'Asistencias', 'Nota práctica', 'Nota teórica', 'Notificar'].map(h => (
                            <div key={h} className="bg-neutral-700 p-1 border">
                                {h}
                            </div>
                        ))}

                        {cursoArmadoLocal.inscripciones.map(i => {

                            return <React.Fragment key={i.id_inscripcion} >
                                <button
                                    onClick={() => {
                                        if (i?.id_inscripcion === undefined) { return }

                                        eliminarInscripcion(i.id_inscripcion)
                                    }}
                                    className="bg-red-500 hover:bg-red-600 transition text-white"
                                >
                                    X
                                </button>

                                <div className="border p-1">{i.usuario?.nombre}</div>
                                <input
                                    type="number"
                                    defaultValue={i.asistencias}
                                    onBlur={e => {
                                        if (i?.id_inscripcion === undefined) { return }

                                        actualizarInscripcion(i.id_inscripcion, 'asistencias', Number(e.target.value))
                                    }
                                    }
                                    className="border p-1"
                                />

                                <input
                                    type="number"
                                    defaultValue={i.calificacion}
                                    onBlur={e => {
                                        if (i?.id_inscripcion === undefined) { return }

                                        actualizarInscripcion(i.id_inscripcion, 'calificacion', Number(e.target.value))
                                    }}
                                    className="border p-1"
                                />

                                <input
                                    type="number"
                                    defaultValue={i.teorica}
                                    onBlur={e => {
                                        if (i?.id_inscripcion === undefined) { return }

                                        actualizarInscripcion(i.id_inscripcion, 'teorica', Number(e.target.value))
                                    }}
                                    className="border p-1"
                                />

                                <div className="flex justify-center items-center">
                                    <input
                                        className="size-10"
                                        type="checkbox"
                                        defaultChecked={i.notificar}
                                        onChange={e => {
                                            if (i?.id_inscripcion === undefined) { return }

                                            actualizarInscripcion(i.id_inscripcion, 'notificar', e.target.checked)
                                        }}
                                    />
                                </div>



                            </React.Fragment>
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Acciones */}
        <div className={`flex flex-col gap-2 cursor-pointer ${botonesVisible ? '' : 'hidden'}`}>
            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "ACTIVO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "ACTIVO"
                }))

                guardarParametro('estado', 'ACTIVO')

            }} className="btn bg-green-600">
                Iniciar
            </button>
            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "INACTIVO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "INACTIVO"
                }))


                guardarParametro('estado', 'INACTIVO')
            }

            } className="btn cursor-pointer  bg-gray-500">
                Desactivar
            </button>
            <button onClick={() => {

                const valorActual = cursoArmadoLocal["estado"]

                if (valorActual === "FINALIZADO") return

                setCursoArmadoLocal(prev => ({
                    ...prev,

                    ["estado"]: "FINALIZADO"
                }))

                guardarParametro('estado', 'FINALIZADO')

            }} className="btn cursor-pointer  bg-blue-500">
                Finalizar
            </button>
            <button onClick={handleDelete} className="btn  cursor-pointer  bg-red-500">
                Eliminar
            </button>
        </div>
    </div>
}