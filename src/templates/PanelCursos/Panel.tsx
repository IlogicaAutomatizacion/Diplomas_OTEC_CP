import { Outlet } from "react-router-dom"
//import Foter from "../../Diseño/Foter"

//import Logo from "../../Diseño/CxLogo"
export function convertirFecha(fecha: string | undefined) {
    if (!fecha || !new Date(fecha)) { return }

    const sinT = fecha.split('T')[0]

    const [anio, mes, dia] = sinT.split('-')

    return `${dia}/${mes}/${anio}`
}


export default () => {


    console.log('uh')

    return (
        <div className="min-h-screen bg-[#131516] text-white flex flex-col items-center p-6 ">
            <div className="w-full max-w-6xl mt-10">
                <Outlet  />
            </div>

        </div>
    );

}