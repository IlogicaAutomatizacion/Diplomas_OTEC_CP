
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type empresaVinculadaAUsuario } from "./Api/empresas";
import { obtenerSuscripcionesDeUsuario, type suscripcionAdministrador } from "./Api/suscripciones";

export const EmpresaCard = ({ nombre }: empresaVinculadaAUsuario) => {

    return (
        <div className="w-full max-w-sm bg-[#1c1f21] rounded-2xl shadow-lg border border-white/10 p-5 flex items-center justify-between gap-4 hover:scale-[1.02] transition">

            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-white leading-tight">
                    {nombre}
                </h2>
            </div>

            <Link
                to={`/panelAdminitradorCursos/${nombre}`}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition whitespace-nowrap"
            >
                Administrar cursos
            </Link>
        </div>
    );
};


export default function MisSuscripciones() {
    const [empresas, setEmpresas] = useState<suscripcionAdministrador[]>([]);
    const [mensaje, setMensaje] = useState("Cargando empresas...");

    useEffect(() => {
        (async () => {
            try {
                const res = await obtenerSuscripcionesDeUsuario()
                console.log(res)
                
                setEmpresas(res);
                setMensaje("");
            } catch (e) {
                setMensaje("Error al cargar empresas.");
            }
        })();
    }, []);

    // const tokenUsuario = "TOKEN_DEL_USUARIO"; 

    return (
        <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
            <div className="w-full max-w-5xl">

                <h1 className="text-5xl md:text-6xl font-bold text-center mb-12">
                    Administrador <span className="text-blue-400">cursos</span>
                </h1>

                {mensaje ? (
                    <p className="text-center text-white/60">{mensaje}</p>
                ) : empresas.length === 0 ? (
                    <p className="text-center text-white/40">Aun no hay empresas para mostrar.</p>
                ) : (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {empresas.map((empresa) => (
                            <EmpresaCard
                                nombre={empresa.nombre_suscripcion}
                                id_empresa={empresa.id_empresa}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

