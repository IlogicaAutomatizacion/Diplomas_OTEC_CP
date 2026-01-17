import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

interface usuario {
    Rut: string,
    Nombre: string,
    Email: string,
    Empresa?: string,
    Direccion?: string | null,
    Especialidad?: string | null,
    Telefono?: number | null
}

interface empresa {
    Rut: string,
    Nombre: string,
    Email: string,
    Telefono: string,
    Contacto: string
}

interface curso {
    Nombre: string,
    Duracion: number,
    Resumen: string,
    Temario: string
}

const UsuarioCard = ({ Email, Nombre, Rut, Direccion, Especialidad, Empresa, Telefono }: usuario) => {

    const [infoAbierta, setInfoAbierta] = useState<boolean>(true)

    return <div className={`border p-2 w-full h-auto overflow-x-hidden flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{Nombre}</h2>

        {infoAbierta ? <div className="flex flex-col mt-5 gap-y-1 break-all">
            <div className="overflow-y-auto h-auto [&::-webkit-scrollbar]:hidden">
                <p><span className="text-emerald-500 ">Empresa</span>: {Empresa ?? 'Sin dato'} </p>
                <p><span className="text-emerald-500 ">Especialidad:</span> {Especialidad ?? 'Sin dato.'}</p>
                <p><span className="text-emerald-500 ">Rut:</span> {Rut ?? 'Sin dato.'}</p>
                <p><span className="text-emerald-500 ">Email:</span> {Email ?? 'Sin dato.'}</p>
                <p><span className="text-emerald-500 ">Teléfono:</span> {Telefono ?? 'Sin dato.'}</p>
                <p><span className="text-emerald-500 ">Direccion:</span> {Direccion ?? 'Sin dato'}</p>
            </div>

            <div className="h-25 flex flex-col justify-center mt-5 ">
                <div>
                    <div className="flex flex-row gap-x-5 ">
                        <h3 className="text-2xl text-center">Roles</h3>
                    </div>
                </div>

                <div className="overflow-y-auto h-20 border grid grid-cols-3 ">

                </div>

            </div>
        </div> : null}
    </div >
}

const EmpresaCard = ({ Email, Nombre, Rut, Contacto, Telefono }: empresa) => {
    const [infoAbierta, setInfoAbierta] = useState<boolean>(true)

    return <div className={`border p-2 w-full h-auto overflow-x-hidden  overflow-y-auto flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{Nombre}</h2>

        {infoAbierta ? <div className="flex flex-col mt-5 gap-y-1 break-all">
            <div className="overflow-y-auto h-40 [&::-webkit-scrollbar]:hidden">
                <p><span className="text-blue-400 ">Rut</span>: {Rut ?? 'Sin dato'} </p>
                <p><span className="text-blue-400 ">Nombre:</span> {Nombre ?? 'Sin dato.'}</p>
                <p><span className="text-blue-400 ">Teléfono:</span> {Telefono ?? 'Sin dato.'}</p>
                <p><span className="text-blue-400 ">Email:</span> {Email ?? 'Sin dato.'}</p>
                <p><span className="text-blue-400 ">Nombre del contacto:</span> {Contacto ?? 'Sin dato.'}</p>
            </div>

        </div> : null}
    </div>
}

const CursoCard = ({ Nombre, Duracion, Resumen, Temario }: curso) => {
    const [infoAbierta, setInfoAbierta] = useState<boolean>(true)

    return <div className={`border p-2 max-w-full overflow-x-hidden  flex flex-col `}>
        <h2 onClick={() => {
            setInfoAbierta(last => !last)
        }} className="cursor-pointer border-b text-center">{Nombre}</h2>

        {infoAbierta ? <div className="flex flex-col mt-5 gap-y-1 break-all">
            <div className="overflow-y-auto  [&::-webkit-scrollbar]:hidden whitespace-pre-line">
                <p><span className="text-red-400 ">Nombre</span> {Nombre ?? 'Sin dato'} </p>
                <p><span className="text-red-400 ">Duracion:</span> {Duracion ?? 'Sin dato.'}</p>
                <p><span className="text-red-400 ">Resumen:</span> {Resumen ?? 'Sin dato.'}</p>
                <p><span className="text-red-400 ">Temario:</span> {Temario ?? 'Sin dato.'}</p>
            </div>
        </div> : null}
    </div>
}

function Example() {
    return (
        <Menu as="div" className=" inline-block">
            <MenuButton className="cursor-pointer inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                Options
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute  flex justify-center items-center mt-2  origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1 whitespace-pre-line max-h-50 overflow-y-auto">
                    <MenuItem>
                        <a

                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Account settings
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Support
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className=" block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            1. Introducción a los Sistemas Integrados de Gestión (SIG)
                            Concepto de Sistema de Gestión./Ventajas de integrar ISO 9001, ISO 14001 e ISO 45001./Principios comunes: ciclo PHVA, enfoque a procesos, mejora continua./Estructura de alto nivel (HLS – High Level Structure)./Ejemplos prácticos de integración en organizaciones reales.
                            2. Requisitos normativos (ISO 9001, ISO 14001, ISO 45001)
                            Estructura de las normas (Cláusulas 4 a 10)./Requisitos específicos por norma y requisitos comunes./Análisis comparativo entre normas (mapa de integración)./Enfoque a procesos y gestión de riesgos y oportunidades./Actividades prácticas de análisis documental y aplicación.
                            3. Proceso de certificación y acreditación
                            Definición de certificación vs. acreditación./Organismos de certificación y acreditación (ej. INN, UKAS)./Etapas del proceso: solicitud, auditoría documental, auditoría in situ, informe final, seguimiento./Ciclo de certificación (3 años), auditorías de seguimiento y renovación./Buenas prácticas para preparar una auditoría externa.
                            4. Términos y definiciones del proceso de auditoría
                            Auditoría, auditor, auditado, hallazgo, no conformidad, conformidad, evidencia objetiva, criterio de auditoría./Tipos de auditoría: interna, externa, de primera, segunda y tercera parte./Casos prácticos de uso de términos.
                            5. Principios de auditoría
                            Integridad./Presentación imparcial./Debido cuidado profesional./Confidencialidad./Independencia./Enfoque basado en evidencia./Enfoque basado en riesgo./Ejercicios de análisis de dilemas éticos.
                            6. Gestión del programa de auditoría
                            Definición y elementos del programa de auditoría/Establecimiento de objetivos y alcance./Asignación de recursos y competencias./Revisión, monitoreo y mejora del programa./Planificación anual del programa integrado./Uso de herramientas de planificación (Gantt, software).
                            7. Realización de auditorías (planeación, ejecución y reporte)
                            Planificación de la auditoría (plan, lista de verificación)./Reunión de apertura./Ejecución: entrevistas, revisión documental, observaciones./Técnicas de auditoría: muestreo, trazabilidad, análisis de riesgos./Reunión de cierre./Elaboración del informe de auditoría./Identificación y redacción de hallazgos./Seguimiento de acciones correctivas.

                        </a>
                    </MenuItem>
                    <form action="#" method="POST">
                        <MenuItem>
                            <button
                                type="submit"
                                className="block w-full px-4 py-2 text-left text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                            >
                                Sign out
                            </button>
                        </MenuItem>
                    </form>
                </div>
            </MenuItems>
        </Menu>
    )
}

const CursoArmadoCard = () => {
    const [infoAbierta, setInfoAbierta] = useState<boolean>(true)

    const [usuariosAbiertos, setUsuariosAbiertos] = useState<boolean>(true)

    const [botonesVisible, setBotonesVisible] = useState<boolean>(false)

    return <div className={`border p-2 h-auto overflow-x-hidden  flex flex-col `}>

        <div className="flex flex-col h-auto gap-y-1 break-all">
            <h2 onClick={() => {
                setInfoAbierta(last => {
                    const df = !last

                    if (!df) {
                        setUsuariosAbiertos(false)
                        setBotonesVisible(false)
                    }

                    return !last
                })
            }} className="border-b cursor-pointer text-center">{'Sin nombre'}</h2>

            {infoAbierta ? <div onMouseEnter={() => {
                setBotonesVisible(true)
            }} onMouseLeave={() => {
                setBotonesVisible(false)
            }} className={` overflow-y-auto h-full border flex flex-col gap-y-3 p-2 [&::-webkit-scrollbar]:hidden whitespace-pre-line`}>
                <p><span className="text-cyan-400 ">Curso: </span> <span >{<Example />} </span> </p>
                <p><span className="text-cyan-400 ">Profesor: </span> <span>{<Example />} </span> </p>
                <p><span className="text-cyan-400 ">Fecha de inicio: </span> <input className='border' type="date" /> </p>
                <p><span className="text-cyan-400 ">Fecha de finalización: </span> <input className='border' type="date" /> </p>
                <p className='text-red-400 text-start w-full'> Inactivo </p>

                <div className='w-full h-auto border p-2'>
                    <div className='cursor-pointer text-2xl flex flex-row w-full '>
                        <h2 onClick={() => {
                            setUsuariosAbiertos(last => !last)
                        }} className='ml-auto'>Estudiantes</h2>
                        <span className='ml-auto'><Example /></span>
                    </div>

                    {usuariosAbiertos ? <ul className='list-disc mt-3 pl-2 max-h-40 overflow-y-auto'>
                        <li className='w-full hover:ring-2 ring-blue-500  h-auto  flex p-2 flex-row'>
                            <p className=' mr-4 max-w-[70%] '>Angel </p>
                            <button className=' h-[20%] w-[30%] border bg-red-400 ml-auto cursor-pointer'>
                                -
                            </button>
                        </li>

                    </ul> : null}
                </div>

                <div className='botones flex flex-col gap-y-2'>
                    <button className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-green-600`}>
                        Iniciar
                    </button>
                    <button className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-blue-400`}>
                        Finalizar
                    </button>
                    <button className={`${botonesVisible ? '' : 'hidden'} h-10 w-full cursor-pointer bg-red-400`}>
                        Eliminar
                    </button>
                </div>
            </div> : null}
        </div>
    </div >
}


