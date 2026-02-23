import type { usuario } from "../../Api/usuarios"

export default ({
    usuario,
    setUsuarioAVisualizar
}: {
    usuario: usuario
    setUsuarioAVisualizar: React.Dispatch<React.SetStateAction<usuario | null>>
}) => {
    return <h2
        onClick={() => setUsuarioAVisualizar(usuario)}
        className="   text-center
      font-medium
      cursor-pointer
      border-b
      pb-2
      hover:text-cyan-400
      transition"
    >
        {usuario.nombre ?? 'Sin nombre.'}
    </h2>
}