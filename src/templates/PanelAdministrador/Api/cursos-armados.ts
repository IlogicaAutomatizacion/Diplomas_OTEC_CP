import { backend } from "../../../vars"
import type { curso } from "./cursos"
import type { empresa } from "./empresas"
import type { inscripcion } from "./inscripciones"
import type { usuario } from "./usuarios"


export interface CursoConAlumno extends cursoArmado {
    curso_armado_id: cursoArmado['curso_armado_id']
    empresa: empresa;
    profesor: usuario;
    curso: curso;
    inscripcion: inscripcion
}

export interface cursoArmado {
    curso_armado_id: number,
    fecha_inicio?: string,
    fecha_finalizacion?: string,
    estado?: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO'
    curso?: curso,
    profesor?: usuario,
    empresa?: empresa,
    en_clase?: boolean
    calificacion_aprobatoria?: number,
    teorica?: number,
    inscripciones: inscripcion[]
    token_curso: string
}

export async function borrarCursoArmadoAsync(id: number) {
    const res = await fetch(`${backend}/curso-armado/curso/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    })

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudo borrar el curso.')
    }

    return toJson
}

export async function obtenerCursosArmadosAsync() {
    const cursos = await fetch(`${backend}/curso-armado`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los cursos.')
    }

    const toJson: cursoArmado[] = await cursos.json()

    return toJson
}

export async function actualizarPropiedadDeCursoArmadoAsync(cursoId: number, propiedad: string, nuevoValor: string | number | boolean) {
    console.log(cursoId, propiedad, nuevoValor)

    const res = await fetch(`${backend}/curso-armado/curso/${cursoId}`, {
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

    return res.json()
}

export async function crearCursoArmadoAsync(cuerpo?: cursoArmado) {
    const cursoArmadoNuevo = await fetch(`${backend}/curso-armado`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!cursoArmadoNuevo.ok) {

        const problem = await cursoArmadoNuevo.json()

        throw new Error(problem.message)
    }

    const toJson: cursoArmado = await cursoArmadoNuevo.json()

    return toJson
}

export async function checarSiPuedeFinalizar(curso_armado_id: number) {

    const res = await fetch(`${backend}/curso-armado/curso/puedeFinalizar/${curso_armado_id}`)

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al obtener la informacion.')
    }

    return res.json()
}