export default () => {
    return <div id="fondo" className=" w-full h-full  bg-[#131516] flex justify-center items-center">
        <div id="contenedor-principal" className="my-5 ring-4 ring-green-500 rounded-2xl p-2 max-w-400 flex justify-center flex-col items-center min-h-200 border text-white ">
            <h1 id="titulo" className="text-7xl ">
                Administrador de usuarios
            </h1>

            <div id="contenedor-botones" className="mb-2 w-full p-2 h-15 flex flex-row border mt-5 justify-end gap-x-2">
                <input id="buscador" type="text" className="h-full p-2 border" placeholder="Buscar" />

                <button id='guardar-datos' className="bg-green-400 h-full p-2 border">
                    Guardar
                </button>
            </div>

            <div className=" w-full h-auto flex justify-center flex-col items-center border">
                <h2 className="text-3xl mt-25">Armar cursos (16) <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'><button className=' cursor-pointer'>Agregar</button></span></h2>
                <div id="tabla-cursos-armados" className="w-[95%] auto-rows-max grid m-5 gap-y-2 content-start grid-cols-4 p-2 overflow-y-scroll h-245 bg-scroll-[#131516]  border-5">
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                    <CursoArmadoCard />
                </div>

                <h2 className="text-3xl mt-25">Usuarios (16)</h2>
                <div id="tabla-usuarios" className="w-[95%] auto-rows-max grid m-5 content-start gap-y-2 grid-cols-4 p-2 overflow-y-scroll h-145 bg-scroll-[#131516] border-5">

                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />

                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.comangel74977comangel74977comangel74977comangel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />

                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />
                    <UsuarioCard Nombre="Angel Jasiel Almuina Garcia" Email="angel74977@gmail.com" Rut="342432423" />

                </div>

                <h2 className="text-3xl mt-25">Empresas (16)</h2>
                <div id="tabla-empresas" className="w-[95%] grid m-5 gap-y-2 grid-cols-4 p-2 overflow-y-scroll h-145 bg-scroll-[#131516] auto-rows-max border-5">

                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />
                    <EmpresaCard Nombre="Volcan Nevado" Contacto="Ninguno" Email="ang@g.co" Rut="214332" Telefono="213432" />

                </div>

                <h2 className="text-3xl mt-25">Cursos (16) <span className='h-10 ml-5 bg-green-600 max-w-10 border p-2'><button className=' cursor-pointer'>Agregar</button></span></h2>
                <div id="tabla-cursos" className="w-[95%] grid m-5 gap-y-2 grid-cols-1 p-2 overflow-y-scroll auto-rows-max content-start bg-scroll-[#131516]  border-5">

                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="1. Introducción a los Sistemas Integrados de Gestión (SIG)
Concepto de Sistema de Gestión./Ventajas de integrar ISO 9001, ISO 14001 e ISO 45001./Principios comunes: ciclo PHVA, enfoque a procesos, mejora continua./Estructura de alto nivel (HLS – High Level Structure)./Ejemplos prácticos de integración en organizaciones reales.

2. Requisitos normativos (ISO 9001, ISO 14001, ISO 45001)
Estructura de las normas (Cláusulas 4 a 10)./Requisitos específicos por norma y requisitos comunes./Análisis comparativo entre normas (mapa de integración)./Enfoque a procesos y gestión de riesgos y oportunidades./Actividades prácticas de análisis documental y aplicación.

3. Proceso de certificación y acreditación
Definición de certificación vs. acreditación./Organismos de certificación y acreditación (ej. INN, UKAS)./Etapas del proceso: solicitud, auditoría documental, auditoría in situ, informe final, seguimiento./Ciclo de certificación (3 años), auditorías de seguimiento y renovación./Buenas prácticas para preparar una auditoría externa.

4. Términos y definiciones del proceso de auditoría
Auditoría, auditor, auditado, hallazgo, no conformidad, conformidad, evidencia objetiva, criterio de auditoría./Tipos de auditoría: interna, externa, de primera, segunda y tercera parte./Casos prácticos de uso de términos.

5. Principios de auditoría
Integridad./Presentación imparcial./Debido cuidado profesional./Confidencialidad./Independencia./Enfoque basado en evidencia./Enfoque basado en riesgo./Ejercicios de análisis de dilemas éticos.

6. Gestión del programa de auditoría
Definición y elementos del programa de auditoría/Establecimiento de objetivos y alcance./Asignación de recursos y competencias./Revisión, monitoreo y mejora del programa./Planificación anual del programa integrado./Uso de herramientas de planificación (Gantt, software).

7. Realización de auditorías (planeación, ejecución y reporte)
Planificación de la auditoría (plan, lista de verificación)./Reunión de apertura./Ejecución: entrevistas, revisión documental, observaciones./Técnicas de auditoría: muestreo, trazabilidad, análisis de riesgos./Reunión de cierre./Elaboración del informe de auditoría./Identificación y redacción de hallazgos./Seguimiento de acciones correctivas." />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="1. Introducción a los Sistemas Integrados de Gestión (SIG)
Concepto de Sistema de Gestión./Ventajas de integrar ISO 9001, ISO 14001 e ISO 45001./Principios comunes: ciclo PHVA, enfoque a procesos, mejora continua./Estructura de alto nivel (HLS – High Level Structure)./Ejemplos prácticos de integración en organizaciones reales.

2. Requisitos normativos (ISO 9001, ISO 14001, ISO 45001)
Estructura de las normas (Cláusulas 4 a 10)./Requisitos específicos por norma y requisitos comunes./Análisis comparativo entre normas (mapa de integración)./Enfoque a procesos y gestión de riesgos y oportunidades./Actividades prácticas de análisis documental y aplicación.

3. Proceso de certificación y acreditación
Definición de certificación vs. acreditación./Organismos de certificación y acreditación (ej. INN, UKAS)./Etapas del proceso: solicitud, auditoría documental, auditoría in situ, informe final, seguimiento./Ciclo de certificación (3 años), auditorías de seguimiento y renovación./Buenas prácticas para preparar una auditoría externa.

4. Términos y definiciones del proceso de auditoría
Auditoría, auditor, auditado, hallazgo, no conformidad, conformidad, evidencia objetiva, criterio de auditoría./Tipos de auditoría: interna, externa, de primera, segunda y tercera parte./Casos prácticos de uso de términos.

5. Principios de auditoría
Integridad./Presentación imparcial./Debido cuidado profesional./Confidencialidad./Independencia./Enfoque basado en evidencia./Enfoque basado en riesgo./Ejercicios de análisis de dilemas éticos.

6. Gestión del programa de auditoría
Definición y elementos del programa de auditoría/Establecimiento de objetivos y alcance./Asignación de recursos y competencias./Revisión, monitoreo y mejora del programa./Planificación anual del programa integrado./Uso de herramientas de planificación (Gantt, software).

7. Realización de auditorías (planeación, ejecución y reporte)
Planificación de la auditoría (plan, lista de verificación)./Reunión de apertura./Ejecución: entrevistas, revisión documental, observaciones./Técnicas de auditoría: muestreo, trazabilidad, análisis de riesgos./Reunión de cierre./Elaboración del informe de auditoría./Identificación y redacción de hallazgos./Seguimiento de acciones correctivas." />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="1. Introducción a los Sistemas Integrados de Gestión (SIG)
Concepto de Sistema de Gestión./Ventajas de integrar ISO 9001, ISO 14001 e ISO 45001./Principios comunes: ciclo PHVA, enfoque a procesos, mejora continua./Estructura de alto nivel (HLS – High Level Structure)./Ejemplos prácticos de integración en organizaciones reales.

2. Requisitos normativos (ISO 9001, ISO 14001, ISO 45001)
Estructura de las normas (Cláusulas 4 a 10)./Requisitos específicos por norma y requisitos comunes./Análisis comparativo entre normas (mapa de integración)./Enfoque a procesos y gestión de riesgos y oportunidades./Actividades prácticas de análisis documental y aplicación.

3. Proceso de certificación y acreditación
Definición de certificación vs. acreditación./Organismos de certificación y acreditación (ej. INN, UKAS)./Etapas del proceso: solicitud, auditoría documental, auditoría in situ, informe final, seguimiento./Ciclo de certificación (3 años), auditorías de seguimiento y renovación./Buenas prácticas para preparar una auditoría externa.

4. Términos y definiciones del proceso de auditoría
Auditoría, auditor, auditado, hallazgo, no conformidad, conformidad, evidencia objetiva, criterio de auditoría./Tipos de auditoría: interna, externa, de primera, segunda y tercera parte./Casos prácticos de uso de términos.

5. Principios de auditoría
Integridad./Presentación imparcial./Debido cuidado profesional./Confidencialidad./Independencia./Enfoque basado en evidencia./Enfoque basado en riesgo./Ejercicios de análisis de dilemas éticos.

6. Gestión del programa de auditoría
Definición y elementos del programa de auditoría/Establecimiento de objetivos y alcance./Asignación de recursos y competencias./Revisión, monitoreo y mejora del programa./Planificación anual del programa integrado./Uso de herramientas de planificación (Gantt, software).

7. Realización de auditorías (planeación, ejecución y reporte)
Planificación de la auditoría (plan, lista de verificación)./Reunión de apertura./Ejecución: entrevistas, revisión documental, observaciones./Técnicas de auditoría: muestreo, trazabilidad, análisis de riesgos./Reunión de cierre./Elaboración del informe de auditoría./Identificación y redacción de hallazgos./Seguimiento de acciones correctivas." />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />
                    <CursoCard Nombre="Manejo retro excavadora" Duracion={8} Resumen="Muy buen curso" Temario="Blllll" />


                </div>
            </div>
        </div>
    </div>
}