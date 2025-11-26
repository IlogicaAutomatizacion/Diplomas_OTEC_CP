import {  useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Foter from "../Diseño/Foter"

import Logo from "../Diseño/CxLogo"
import { io, Socket } from "socket.io-client"
import { backend } from "../vars"

export default () => {
    const { profesor } = useParams<{
        profesor: string
    }>()

    const [profesorR, setProfesorR] = useState<{
        cursos: {
            alumnos: Record<string, string>[],
            duracion_curso: number,
            id_curso: number,
            nombre_curso: string,
            programado: boolean,
            finalizado: boolean
            temario_curso: string,
            token_curso: string,
            clases: number
        }[],
        relator_profesor: string,
        token_profesor: string
    }[] | null>(null)
    const [msg, setMsg] = useState<string | null>(null)
    
    const socket = useRef<Socket | null>(null)

    const [socket_cursos, setSocket_cursos] = useState<Record<string, { asistenciasHabilitadas?: boolean, listoParaFinalizar?: boolean, finalizado?: boolean }>>({})

    const [clases, setClases] = useState<number | null>(null)
    const [_, setUsuarioActualizado] = useState(false)

    useEffect(() => {
        const obtener = async () => {
            try {
                const res = await fetch(`${backend}/profesor/${profesor}`)

                const js = await res.json()

                console.log(js)

                if (!js || !js.hasOwnProperty('profesor') || !js.profesor[0]) { setMsg('No se encontraron datos del usuario.'); return }

                setProfesorR(js.profesor)

            } catch (e) {
                console.log(e)
                setMsg(JSON.stringify(e))
            }
        }

        obtener()
    }, [])

    useEffect(() => {
        console.log(profesorR)

        if (!profesorR) { return }

        console.log(profesorR[0], 'uhhhhhhhhh')
        socket.current = io(`${backend}`, {
            auth: {
                token: profesorR[0].token_profesor
            }
        })

        socket.current.on('asistenciasHabilitadas', (data) => {
            console.log(data)
            if (data) {
                setSocket_cursos(last => {
                    return { ...last, [data.token]: data }
                })

                setUsuarioActualizado(last => !last)
            }

        })

        return () => {
            socket.current?.disconnect()
        }
    }, [profesorR])

    useEffect(() => {
        if (!profesorR?.[0]?.cursos) return;

        setMsg(null);

        profesorR[0].cursos.forEach((curso) => {
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
                console.log(info);

                setSocket_cursos(last => ({
                    ...last,
                    [curso.token_curso]: info ?? {

                        asistenciasHabilitadas: false,
                        listoParaFinalizar: false
                    }
                }));
            });
        });
    }, [profesorR])

    return <div className='bg-[#131516] w-[100%] min-h-[100vh]'>

        <div className='w-[100%] pt-10 min-h-[100vh]  flex justify-center items-center flex-col bg-[#131516] text-white'>
            <Logo />

            <div className='w-[90%] h-[85%] border text-white p-5 flex flex-col items-center justify-center gap-y-10'>
                {profesorR ? <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-2xl">{profesorR[0].relator_profesor}</p>
                    <h1 className="text-4xl mt-4">Cursos</h1>

                    <div className={`mt-5 grid grid-cols-1 gap-y-5 md:grid-cols-3  gap-x-2`}>
                        {profesorR[0].cursos.map((curso, indx) => {
                            return <div key={indx} className="border-2 p-4 text-center">
                                <h2 className="text-2xl text-white">{curso.nombre_curso}</h2>
                                <div className="mt-5">
                                    <h3><span className="underline">Numero de clases:</span> <span className="text-green-400"> {clases ?? curso.clases}</span> </h3>

                                    <h3><span className="underline">Duración del curso:</span> <span className="text-green-400">{curso.duracion_curso} horas</span> </h3>

                                    <h3 className="mt-5 text-2xl underline">Alumnos:</h3>

                                    <div className="mt-5 grid grid-cols-4 w-full ">
                                        {['Nombre', 'Correo', 'Asistencias', 'Calificacion'].map((header, indx) => {
                                            return <div key={indx} className="bg-slate-700 border-2 p-2 wrap-break-word">
                                                {header}
                                            </div>
                                        })}

                                        {
                                            curso.alumnos.map(subHeader => {
                                                const vals = [
                                                    'nombre_alumno', 'correo_alumno', 'asistencias', 'calificacion'
                                                ]

                                                return vals.map((sub, indx) => {
                                                    return sub == "calificacion" ?
                                                        <textarea
                                                            onBlur={(e) => {
                                                                const val = e.target.value.replace(/\D/g, "")
                                                                e.target.value = val.trim()

                                                                if (val != '') {
                                                                    socket.current?.emit('actualizarCalificacion', {
                                                                        token: curso.token_curso,
                                                                        alumno: subHeader.token_alumno,
                                                                        calificacion: e.target.value
                                                                    }, (res: null | boolean) => {
                                                                        console.log(res, 'AAAAAAAAAAAAAAAAAAAAAAA')
                                                                        if (!res) { e.target.value = ''; return }

                                                                    })
                                                                }
                                                            }}
                                                            key={indx} placeholder={subHeader[sub]} className="text-center border-2 p-2 wrap-break-word resize-none">
                                                            {subHeader[sub]}
                                                        </textarea> : <div key={indx} className="border-2 p-2 wrap-break-word">
                                                            {subHeader[sub]}
                                                        </div>
                                                })
                                            })
                                        }
                                    </div>

                                    <button className={`mt-5 w-full h-15 border-2 ${socket_cursos[curso.token_curso]?.finalizado ? 'opacity-50' : 'opacity-100'} `} onClick={
                                        () => {
                                            if (socket_cursos[curso.token_curso]?.finalizado) { return }

                                            const nuevoValor = !socket_cursos[curso.token_curso].asistenciasHabilitadas

                                            socket.current?.emit(
                                                'habilitarAsistencias',
                                                {
                                                    profesor,
                                                    token: curso.token_curso,
                                                    asistenciaHabilitada: nuevoValor
                                                },
                                                (res: number | null) => {
                                                    if (res) setClases(res)
                                                }
                                            )

                                            setSocket_cursos(last => {
                                                const cp = { ...last }
                                                cp[curso.token_curso].asistenciasHabilitadas = nuevoValor

                                                return cp
                                            })

                                        }}>
                                        {!socket_cursos.hasOwnProperty(curso.token_curso) || socket_cursos[curso.token_curso]?.finalizado || !socket_cursos[curso.token_curso].asistenciasHabilitadas ? <p>Habilitar asistencias</p> : <p>Descactivar asistencias</p>}
                                    </button>

                                    <button className={`mt-5 transition w-full h-15 border-2 ${socket_cursos.hasOwnProperty(curso.token_curso) && !socket_cursos[curso.token_curso]?.finalizado && socket_cursos[curso.token_curso].listoParaFinalizar ? 'opacity-100' : 'opacity-50'} `} onClick={
                                        () => {
                                            if (socket_cursos.hasOwnProperty(curso.token_curso) && !socket_cursos[curso.token_curso]?.finalizado && socket_cursos[curso.token_curso].listoParaFinalizar) {
                                                socket.current?.emit('finalizarCurso', {
                                                    token: curso.token_curso,
                                                    profesor
                                                }, (finalizado: true | null) => {
                                                    console.log(finalizado)
                                                    if (!finalizado) {
                                                        setSocket_cursos(last => {
                                                            const cp = { ...last }

                                                            delete cp[curso.token_curso].finalizado

                                                            return cp
                                                        });
                                                    }
                                                })

                                                if (!curso.finalizado) {
                                                    setSocket_cursos(last => {
                                                        const cp = { ...last }

                                                        cp[curso.token_curso].finalizado = true

                                                        return cp
                                                    });
                                                    return
                                                }
                                            }
                                        }
                                    }>
                                        Finalizar curso
                                    </button>
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