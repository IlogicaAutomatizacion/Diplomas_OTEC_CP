//UsuariosCard.tsx

import type { usuario } from "../../Api/usuarios"

export default ({
    usuario,
    setUsuarioSeleccionadoId
}: {
    usuario: usuario
    setUsuarioSeleccionadoId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
    return <h2
        onClick={() => setUsuarioSeleccionadoId(usuario.id!)}
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