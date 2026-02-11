import barraSuperior from '../../../assets/Formarte/barraSuperior.png'
import barraInferior from '../../../assets/Formarte/barraInferior.png'
import estellaLogo from '../../../assets/Formarte/EstrellaLogo.png'

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDatosDeCertificadoConTokenDeCursoArmadoAsync, obtenerPdfDeCertificado } from '../../PanelAdministrador/Api/suscripciones';
import type { CursoConAlumno } from '../../PanelAdministrador/Api/cursos-armados';
import CertificadoMini from './CertificadoMini';
import { frontend } from '../../../vars';

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

function BackCertificate({ datosCurso_almuno }: { datosCurso_almuno: CursoConAlumno }) {
    return (
        <div className={`certificado-page lg:w-[297mm] print:w-[297mm] print:h-[209mm] bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0`}>

            <div id='cert' className="relative overflow-hidden h-auto lg:w-[297mm] lg:h-[210mm] print:w-[297mm] print:h-[210mm] flex flex-col  items-center justify-center bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0">

                <img
                    src={barraSuperior}
                    alt="logo"
                    className="absolute h-55 top-0 -left-15 w-screen object-cover block"
                />

                <div className="absolute size-28 right-60 mt-3 flex flex-row justify-center items-center top-0">
                    <img
                        src={estellaLogo}
                        alt="logo"
                    />
                    <p className='text-[36px] text-[#199CD8] absolute ml-55 mt-17 font-semibold'>FORMARTE </p>
                    <p className='absolute max-auto text-[20px] ml-56 mt-35 font-semibold w-full'>{datosCurso_almuno.fecha_finalizacion}</p>
                </div>

                <div className="relative flex justify-center items-center flex-col ">
                    <div className="relative mb-35 px-12 flex justify-center flex-col items-center w-full" />

                    <div className="flex-col basis-full lg:flex-row z-10 text-[10px] text-center w-190 mt-123 flex items-center justify-center">
                        <p className='text-blue-600'>
                            OTEC FORMARTE – ORGANISMO TECNICO DE CAPACITACION <br />
                            OTEC 76997.778-3 <br />
                            Solo Para Cursos Sence: Actividad de capacitación financiada, total o parcialmente, a través de la franquicia tributaria de capacitación, administrada por el Servicio Nacional de Capacitación y Empleo, Gobierno de Chile. Actividad no conducente al otorgamiento de un título o grado académico <br />
                            BALMACEDA 4085  CALAMA - +56 926351137 - +569 58021176 www.formartecertifica.cl
                        </p>
                    </div>
                </div>

                <img
                    src={barraInferior}
                    alt="logo"
                    className="absolute -bottom-20 right-0 size-135 object-fit h-auto"
                />

            </div>

        </div>
    );
}

