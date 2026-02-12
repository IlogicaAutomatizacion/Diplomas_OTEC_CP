
import { useEffect, useState } from "react";
import { obtenerCertificadosDeAlumnoPorIdAsync } from "../PanelAdministrador/Api/certificados";
import { frontend } from "../../vars";

export type ListaDeCertificadosValidos = {
    token_usuario: string,
    token_curso: string,
    nombre_curso: string
}

export const CertificadoCard = ({ token_curso, token_usuario, nombre_curso }: ListaDeCertificadosValidos) => {
    const urlCertificado = `${frontend}/certificados/${token_usuario}/${token_curso}`;

    return (
        <div className="w-full max-w-sm bg-[#1c1f21]  rounded-2xl shadow-lg border border-white/10 p-5 flex items-center justify-between gap-4 hover:scale-[1.02] transition">

            {/* Info */}
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-white leading-tight">
                    {nombre_curso}
                </h2>
                <span className="text-xs text-white/40 mt-1">
                    Certificado disponible
                </span>
            </div>

            {/* Botón */}
            <a
                href={urlCertificado}
                target="_blank"
                className="px-4 py-2 text-sm rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition whitespace-nowrap"
            >
                Ver certificado
            </a>
        </div>
    );
};


export default function MisCertificados() {
    const [cursos, setCursos] = useState<ListaDeCertificadosValidos[]>([]);
    const [mensaje, setMensaje] = useState("Cargando certificados...");

    useEffect(() => {
        (async () => {
            try {
                const res = await obtenerCertificadosDeAlumnoPorIdAsync()

                setCursos(res);

                setMensaje("");
            } catch (e: any) {
                setMensaje(e?.message ?? "Hubo un error al cargar certificados");
            }
        })();
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
            <div className="w-full max-w-5xl">

                <h1 className="text-5xl md:text-6xl font-bold text-center mb-12">
                    Mis <span className="text-blue-400">Certificados</span>
                </h1>

                {mensaje ? (
                    <p className="text-center text-white/60">{mensaje}</p>
                ) : cursos.length === 0 ? (
                    <p className="text-center text-white/40">Aún no tienes certificados.</p>
                ) : (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {cursos.map((curso) => (
                            <CertificadoCard
                                key={curso.token_curso}
                                token_curso={curso.token_curso}
                                token_usuario={curso.token_usuario}
                                nombre_curso={curso.nombre_curso}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

