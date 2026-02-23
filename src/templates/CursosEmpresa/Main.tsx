import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { obtenerEmpresaConCursosArmadosAsync, type empresaConCursosArmados } from "../PanelAdministrador/Api/empresas";
import type { cursoArmado } from "../PanelAdministrador/Api/cursos-armados";
import { frontend } from "../../vars";

const CursoArmadoCard = ({ cursoArmado }: { cursoArmado: cursoArmado }) => {
    return (
        <div className="w-full max-w-sm bg-[#1c1f21] rounded-2xl shadow-lg border border-white/10 p-5 flex flex-col gap-4 hover:scale-[1.02] transition">

            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-center">
                    {cursoArmado.curso?.nombre}
                </h2>
                <div className="flex justify-center mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${cursoArmado.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-400'
                        : cursoArmado.estado === 'INACTIVO' ? 'bg-slate-500/20 text-slate-400' :
                            cursoArmado.estado === 'FINALIZADO' ? 'bg-blue-500/20 text-blue-400' : null
                        }`}>
                        {cursoArmado.estado}
                    </span>
                </div>
            </div>

            {/* Info básica */}
            <div className="bg-black/20 rounded-xl p-3 text-sm space-y-1">
                <h3 className="text-blue-400 font-semibold text-base mb-1">Información general</h3>
                <p><span className="text-white/60">Profesor:</span> {cursoArmado.profesor?.nombre}</p>
                <p><span className="text-white/60">Calificación aprobatoria:</span> {cursoArmado.calificacion_aprobatoria}</p>

                <p><span className="text-white/60">Inicio:</span> {cursoArmado.fecha_inicio}</p>
                <p><span className="text-white/60 ">Finaliza:</span> {cursoArmado.fecha_finalizacion}</p>

            </div>

            {/* Detalles del curso */}
            <div className="bg-black/20 rounded-xl p-3 text-sm space-y-2 max-h-60 overflow-y-auto">
                <h3 className="text-blue-400 font-semibold text-base">Contenido del curso</h3>
                <p><span className="text-white/60">Duración:</span> {cursoArmado.curso?.duracion} hrs</p>
                <p className="whitespace-pre-line"><span className="text-white/60 ">Resumen:</span> {cursoArmado.curso?.resumen}</p>
                <p className="whitespace-pre-line"><span className="text-white/60">Temario:</span> {cursoArmado.curso?.temario}</p>
            </div>

            {/* Alumnos */}
            <div className="bg-black/20 rounded-xl p-3 text-sm max-h-36 overflow-y-auto">
                <h3 className="text-blue-400 font-semibold text-base mb-2">Alumnos inscritos</h3>
                <div className="space-y-1">
                    {cursoArmado.inscripciones.map((inscripcion) => (
                        <div
                            key={inscripcion.id_inscripcion}
                            className="px-2 py-1 bg-white/5 rounded-lg flex flex-row"
                        >
                            <p>{inscripcion?.usuario?.nombre}</p>

                            {cursoArmado.estado === 'FINALIZADO' ? <span className="ml-auto">
                                <a target="_blank" href={`${frontend}/certificados/${inscripcion?.usuario?.token}/${cursoArmado.token_curso}`} className="px-2 py-1 cursor-pointer bg-white/5 rounded-lg">
                                    Ver ceritifcado
                                </a>
                            </span> : null}

                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};


export default () => {
    const { id_empresa } = useParams();

    const [empresa, setEmpresa] = useState<empresaConCursosArmados | null>(null);
    const [mensaje, setMensaje] = useState<string | null>('Cargando datos...');

    useEffect(() => {
        (async () => {
            try {
                if (!id_empresa || isNaN(Number(id_empresa))) {
                    throw new Error('ID inválido');
                }

                const empresa = await obtenerEmpresaConCursosArmadosAsync(Number(id_empresa));
                setEmpresa(empresa);
                setMensaje(null);
            } catch (er: any) {
                console.log(er)
                setMensaje(er?.message ?? 'Error al obtener la empresa.');
            }
        })();
    }, [id_empresa]);

    return (
        <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
            <div className="w-full max-w-7xl">

                {mensaje ? (
                    <p className="text-center text-xl text-white/60">{mensaje}</p>
                ) : empresa ? (
                    <>
                        <h1 className="text-5xl md:text-6xl font-bold text-center mb-10">
                            Cursos de <span className="text-blue-400">{empresa?.nombre}</span>
                        </h1>

                        <div>
                            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-400">
                                Cursos
                            </h2>

                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {empresa?.cursosArmados.map((curso) => (
                                    <CursoArmadoCard
                                        key={curso.curso_armado_id}
                                        cursoArmado={curso}
                                    />
                                ))}
                            </div>
                        </div>

                    </>
                ) : null}
            </div>
        </div>
    );
};
