import { useState } from "react";
import type { EncuestaFormato, RespuestaEncuesta, RespuestaPregunta } from "../PanelAdministrador/Componentes/CreadorDeEncuesta";
import { emitError } from "../../Error/ErrorContext";

export default function ResponderEncuesta({
    encuesta,
    onSubmit
}: {
    encuesta: EncuestaFormato;
    onSubmit?: (data: RespuestaEncuesta) => void;
}) {

    const [respuestas, setRespuestas] = useState<Record<string, string>>({});

    const setRespuesta = (pregunta_id: string, valor: string) => {
        setRespuestas((prev) => ({
            ...prev,
            [pregunta_id]: valor
        }));
    };

    const construirRespuesta = (): RespuestaEncuesta => {
        const respuestasFormateadas: RespuestaPregunta[] =
            encuesta.preguntas.map((pregunta) => ({
                pregunta_id: pregunta.id,
                titulo_pregunta: pregunta.titulo,
                valor: respuestas[pregunta.id] ?? ""
            }));

        return {
            encuesta_id: encuesta.id,
            respondida_en: new Date().toISOString(),
            respuestas: respuestasFormateadas
        };
    };

    const handleSubmit = () => {
        // validar requeridas
        for (const pregunta of encuesta.preguntas) {
            if (pregunta.requerida && !respuestas[pregunta.id]) {
                emitError(`La pregunta "${pregunta.titulo}" es requerida`);
                return;
            }
        }

        const data = construirRespuesta();
        onSubmit?.(data);
    };

    return (
        <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
            <div className="w-full max-w-3xl flex flex-col gap-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold">
                        {encuesta.titulo}
                    </h1>
                    {encuesta.descripcion && (
                        <p className="text-white/60 mt-2">
                            {encuesta.descripcion}
                        </p>
                    )}
                </div>

                {/* Preguntas */}
                {encuesta.preguntas.map((pregunta) => {

                    const valorActual = respuestas[pregunta.id];

                    return (
                        <div
                            key={pregunta.id}
                            className="bg-[#1c1f21] rounded-2xl border border-white/10 p-5 flex flex-col gap-4 shadow-lg"
                        >
                            <div className="flex flex-row items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {pregunta.titulo}
                                </h2>
                                {pregunta.requerida && (
                                    <span className="text-red-400">*</span>
                                )}
                            </div>

                            {/* TEXTO */}
                            {pregunta.tipo === "Texto" && (
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={4}
                                    placeholder="Escribe tu respuesta..."
                                    value={valorActual || ""}
                                    onChange={(e) =>
                                        setRespuesta(pregunta.id, e.target.value)
                                    }
                                />
                            )}

                            {/* RANGO */}
                            {pregunta.tipo === "Rango" && pregunta.opciones && (
                                <div className="flex flex-wrap gap-2">

                                    {(() => {
                                        const inicio = Number(pregunta.opciones?.[0]);
                                        const fin = Number(pregunta.opciones?.[1]);

                                        if (isNaN(inicio) || isNaN(fin)) {
                                            return (
                                                <p className="text-red-400 text-sm">
                                                    Rango inválido
                                                </p>
                                            );
                                        }

                                        return Array.from(
                                            { length: fin - inicio + 1 },
                                            (_, i) => {
                                                const valor = String(inicio + i);
                                                const seleccionado = valorActual === valor;

                                                return (
                                                    <button
                                                        key={valor}
                                                        onClick={() =>
                                                            setRespuesta(pregunta.id, valor)
                                                        }
                                                        className={`px-3 py-1 rounded-lg text-sm border transition
                                                        ${seleccionado
                                                                ? "bg-blue-500 text-white border-blue-400"
                                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {valor}
                                                    </button>
                                                );
                                            }
                                        );
                                    })()}

                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 transition rounded-xl py-3 font-semibold"
                >
                    Enviar respuestas
                </button>
            </div>
        </div>
    );
}