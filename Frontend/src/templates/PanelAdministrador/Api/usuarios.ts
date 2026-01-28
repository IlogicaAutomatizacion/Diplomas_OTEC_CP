import type { curso } from "./cursos"
import type { cursoArmado } from "./cursos-armados"
import type { inscripcion } from "./inscripciones"

export interface usuario {
    id: number,
    rut: string,
    nombre: string,
    email: string,
    empresa?: string,
    direccion?: string | null,
    especialidad?: string | null,
    telefono?: number | null
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
    const usuarioNuevo = await fetch(`http://localhost:3000/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo ?? {
            rut: '12345678-9',
            nombre: 'Sin dato.',
            fono_fax: '99999999',
            correo: 'sin@dato.com',
            direccion: 'Sin dato.',
            especialidad: 'Sin dato.'
        })
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
    const res = await fetch(`http://localhost:3000/usuarios/usuario/${usuarioId}`, {
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
    const usuarios = await fetch('http://localhost:3000/usuarios')

    if (!usuarios.ok) {
        throw new Error('Hubo un problema al obtener los usuarios.')
    }

    const toJson = await usuarios.json()

    return toJson
}

export async function actualizarPropiedadDeUsuarioAsync(usuarioId: number, propiedad: string, nuevoValor: string | number) {
    const res = await fetch(`http://localhost:3000/usuarios/usuario/${usuarioId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            propiedad,
            nuevoValor
        })
    })

    if (!res.ok) {
        throw new Error('Hubo un problema al editar la propiedad.')
    }
}

export async function obtenerInscripcionesDeAlumno(usuarioId: number) {
    const res = await fetch(`http://localhost:3000/usuarios/usuario/estudiante/${usuarioId}`)

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudieron obtener las inscripciones del alumno.')
    }

    return toJson
}

export async function obtenerCursosParaPanelProfesor(usuarioId: number) {
    const res = await fetch(`http://localhost:3000/usuarios/usuario/profesor/${usuarioId}`)

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudieron obtener los cursos del profesor.')
    }

    return toJson
}


