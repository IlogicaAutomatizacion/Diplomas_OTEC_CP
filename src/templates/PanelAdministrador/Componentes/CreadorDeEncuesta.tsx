import { useEffect, useState } from "react";
import { obtenerColumnas } from "../../../utility/excel";
import { Example } from "./DropdownMenu";
import { emitError } from "../../../Error/ErrorContext";

export interface EncuestaFormato {
    id: string;
    titulo: string;
    activo?: boolean;
    descripcion?: string;
    preguntas: Pregunta[];
    limite_respuestas: number
}

export type TipoPregunta = 'Texto' | 'Rango'

export interface Pregunta {
    id: string;
    titulo: string;
    tipo: TipoPregunta;
    opciones?: string[];
    requerida: boolean;
}

type PreguntaKeys = keyof Pregunta
type PreguntaValues = Pregunta[keyof Pregunta]


export interface RespuestaEncuesta {
    respuesta_id?: string;
    encuesta_id: string;
    respondida_en: string;
    respuestas: RespuestaPregunta[];
    informacionAdicional?: {}
}

export interface RespuestaPregunta {
    pregunta_id: string;
    titulo_pregunta: string;
    valor: string | string[];
}

const opciones: TipoPregunta[] = ["Texto", "Rango"]

export type CrearRespuestaEncuestaDto = Omit<RespuestaEncuesta, 'respuesta_id'>;

const CongiuracionDePregunta = ({ pregunta, setMapEncuesta }: { pregunta: Pregunta, setMapEncuesta: React.Dispatch<React.SetStateAction<EncuestaFormato>> }) => {


    const cambiarPropiedadDePregunta = (propiedad: PreguntaKeys, nuevoValor: PreguntaValues) => {
        setMapEncuesta(last => {
            return {
                ...last,
                preguntas: last.preguntas.map((preguntaM) => {
                    if (preguntaM.id === pregunta.id) {
                        return {
                            ...preguntaM,
                            [propiedad]: nuevoValor
                        }
                    } else {
                        return preguntaM
                    }
                })
            }
        })
    }

    useEffect(() => {
        console.log(pregunta)
    }, [pregunta])

    useEffect(() => {
        cambiarPropiedadDePregunta("opciones", [])
    }, [pregunta.tipo])

    return <>
        {pregunta.titulo}

        <div className="flex flex-row gap-x-5">
            <Example key={pregunta.id} titulo={pregunta.tipo} seleccionado={pregunta.tipo} opciones={opciones.map((tipoPregunta => {
                return {
                    nombre: tipoPregunta,
                    opcion: tipoPregunta
                }
            }))} callbackOnSelect={(opcion) => {
                cambiarPropiedadDePregunta("tipo", opcion)
            }} />

            {pregunta.tipo == "Rango" ? <div>
                <div className="flex flex-row gap-x-5 justify-center items-center">
                    <div className="flex flex-col gap-y-2">
                        <p>Desde</p>
                        <input defaultValue={pregunta?.opciones?.[1] || "0"} type="number" className="border-2 p-2" onChange={(t) => {

                            cambiarPropiedadDePregunta("opciones", [t.target.value, pregunta?.opciones?.[1] || "0"])
                        }} />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <p>Hasta</p>

                        <input defaultValue={pregunta?.opciones?.[1] || "0"} type="number" className="border-2 p-2" onChange={(t) => {


                            cambiarPropiedadDePregunta("opciones", [pregunta?.opciones?.[0] || "0", t.target.value])
                        }} />
                    </div>

                </div>
            </div> : null}
        </div>

    </>
}

export default ({ callbackParaEncuestaTerminada, titulo, descripcion, limite_respuestas }: {
    callbackParaEncuestaTerminada: (mapEncuesta: EncuestaFormato) => void
    titulo?: string | null,
    descripcion?: string | null,
    limite_respuestas: number
}) => {

    const [columnas, setColumas] = useState<string[] | null>(null)

    const [mapEncuesta, setMapEncuesta] = useState<EncuestaFormato>({
        titulo: titulo || "Sin titulo",
        id: crypto.randomUUID(),
        preguntas: [],
        limite_respuestas,
        descripcion: descripcion || "Sin descripción",
    })

    const verificaPreguntas = () => {
        for (const pregunta of mapEncuesta.preguntas) {
            if (pregunta.tipo === "Rango" && pregunta?.opciones) {
                const rangoInicioNumber = Math.trunc(Number(pregunta.opciones?.[0]))

                const rangoFinalNumber = Math.trunc(Number(pregunta.opciones?.[1]))

                if (isNaN(rangoInicioNumber) || isNaN(rangoFinalNumber)) {
                    throw new Error("El rango de inicio y el rango final tienen que ser números.")
                }

                if (rangoInicioNumber > rangoFinalNumber) {
                    throw new Error("El rango de inicio debe de ser menor que el rango final.")
                }

                if (rangoInicioNumber === rangoFinalNumber) {
                    throw new Error("El rango de inicio debe de ser diferente que el rango final.")
                }
            }
        }

    }

    useEffect(() => {
        if (columnas) {
            setMapEncuesta(last => {
                return {
                    ...last,
                    preguntas:
                        columnas.map(pregunta => {
                            return {
                                titulo: pregunta,
                                tipo: "Texto",
                                opciones: [],
                                id: crypto.randomUUID(),
                                requerida: false

                            }
                        })
                }
            })
        }
    }, [columnas])

    return !columnas ? <div className="flex justify-center items-center flex-col my-10">
        {titulo ?? <p >{titulo}</p>}

        <input
            id="excel-preguntas-uploader"
            type="file"
            accept=".xlsx,.xls"
            onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const columnasExcel = await obtenerColumnas(file)

                    setColumas(columnasExcel)
                }
            }}
            className="
                    w-[70%]
                    p-2
                    bg-slate-700
                    border
                    rounded
                    cursor-pointer"/>


    </div> : <div className="my-10 flex justify-center items-center flex-col overflow-x-auto border p-2">
        <h2 className="text-2xl">Selecciona el tipo de cada pregunta</h2>

        <div className="grid grid-cols-2 gap-3 mt-5 justify-center items-center">
            {mapEncuesta.preguntas.map((pregunta) => {
                return <CongiuracionDePregunta key={pregunta.id} pregunta={pregunta} setMapEncuesta={setMapEncuesta} />
            })}
        </div>

        <button className="p-3 border bg-cyan-600 cursor-pointer mt-4" onClick={() => {
            try {
                verificaPreguntas()

                console.log(mapEncuesta)
                callbackParaEncuestaTerminada(mapEncuesta)
            } catch (e) {
                emitError(String(e))
            }
        }}>
            Subir formato de encuesta
        </button>
    </div>
}