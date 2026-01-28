import ArmarCursos from './Ventanas/ArmarCursos'
import Usuarios from './Ventanas/Usuarios'
import Empresas from './Ventanas/Empresas'
import Cursos from './Ventanas/Cursos'
import { useState } from 'react'

import type { cursoArmado } from './Api/cursos-armados'
import type { curso } from './Api/cursos'
import type { usuario } from './Api/usuarios'
import type { empresa } from './Api/empresas'

export default () => {

    const [cursos, setCursos] = useState<curso[]>([])
    const [usuarios, setUsuarios] = useState<usuario[]>([])
    const [empresas, setEmpresas] = useState<empresa[]>([])
    const [cursosArmados, setCursosArmados] = useState<cursoArmado[]>([])

    return <div id="fondo" className=" w-full h-[100%] bg-[#131516] flex justify-center items-center">
        <div id="contenedor-principal" className="my-5 p-2 max-w-400 flex justify-center flex-col items-center min-h-200  text-white ">
            <h1 id="titulo" className="text-7xl ">
                Administrador de usuarios
            </h1>

            {/* <div id="contenedor-botones" className="mb-2 w-full p-2 h-15 flex flex-row border mt-5 justify-end gap-x-2">
                <input id="buscador" type="text" className="h-full p-2 border" placeholder="Buscar" />

                <button id='guardar-datos' className="bg-green-400 h-full p-2 border">
                    Guardar
                </button>
            </div> */}

            <div className=" w-full h-auto flex justify-center mt-10 flex-col items-center ">
                <ArmarCursos usuarios={usuarios} empresas={empresas} cursos={cursos} cursosArmados={cursosArmados} setCursosArmados={setCursosArmados} />

                <Usuarios usuarios={usuarios} setUsuarios={setUsuarios} />

                <Empresas empresas={empresas} setEmpresas={setEmpresas} />

                <Cursos cursos={cursos} setCursos={setCursos} />

            </div>
        </div>
    </div>
}