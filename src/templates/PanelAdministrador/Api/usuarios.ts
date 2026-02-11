import { backend } from "../../../vars"
import type { curso } from "./cursos"
import type { cursoArmado } from "./cursos-armados"
import type { EmpresaVinculada } from "./empresasVinculadas"
import type { inscripcion } from "./inscripciones"
import type { rolEnum } from "./roles"

export interface usuario {
    id?: number,
    rut?: string,
    nombre?: string,
    email?: string,
    empresa?: string,
    token?: string,
    direccion?: string | null,
    especialidad?: string | null,
    foto_perfil?: string | null,
    firma?: string | null,
    telefono?: string | null
    rolesVinculados?: rolEnum[],
    empresasVinculadas?: EmpresaVinculada[]
}

//////
export type inscripcionParaPanelAlumno = {
    duracion: curso['duracion'],
    fechainicio: cursoArmado['fecha_inicio'],
    fechafinalizacion: cursoArmado['fecha_finalizacion'],
    idinscripcion: inscripcion['id_inscripcion'],
    nombrecurso: curso['nombre'],
    profesor: usuario['nombre'],
    estadocurso: cursoArmado['estado'],
    temario: curso['temario'],
    enclase: cursoArmado['en_clase']
    asistenciamarcada: inscripcion['asistencia_marcada']
}

export type inscripcionesParaPanelAlumno = {
    usuario: usuario['nombre']
    inscripciones: inscripcionParaPanelAlumno[]
}

//////

export interface PanelProfesor extends usuario {
    cursosArmados: cursoArmado[]
}

export async function crearUsuarioAsync(cuerpo?: usuario) {
    const usuarioNuevo = await fetch(`${backend}/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!usuarioNuevo.ok) {

        const problem = await usuarioNuevo.json()

        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: usuario = await usuarioNuevo.json()

    return toJson
}

export async function borrarUsuarioAsync(usuarioId: number) {
    const res = await fetch(`${backend}/usuarios/usuario/${usuarioId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudo borrar el usuario.')
    }

    return toJson
}

export async function obtenerUsuariosAsync() {
    const usuarios = await fetch(`${backend}/usuarios`)

    if (!usuarios.ok) {
        throw new Error('Hubo un problema al obtener los usuarios.')
    }

    const toJson = await usuarios.json()

    return toJson
}

export async function actualizarPropiedadDeUsuarioAsync(usuarioId: number, propiedad: string, nuevoValor: string | number) {
    const res = await fetch(`${backend}/usuarios/usuario/${usuarioId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            [propiedad]: nuevoValor
        })
    })

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al editar la propiedad.')
    }
}

export async function obtenerInscripcionesDeAlumno() {
    const res = await fetch(`${backend}/usuarios/usuario/estudiante`)

    const toJson = await res.json()

    if (!res.ok) {
        console.log(toJson)
        throw new Error(toJson?.message ?? 'No se pudieron obtener las inscripciones del alumno.')
    }

    return toJson
}

export async function obtenerCursosParaPanelProfesor() {
    const res = await fetch(`${backend}/usuarios/usuario/profesor`)

    const toJson = await res.json()

    if (!res.ok) {
        console.log(toJson)

        throw new Error(toJson?.message ?? 'No se pudieron obtener las inscripciones del alumno.')
    }

    return toJson
}

export async function subirFotoDePerfilAsync(file: File, id_usuario: number) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${backend}/usuarios/ProfilePicture/${id_usuario}`, {
        method: 'POST',
        body: formData
    })

    console.log(res)

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al subir la foto del usuario.')
    }

    const foto_perfil: { foto_perfil: string } = await res.json()

    console.log(foto_perfil)

    return foto_perfil
}

export async function subirFirmaAsync(file: File, id_usuario: number) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${backend}/usuarios/Firma/${id_usuario}`, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al subir la firma del usuario.')
    }

    const firma: { firma: string } = await res.json()

    return firma
}


export async function eliminarFotoDePerfilAsync(id_usuario: number) {

    const res = await fetch(`${backend}/usuarios/ProfilePicture/${id_usuario}`, {
        method: 'DELETE'
    })

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al borrar la foto de perfil del usuario.')
    }

    return true
}

export async function eliminarFirmaAsync(id_usuario: number) {

    const res = await fetch(`${backend}/usuarios/Firma/${id_usuario}`, {
        method: 'DELETE'
    })

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al borrar la foto de perfil del usuario.')
    }

    return true
}