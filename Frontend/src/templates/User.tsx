import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Foter from "../Diseño/Foter"

import Logo from "../Diseño/CxLogo"
import { io, Socket } from "socket.io-client"
import { backend, frontend } from "../vars"

export default () => {
    const { usuario } = useParams<{
        usuario: string
    }>()

    const [alumno, setAlumno] = useState<Record<string, string>[] | null>(null)
    const [msg, setMsg] = useState<string | null>(null)
    const socket = useRef<Socket | null>(null)

    const [socket_cursos, setSocket_cursos] = useState<Record<string, { finalizado?: boolean, asistenciasHabilitadas?: boolean, alumno?: { asistenciaHabilitada: boolean } }>>({})
    const [usuarioActualizado, _] = useState(false)

    useEffect(() => {
        const obtener = async () => {
            try {
                const res = await fetch(`${backend}/usuario/${usuario}`)

                const js = await res.json()

                console.log(js)

                if (!js || !js.hasOwnProperty('alumno') || !js.alumno[0]) { setMsg('No se encontraron datos del usuario.'); return }

                setAlumno(js.alumno)

            } catch (e) {
                console.log(e)
                setMsg(JSON.stringify(e))
            }
        }

        obtener()
    }, [usuarioActualizado])

    useEffect(() => {
        setMsg(null)
    }, [alumno])

    useEffect(() => {
        if (!alumno) { return }

        socket.current = io(`${backend}`, {
            auth: {
                token: alumno[0].token_alumno
            }
        })

        socket.current.on('asistenciasHabilitadas', (data) => {
            console.log(data)
            if (data && data.hasOwnProperty('alumno')) {
                setSocket_cursos(last => {
                    return { ...last, [data.token]: data }
                })
            }

            //setUsuarioActualizado(last => !last)
        })

        socket.current.on('asistenciasActualizadas', (curso: string) => {
            socket.current?.emit('obtenerUsuario', {
                token_alumno: alumno[0].token_alumno,
                token_curso: curso
            })
        })

        alumno.forEach(curso => {
            console.log(curso);
            if (curso.finalizado) {
                setSocket_cursos(last => ({
                    ...last,
                    [curso.token_curso]: {
                        finalizado: true
                    }
                }));
                return
            }


            socket.current?.emit('unirse_curso', curso.token_curso, (info: any | null) => {

                setSocket_cursos(last => ({
                    ...last,
                    [curso.token_curso]: info ?? {
                        asistenciasHabilitadas: false,
                        alumno: {
                            asistenciaHabilitada: false
                        },
                        suficientesAlumnosParaFinalizar: false
                    }
                }));
            });
        })

        return () => {
            socket.current?.disconnect()
        }
    }, [alumno])

    useEffect(() => {
        console.log(socket_cursos)
    }, [socket_cursos])

    return <div className='bg-[#131516] w-[100%] min-h-[100vh]'>
        <div className='w-[100%] pt-10 min-h-[100vh]  flex justify-center items-center flex-col bg-[#131516] text-white'>
            <Logo />

            <div className='w-[90%] h-[85%] border-1 text-white p-5 flex flex-col items-center justify-center gap-y-10'>
                {alumno ? <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-2xl">{alumno[0].nombre_alumno}</p>
                    <h1 className="text-4xl mt-4">Cursos</h1>

                    <div className={`mt-5 grid grid-cols-1 gap-y-5 md:grid-cols-3 w-full gap-x-2`}>
                        {alumno.map(curso => {

                            return <div className="border-2 p-4 text-center">
                                <h2 className="text-2xl text-white">{curso.nombre_curso}</h2>
                                <div className="mt-5">
                                    <h3><span className="underline">Duración del curso:</span> <span className="text-green-400">{curso.duracion_curso} horas</span> </h3>
                                    <h3><span className="underline">Profesor:</span> <span className="text-green-400">{curso.relator_profesor}</span> </h3>

                                    <h3 className="mt-5 text-2xl underline ">Temario del curso:</h3>

                                    <p className="mt-7 wrap-break-word h-80 border overflow-y-scroll p-3 scheme-dark whitespace-pre-line">{curso.temario_curso}</p>

                                    {!socket_cursos[curso.token_curso]?.finalizado ? <button onClick={() => {
                                        if (socket_cursos.hasOwnProperty(curso.token_curso) && !socket_cursos[curso.token_curso]?.finalizado && socket_cursos[curso.token_curso].asistenciasHabilitadas && !socket_cursos[curso.token_curso]?.alumno?.asistenciaHabilitada) {
                                            socket.current?.emit('marcarAsistencia', {
                                                token: curso.token_curso,
                                                alumno: alumno[0].token_alumno
                                            })
                                        }
                                    }} className={`mt-5 w-full h-15 transition border-2 ${socket_cursos.hasOwnProperty(curso.token_curso) && !socket_cursos[curso.token_curso]?.finalizado && socket_cursos[curso.token_curso].asistenciasHabilitadas && !socket_cursos?.[curso.token_curso]?.alumno?.asistenciaHabilitada ? 'opacity-100' : 'opacity-50'}`}>
                                        Marcar asistencia
                                    </button> : Number(curso.calificacion) >= 75 ? <button onClick={() => {
                                        window.open(`${frontend}/certificados/${usuario}/${curso.token_curso}`,"_blank")
                                    }} className="cursor-pointer mt-5 w-full h-15 transition border-2 opacity-100">

                                        Ver certificado

                                    </button> : <button className="mt-5 w-full h-15 transition border-2 opacity-50">
                                        Curso finalizado
                                    </button>}
                                </div>
                            </div>
                        })}
                    </div>

                </div> : msg ? <p>{msg}</p> : 'Cargando...'}
            </div>
        </div>

        <Foter />
    </div >
}