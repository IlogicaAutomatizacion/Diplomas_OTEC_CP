import gotTitleBlanco from '../../../assets/CP/cr_fondo_blanco/title.png'
import gotTitleNegro from '../../../assets/CP/cr_fondo_negro/title.png'
import dadosNegro from '../../../assets/CP/cr_fondo_negro/dados.png'
import dadosBlanco from '../../../assets/CP/cr_fondo_blanco/dados.png'


import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
//import { backend, frontend } from '../../../vars'
import { obtenerDatosDeCertificadoConTokenDeCursoArmadoAsync } from '../../PanelAdministrador/Api/suscripciones';
import type { CursoConAlumno } from '../../PanelAdministrador/Api/cursos-armados';

// function fixDate(date: string) {
//     if (!date || !new Date(date)) { return date }

//     const newF = date.split('T')[0]

//     const [anio, mes, dia] = newF.split('-')


//     return `${dia}-${mes}-${anio}`

// }

function SetDarkModeB({ estado, fn }: {
    estado: boolean
    fn: React.Dispatch<React.SetStateAction<boolean>>
}) {
    return <button onClick={() => {
        fn(last => !last)
    }} className='bg-slate-800 text-white rounded-2xl print:hidden mt-5 max-w-30 p-2 mb-5 h-15'>
        {estado ? 'Modo claro' : 'Modo oscuro'}
    </button>
}

