import { useEffect, useState, type SetStateAction } from "react"
import { obtenerInscripcionesDeAlumno, type inscripcionesParaPanelAlumno, type inscripcionParaPanelAlumno } from "../PanelAdministrador/Api/usuarios"
import { convertirFecha } from "./Panel"
import { editarInscripcionAsync, type inscripcion } from "../PanelAdministrador/Api/inscripciones"

const AlumnoCard = ({ inscripcion, setInscripciones }: { inscripcion: inscripcionParaPanelAlumno, setInscripciones: React.Dispatch<SetStateAction<inscripcionesParaPanelAlumno | null>> }) => {

    const [inscripcionLocal, setInscripcionLocal] = useState(inscripcion)

    useEffect(() => {
        setInscripciones(last => {
            if (!last) { return last }

            return {
                ...last, inscripciones: last?.inscripciones.map(inscripcionM => {
                    return inscripcionM.idinscripcion === inscripcion.idinscripcion ? inscripcionLocal : inscripcionM
                })
            }
        })
    }, [inscripcionLocal])

    async function handlerMarcarAsistencia() {
        if (!inscripcion?.idinscripcion) { return }

        try {
            console.log('uh')
            const inscripcionActualizada: inscripcion = await editarInscripcionAsync(inscripcion.idinscripcion, {
                asistencia_marcada: true
            })
            console.log(inscripcionActualizada)
            setInscripcionLocal({ ...inscripcionLocal, asistenciamarcada: inscripcionActualizada.asistencia_marcada })
        } catch (e) {
            console.log(e)
        }
    }

    return <div
        key={inscripcionLocal.idinscripcion}
        className="bg-[#1c1f21] border border-white/10 rounded-2xl p-5 flex flex-col shadow-lg hover:scale-[1.02] transition"
    >
        {/* Título */}
        <h2 className="text-xl font-semibold text-center">
            {inscripcionLocal.nombrecurso}
        </h2>

        <div className="flex justify-center mt-2 items-center flex-col gap-y-2">
            <span className={`px-3 py-1 text-sm rounded-full ${inscripcionLocal.enclase ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-500/20 text-slate-400'}`}>
                {inscripcionLocal.enclase ? 'EN CLASE' : 'NO HAY CLASE ACTIVA'}
            </span>

            <span className={`px-3 py-1 text-sm rounded-full ${inscripcionLocal.estadocurso === 'ACTIVO' ? 'bg-green-500/20 text-green-400'
                : inscripcionLocal.estadocurso === 'INACTIVO' ? 'bg-slate-500/20 text-slate-400' :
                    inscripcionLocal.estadocurso === 'FINALIZADO' ? 'bg-blue-500/20 text-blue-400' : null
                }`}>
                {inscripcionLocal.estadocurso}
            </span>
        </div>

        {/* Info rápida */}
        <div className="mt-4 text-sm bg-black/20 rounded-xl p-3 space-y-1">
            <p>
                <span className="text-white/60">Duración:</span>{" "}
                <span className="text-green-400">
                    {inscripcionLocal.duracion} hrs
                </span>
            </p>
            <p>
                <span className="text-white/60">Profesor:</span>{" "}
                <span className="text-green-400">
                    {inscripcionLocal.profesor}
                </span>
            </p>
            <p>
                <span className="text-white/60">Inicio:</span>{" "}
                <span className="text-green-400">
                    {convertirFecha(inscripcionLocal.fechainicio)}
                </span>
            </p>
            <p>
                <span className="text-white/60">Finaliza:</span>{" "}
                <span className="text-green-400">
                    {convertirFecha(inscripcionLocal.fechafinalizacion)}
                </span>
            </p>
        </div>

        {/* Temario */}
        <div className="mt-4 bg-black/20 rounded-xl p-3 flex-1 flex flex-col">
            <h3 className="text-blue-400 font-semibold mb-2">
                Temario
            </h3>
            <p className="text-sm text-white/80 overflow-y-auto max-h-60 whitespace-pre-line">
                {inscripcionLocal.temario}
            </p>
        </div>

        {/* Botón acción */}
        <div className="mt-5">

            <button onClick={() => {
                if (inscripcionLocal.estadocurso === 'FINALIZADO' || inscripcionLocal.asistenciamarcada || !inscripcion.enclase) { return }

                handlerMarcarAsistencia()
            }} className={`w-full py-3 rounded-xl ${inscripcionLocal.asistenciamarcada || inscripcion.estadocurso === 'FINALIZADO' || !inscripcion.enclase ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-gray-700 cursor-pointer'}`}>
                {
                    inscripcionLocal.estadocurso === 'FINALIZADO' ? 'Curso finalizado' : inscripcionLocal.asistenciamarcada ? 'Asistencia marcada' : 'Marcar asistencia'
                }
            </button>

        </div>
    </div>
}

export default () => {
    const [inscripciones, setInscripciones] = useState<inscripcionesParaPanelAlumno | null>(null)
    const [mensaje, setMensaje] = useState<string | null>('Cargando...')


    useEffect(() => {

        (async () => {
            try {

                const inscripciones = await obtenerInscripcionesDeAlumno();

                console.log(inscripciones)
                setInscripciones(inscripciones);
                setMensaje(null);
            } catch (er: any) {
                console.log(er)

                setMensaje(er?.message ?? 'Error al obtener los cursos.');
            }
        })();
    }, []);


    useEffect(() => {
        setMensaje(null)
    }, [inscripciones])

    return <div>
        {
            mensaje ? <p className="text-white/60 text-xl">{mensaje}</p> : inscripciones ? <>
                {/* Encabezado */}
                <div className="text-center mb-10">
                    <p className="text-xl text-white/60">Alumno</p>
                    <h1 className="text-4xl font-bold">{inscripciones.usuario}</h1>
                    <h2 className="text-2xl mt-3 text-blue-400">Mis cursos</h2>
                </div>

                {/* Grid cursos */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3" >
                    {inscripciones.inscripciones.map((inscripcion) => (
                        <AlumnoCard key={inscripcion.idinscripcion} setInscripciones={setInscripciones} inscripcion={inscripcion} />
                    ))}
                </div>
            </> : null
        }
    </div>
}