export default ({ id_suscriptor }: { id_suscriptor: number }) => {
    const { token, token_curso } = useParams<{
        token: string
        token_curso: string
    }>();

    const navigate = useNavigate();

    const search = new URLSearchParams(window.location.search);
    const view = search.get("view") ?? "diploma"; // <-- MUY IMPORTANTE

    const [datosCurso_almuno, setDatos] = useState<CursoConAlumno | null>(null);
    const [msg, setMsg] = useState<string | null>('Obteniendo datos del usuario...');

    useAutoFitText('.ADP');

    useEffect(() => {
        const obtener = async () => {
            if (!token_curso || !token) { return }

            try {
                const curso_alumno = await obtenerDatosDeCertificadoConTokenDeCursoArmadoAsync(id_suscriptor, token_curso, token);
                setDatos(curso_alumno);
                setMsg(null);
            } catch (e) {
                setMsg('Hubo un problema al obtener el certificado del alumno.');
            }
        };

        obtener();
    }, []);

    if (msg) return (
        <div className='w-[100vw] h-[100vh] flex justify-center items-center'>
            <p id='loading' className='text-4xl text-center'>{msg}</p>
        </div>
    );

    if (!datosCurso_almuno) return null;

    // --------------------------
    // GENERAR URL CON VIEW
    // --------------------------
    const urlDiploma = `${window.location.origin}${window.location.pathname}?view=diploma`;
    const urlCertificado = `${window.location.origin}${window.location.pathname}?view=certificado`;

    return (
        <div>

            {/* Botones */}
            <div className='flex flex-row justify-center items-center gap-x-2 bg-gray-100'>
                {/* PDF */}
                <button
                    className='cursor-pointer bg-slate-800 text-white rounded-2xl print:hidden mt-5 max-w-30 p-2 mb-5 h-15'
                    onClick={async () => {
                        try {
                            const blob = await obtenerPdfDeCertificado(
                                id_suscriptor,
                                view === "diploma" ? urlDiploma : urlCertificado
                            );

                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "certificado.pdf";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);

                        } catch (e) {
                            console.log(e);
                            setMsg("Hubo un problema al intentar descargar el certificado; vuelve a intentarlo.");
                        }
                    }}>
                    {view === "diploma" ? "Descargar diploma" : "Descargar certificado"}
                </button>

                {/* Cambiar vista */}
                <button
                    className='cursor-pointer bg-sky-800 text-white rounded-2xl print:hidden mt-5 max-w-30 p-2 mb-5 h-15'
                    onClick={() => {
                        navigate(view === "diploma" ? urlCertificado : urlDiploma);
                    }}>
                    {view === "diploma" ? "Ver certificado" : "Ver diploma"}
                </button>
            </div>

            {/* Renderizado según view */}
            {view === "diploma"
                ? (
                    <div className='h-[100vh] bg-gray-100  w-[100wv]'>
                        <div className={`certificado-page  flex items-center print:h-auto justify-center bg-gray-100 flex-col print:flex-col `}>


                            <div id='cert' className="relative overflow-hidden h-auto lg:w-[297mm] lg:h-[210mm] print:w-[297mm] print:h-[210mm] flex flex-col  items-center justify-center bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0">

                                {/* <img src={darkMode ? dadosNegro : dadosBlanco} alt="logo" className={`absolute object-contain top-270 hidden lg:block  ${darkMode ? 'lg:top-145' : 'lg:top-132'} lg:-left-43  ${darkMode ? 'lg:h-55' : 'lg:h-75'} w-150 `} /> */}

                                <img
                                    src={barraSuperior}
                                    alt="logo"
                                    className="absolute h-55 top-0 -left-15 w-screen object-cover block"
                                />


                                <div className="absolute size-28 right-60 mt-3 flex flex-row justify-center items-center top-0  object-cover block">
                                    <img
                                        src={estellaLogo}
                                        alt="logo"
                                    />
                                    <p className='text-[36px] text-[#199CD8] absolute ml-55 mt-17 font-semibold'>FORMARTE</p>
                                </div>


                                <div className="relative flex justify-center items-center flex-col ">
                                    <div className="relative mb-35 px-12 flex justify-center flex-col items-center w-full">

                                        {/* <div className="lg:absolute -top-7  text-center  w-full z-45 text-xs text-black dark:text-white opacity-100 ">:{`<`}{datosCurso_almuno.curso_armado_id}{`>`}-{`<`}{datosCurso_almuno.inscripcion.id_inscripcion}{`>`}-{`<`}{datosCurso_almuno.fecha_finalizacion}{`>`}</div> */}

                                        {/* <img src={darkMode ? gotTitleNegro : gotTitleBlanco} alt="logo" className={`lg:absolute object-contain  ${darkMode ? '-top-74' : '-top-108'} ${darkMode ? 'lg:h-155' : 'lg:h-225'}  ${darkMode ? 'w-150' : 'w-160'}`} /> */}


                                        <h1 className="text-4xl font-semibold text-center  mb-2 mt-55 dark:text-white">{'D  I  P  L  O  M  A'.split('').join('  ')}</h1>
                                        <p className="text-center text-[32px] text-semibold mt-6">{'Sr. Yoel Jose Idrobo Urbina'}</p>

                                        <div className="text-center">
                                            <p className="text-sm font-bold text-black dark:text-gray-50">Rut: {datosCurso_almuno.inscripcion.usuario.rut}</p>
                                        </div>

                                        <img className='size-20 bg-red mt-8' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${frontend}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" />

                                        <div className="mt-4 text-center max-w-130">
                                            <p className="dark:text-gray-50">Aprobó curso: <span className='text-semibold'>{datosCurso_almuno.curso.nombre}</span></p>
                                            <p className="">
                                                <span>Asistencia:  <span className='text-semibold'>{datosCurso_almuno.inscripcion.asistencias}</span> - </span>
                                                <span>Teórico:  <span className='text-semibold'>{datosCurso_almuno.inscripcion.calificacion}</span> - </span>
                                                <span>Práctica:  <span className='text-semibold'>{'100%'}</span> - </span>
                                                <span>Duración:  <span className='text-semibold'>{datosCurso_almuno.curso.duracion}</span> {Number(datosCurso_almuno.curso.duracion) > 1 ? 'horas.' : 'hora.'}</span>

                                                <p className='text-semibold'>
                                                    Validez Certificación: {datosCurso_almuno.fecha_finalizacion}
                                                </p>

                                                <p className='text-semibold'>
                                                    USO EXCLUSIVO EMPRESA: {datosCurso_almuno.empresa?.nombre}
                                                </p>

                                                <div className='absolute z-30 mt-10 ml-90 w-70'>
                                                    <p className='text-semibold'>
                                                        Franklin Ramírez Lambreht <br />
                                                        Director Ejecutivo

                                                    </p>
                                                </div>
                                            </p>

                                        </div>




                                    </div>

                                    <div className="flex-col  basis-full lg:flex-row z-10 text-[10px] text-center w-190 mb-25 flex items-center justify-center">
                                        <p className='text-blue-600'>
                                            OTEC FORMARTE – ORGANISMO TECNICO DE CAPACITACION <br />
                                            OTEC 76997.778-3 <br />
                                            Solo Para Cursos Sence: Actividad de capacitación financiada, total o parcialmente, a través de la franquicia tributaria de capacitación, administrada por el Servicio Nacional de Capacitación y Empleo, Gobierno de Chile. Actividad no conducente al otorgamiento de un título o grado académico <br />
                                            BALMACEDA 4085  CALAMA - +56 926351137 - +569 58021176 www.formartecertifica.cl

                                        </p>

                                    </div>
                                </div>

                                <img
                                    src={barraInferior}
                                    alt="logo"
                                    className="absolute  -bottom-20 right-0 size-135 bg-center object-fit h-auto block"
                                />

                            </div>


                            <BackCertificate datosCurso_almuno={datosCurso_almuno} />

                        </div>
                    </div>
                )
                : <CertificadoMini datosCurso_almuno={datosCurso_almuno} />
            }

        </div>
    );
}
