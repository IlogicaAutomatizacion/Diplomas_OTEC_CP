import barraSuperior from '../../../assets/Formarte/barraSuperior.png'
import barraInferior from '../../../assets/Formarte/barraInferior.png'
import estellaLogo from '../../../assets/Formarte/EstrellaLogo.png'
import type { CursoConAlumno } from '../../PanelAdministrador/Api/cursos-armados'
import { b2Url, b2UsuarioBucket, frontend } from '../../../vars'

export default ({ datosCurso_almuno, fecha_vigencia }: { datosCurso_almuno: CursoConAlumno, fecha_vigencia: string | null }) => {
    return <div className='h-[100vh] bg-gray-100  w-[100wv]'>
        <div className={`certificado-page  flex items-center print:h-auto justify-center bg-gray-100 flex-col print:flex-col `}>


            <div id='cert' className="relative overflow-hidden h-auto lg:w-[297mm] lg:h-[100mm] print:w-[297mm] print:h-[100mm] flex flex-col  items-center justify-center bg-white dark:bg-black shadow-lg border border-gray-200 print:shadow-none print:border-0">

                {/* <img src={darkMode ? dadosNegro : dadosBlanco} alt="logo" className={`absolute object-contain top-270 hidden lg:block  ${darkMode ? 'lg:top-145' : 'lg:top-132'} lg:-left-43  ${darkMode ? 'lg:h-55' : 'lg:h-75'} w-150 `} /> */}

                <img
                    src={barraSuperior}
                    alt="logo"
                    className="absolute h-85 top-0  w-screen object-fit block"
                />


                <div className="absolute size-28 left-0 flex flex-row justify-center items-center top-0  object-cover block">
                    <img
                        src={estellaLogo}
                        alt="logo"
                    />
                    <p className='text-[30px] text-[#2F5597] absolute ml-62 text-center  font-bold italic'>OTEC FORMARTE</p>
                </div>

                <div className="absolute left-0 flex flex-row justify-center items-center ">
                    <div className="relative px-12 flex items-start flex-col w-full">


                        {/* <img className='size-20 bg-red  mt-8' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${'http//localhost:3000'}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" /> */}

                        <div className="mt-15  max-w-130 flex flex-col">
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>NOMBRE:</p><span className='text-[#102d4b] font-bold'>{String(datosCurso_almuno.inscripcion.usuario.nombre).toUpperCase()}</span></div>
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>RUT:</p> <span className='text-[#102d4b] font-bold'>{datosCurso_almuno.inscripcion.usuario.rut}</span></div>
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>EMPRESA:</p> <span className='text-[#102d4b] font-bold'>{String(datosCurso_almuno.empresa.nombre).toUpperCase()}</span></div>
                            <br />
                            <br />
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>CARGO:</p> <span className='text-[#102d4b] font-bold'>{datosCurso_almuno.inscripcion.usuario.especialidad}</span></div>
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>COMPETENCIA:</p> <span className='text-[#102d4b] font-bold'>{datosCurso_almuno.curso.nombre}</span></div>
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>VALIDEZ:</p> <span className='text-[#102d4b] font-bold'>{datosCurso_almuno.fecha_finalizacion}</span></div>
                            <div className='flex flex-row'><p className='text-gray-800 font-semibold w-33 '>VIGENCIA:</p> <span className='text-[#102d4b] font-bold'>{fecha_vigencia}</span></div>

                        </div>

                    </div>


                </div>

                <img className='mt-15 w-25 h-25 z-10  mr-30 object-cover rounded-lg   ' src={`https://${b2UsuarioBucket}.${b2Url}/${datosCurso_almuno.inscripcion.usuario.foto_perfil}`} alt="" />

                <img className='absolute size-20 bg-red ml-80 mt-14' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${frontend}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" />

                <div className="absolute right-0 flex flex-row justify-center items-center z-1 top-0 mt-5">
                    <div className="relative px-12 flex justify-start items-start flex-col w-140">


                        {/* <img className='size-20 bg-red  mt-8' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${'http//localhost:3000'}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" /> */}

                        <p className='text-start  mr-5 text-[#28639e] text-sm font-semibold'>
                            Se certifica que el portador de la presente rindió y aprobó exámenes
                            Teóricos y prácticos de la competencia normada con ANSI B30.1 – B30.9
                        </p>

                        <p className='text-start mr-5  text-[#194068] mt-5 text-sm font-bold'>
                            EXCLUSIVO EMPRESA: {String(datosCurso_almuno.empresa.nombre).toUpperCase()}
                        </p>

                    </div>

                </div>

                <div className="absolute right-0 flex flex-row justify-center items-center z-1 mt-42">
                    <div className="relative px-12 flex justify-center items-center flex-col w-full text-[14px]">


                        {/* <img className='size-20 bg-red  mt-8' src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${'http//localhost:3000'}/certificados/${datosCurso_almuno.inscripcion.usuario.token}/${datosCurso_almuno.token_curso}`)}`} alt="" /> */}

                        <p className='text-center w-60 mr-5 text-[#23476b] font-semibold'>
                            Certificado por:&nbsp;{datosCurso_almuno.profesor.nombre} <br />
                            {datosCurso_almuno.profesor.especialidad}
                        </p>
                        <br />
                        <p className='text-center w-70 mr-5 text-[#23476b] font-semibold'>
                            Credencial Personal e Intransferible
                            En caso de Perdida avisar al fono
                            55-2820164
                            CALAMA, DICIEMBRE 2025
                        </p>

                    </div>

                </div>

                <img
                    src={barraInferior}
                    alt="logo"
                    className="absolute z-0 -bottom-30 right-0 size-135 bg-center object-fit h-auto block"
                />

            </div>

            <div className='print:hidden flex flex-col items-center'>
                <img className='mt-15 w-40 h-40  ring-7 ring-offset-2 ring-cyan-200 object-cover rounded-lg print:hidden bg-black shadow-lg ' src={`https://${b2UsuarioBucket}.${b2Url}/${datosCurso_almuno.inscripcion.usuario.foto_perfil}`} alt="" />
                <p className='mt-5 text-center border-b-2 font-black '>{String(datosCurso_almuno.inscripcion.usuario.nombre).toUpperCase()}</p>
            </div>
        </div>
    </div>
}