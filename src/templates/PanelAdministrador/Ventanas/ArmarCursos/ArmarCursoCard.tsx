import type { cursoArmado } from "../../Api/cursos-armados"


const CursoArmadoCard = ({
    cursoArmado,
    setCursoArmadoAVisualizar
}: {
    cursoArmado: cursoArmado,
    setCursoArmadoAVisualizar: React.Dispatch<React.SetStateAction<cursoArmado | null>>

}) => {

    return <div className="border rounded p-3 flex flex-col gap-3 bg-[#131516] ">
        {/* Título */}
        <h2 onClick={() => {
            setCursoArmadoAVisualizar(cursoArmado)
        }}
            className="
      text-center
      font-medium
      cursor-pointer
      border-b
      pb-2
      hover:text-cyan-400
      transition
    "
        >
            {cursoArmado.curso?.nombre ?? 'Sin nombre'}
        </h2>

        {/* Info */}

    </div>

}

export default CursoArmadoCard