function useAutoFitText(selector: string, minSize = 4, maxSize = 14) {
    useEffect(() => {
        const elements: NodeListOf<HTMLDivElement> = document.querySelectorAll(selector);

        elements.forEach(el => {
            let size = maxSize;
            el.style.fontSize = size + "px";

            while (
                (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
                size > minSize
            ) {
                size -= 1;
                el.style.fontSize = size + "px";
            }
        });
    });
}

function BackCertificate({ datosAl}: { datosAl: CursoConAlumno, dark: boolean}) {
    return (
        <div className={`certificado-page lg:w-[297mm] print:w-[297mm] print:h-[209mm] bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0`}>

            <div className='p-10 pb-0'>
                <div className="text-center mb-6 border bg-[#833C0B]">
                    <h2 className="text-xl font-bold tracking-wide text-gray-50">TEMARIO:</h2>
                    <p className="text-2xl font-extrabold mt-2 text-gray-100">{datosAl.curso.nombre} ({datosAl.curso.duracion} {Number(datosAl.curso.duracion) !== 1 ? 'horas' : 'hora'})</p>
                </div>

                <div className="border  border-gray-400 p-6 auto-fit-parent leading-relaxed space-y-4">
                    <div className='space-y-4 font-bold h-80 ADP dark:text-white text-[clamp(0.3rem,20vw,0.5rem)] whitespace-pre-line' >
                        {datosAl.curso.temario}
                    </div>
                </div>

                <div className="mt-8 border border-gray-400 p-2">
                    {/* <p className="font-bold text-sm dark:text-gray-50 flex flex-row">Relatores: {datosAl.profesor.nombre} <span className='ml-5'><img src={img || undefined} className='h-15 w-20' alt="firma relator" /> </span> <span className='text-xs ml-5 whitespace-pre-line'>{datosAl.profesor.especialidad}</span> </p> */}
                </div>

                <div className=" text-center flex justify-center items-center flex-col mt-1 ">
                    {/* <img src={firmaGf || undefined} className='object-contain h-20 ' alt="" /> */}

                    <div className="h-1 w-50 border-b border-gray-400 mb-1"></div>
                    <p className="text-sm font-semibold dark:text-gray-50">Gianfranco Gonzalez Chavez</p>
                    <p className="text-xs text-gray-500 dark:text-gray-100">REP LEGAL GAME OF TRAINING OTEC</p>
                </div>
            </div>


        </div >
    );
}

export default ({ id_suscriptor }: { id_suscriptor: number }) => {
    const { token, token_curso } = useParams<{
        token: string
        token_curso: string
    }>()
    const [darkMode, setDarkMode] = useState<boolean>(false)


    const [datosCurso_almuno, setDatos] = useState<CursoConAlumno | null>(null)
    const [msg, setMsg] = useState<string | null>('Obteniendo datos del usuario...')

    useAutoFitText('.ADP')

    useEffect(() => {
    
        const original = document
            .querySelector("meta[name='viewport']")
            ?.getAttribute("content");

        // Reemplazar SOLO para esta página
        const meta = document.querySelector("meta[name='viewport']");
        if (meta) {
            meta.setAttribute("content", "width=1920, initial-scale=0.36");
        }

        // Restaurar al salir de esta página (opcional pero recomendado)


        const obtener = async () => {
            if (!token_curso || !token) { return }

            try {

                const curso_alumno = await obtenerDatosDeCertificadoConTokenDeCursoArmadoAsync(id_suscriptor, token_curso, token)

                setDatos(curso_alumno)

            } catch (e) {
                console.log(e)
                setMsg('Hubo un problema al obtener el certificado del alumno.')
            }
        }

        obtener()

        return () => {
            if (meta && original) {
                meta.setAttribute("content", original);
            }
        };
    }, [])

    // useEffect(() => {
    //     if (!datosCurso_almuno) { return }

    //     (async () => {
    //         try {
    //             const data = await fetch(`${backend}/imagen/${datosCurso_almuno.id_profesor}.png`)

    //             if (data.ok) {
    //                 const blob = await data.blob()
    //                 setImagenRelator(blob ? URL.createObjectURL(blob) : null)

    //             }

    //         } catch (e) {
    //             console.log(e)
    //         }

    //     })();

    //     (async () => {
    //         try {
    //             const data = await fetch(`${backend}/imagen/${'Gian'}.png`)

    //             if (data.ok) {
    //                 const blob = await data.blob()
    //                 setFirmaGf(blob ? URL.createObjectURL(blob) : null)

    //             }

    //         } catch (e) {
    //             console.log(e)
    //         }

    //     })()

    // }, [datosCurso_almuno])

    useEffect(() => {
        if (datosCurso_almuno) {
            setMsg(null)

        }
    }, [datosCurso_almuno])

    return msg ? <div className='w-[100vw] h-[100vh]  flex justify-center items-center'>
        <p id='loading' className='text-4xl text-center'>{msg}</p>
    </div> : datosCurso_almuno ? (
        <div className='h-[100vh] bg-gray-100  w-[100wv]'>
            <div className={`certificado-page  flex items-center print:h-auto justify-center bg-gray-100 flex-col print:flex-col ${darkMode ? 'dark' : null}`}>
                <div className='flex flex-row gap-x-2'>
                    <SetDarkModeB estado={darkMode} fn={setDarkMode} />
                    <button className='cursor-pointer bg-slate-800 text-white rounded-2xl print:hidden mt-5 max-w-30 p-2 mb-5 h-15' onClick={async () => {
                        try {
                            // setMsg('Preparando certificado...')

                            // const res = await fetch(`${backend}/certificado/${datosCurso_almuno.token_alumno}/${datosCurso_almuno.token_curso}`)
                            // const blob = await res.blob()

                            // const link = document.createElement("a");
                            // link.href = URL.createObjectURL(blob);
                            // link.download = `certificado_${datosCurso_almuno.id_alumno}.pdf`;
                            // link.click();

                            // URL.revokeObjectURL(link.href);

                            // setMsg(null)
                        } catch (e) {
                            setMsg('Hubo un problema al intentar descargar el certificado; vuelve a intentarlo.')

                        }
                    }}>
                        Descargar certificado
                    </button>
                </div>

                <div id='cert' className="relative overflow-hidden h-auto lg:w-[297mm] lg:h-[210mm] print:w-[297mm] print:h-[210mm] flex flex-col  items-center justify-center bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0">

                    <div className="absolute left-0 top-0 h-full opacity-100 w-72 dark:bg-linear-to-b bg-amber-700 dark:from-[#5E2700] dark:to-[#873801] transform -skew-x-29 -translate-y-35 -translate-x-75 lg:-translate-x-45"></div>
                    <div className="absolute left-0 top-0 h-full opacity-100 w-50 lg:w-90 bg-linear-to-b from-[#5E2700] to-[#873801] dark:from-[#E05A00] dark:to-[#DC6B1E]  transform skew-x-10 lg:skew-x-24 -translate-x-28 lg:-translate-x-46"></div>
                    <img src={darkMode ? dadosNegro : dadosBlanco} alt="logo" className={`absolute object-contain top-270 hidden lg:block  ${darkMode ? 'lg:top-145' : 'lg:top-132'} lg:-left-43  ${darkMode ? 'lg:h-55' : 'lg:h-75'} w-150 `} />

                    <div className="relative left-25">
                        <div className="relative px-12 py-10 flex justify-center flex-col items-center w-full">

                            <div className="lg:absolute -top-7  text-center lg:text-start lg:-left-70 w-full z-45 text-xs text-black dark:text-white opacity-100 ">:{`<`}{datosCurso_almuno.curso_armado_id}{`>`}-{`<`}{datosCurso_almuno.inscripcion.id_inscripcion}{`>`}-{`<`}{datosCurso_almuno.fecha_finalizacion}{`>`}</div>

                            <img src={darkMode ? gotTitleNegro : gotTitleBlanco} alt="logo" className={`lg:absolute object-contain  ${darkMode ? '-top-74' : '-top-108'} ${darkMode ? 'lg:h-155' : 'lg:h-225'}  ${darkMode ? 'w-150' : 'w-160'}`} />

                            <h1 className="text-6xl font-extrabold text-center tracking-tight mb-2 mt-5 dark:text-white">Certificado de Curso</h1>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">Organismo técnico de capacitación., RUT 77.457.296-1, certifica que:</p>

                            <div className="text-center">
                                <p className="text-4xl font-bold text-black dark:text-gray-50">{datosCurso_almuno.inscripcion.usuario.nombre}</p>
                                <p className="text-xs text-gray-700 mt-1 dark:text-gray-200">{datosCurso_almuno.inscripcion.usuario.id}</p>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-sm font-semibold dark:text-gray-100">Participó y aprobó el curso::</p>
                            </div>

                            <div className="mt-4 text-center max-w-130">
                                <p className="text-xl font-semibold dark:text-gray-50">{datosCurso_almuno.curso.nombre}</p>
                                <p className="text-xs text-gray-800 mt-2 dark:text-gray-200">Realizado los días: {datosCurso_almuno.fecha_inicio} AL {datosCurso_almuno.fecha_finalizacion}</p>
                                <p className="text-xs text-gray-800 mt-2 dark:text-gray-200">Número de asistencias: {datosCurso_almuno.inscripcion.asistencias}</p>

                            </div>

                            <div className="justify-items-center items-center mt-8 md:grid-cols-2 gap-6  flex flex-col lg:flex-row">
                                <div>
                                    <h3 className="font-semibold dark:text-gray-200">Temario cursado: {datosCurso_almuno.curso.duracion}  {Number(datosCurso_almuno.curso.duracion) !== 1 ? 'horas' : 'hora'}</h3>
                                    <ul className="mt-2 h-40  w-70 wrap-break-word ADP text-sm list-disc list-inside text-black space-y-1 whitespace-pre-line dark:text-gray-50">
                                        {datosCurso_almuno.curso.resumen}
                                    </ul>
                                </div>
                                <img className='size-40 bg-red border' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${'http//localhost:3000'}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" />
                            </div>


                            <div className="flex-col lg:flex-row relative mt-5 flex items-center justify-center">
                                <div className="text-center w-full gap-y-5 flex flex-col ">
                                    <p className='text-s text-start w-full text-gray-700 dark:text-gray-100'>Grado de aprobación del curso: {datosCurso_almuno.inscripcion.calificacion}%</p>

                                    <p className="text-xs text-gray-700 dark:text-gray-300">Este Certificado es entregado al interesado para fines y trámites que se estimen conveniente.</p>
                                </div>

                                <div className=" lg:absolute text-right w-full lg:left-25">
                                    <div className=" text-center flex justify-center items-center flex-col mt-10">
                                        {/* <img src={imagenFirmaGf || undefined} className='object-contain h-20 ' alt="" /> */}

                                        <div className="h-1 w-50 border-b border-gray-400 mb-1"></div>
                                        <p className="text-sm font-semibold dark:text-gray-50">Gianfranco Gonzalez Chavez</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-100">REP LEGAL GAME OF TRAINING OTEC</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>


                <BackCertificate datosAl={datosCurso_almuno} dark={darkMode} />

            </div>
        </div>
    ) : null
}
