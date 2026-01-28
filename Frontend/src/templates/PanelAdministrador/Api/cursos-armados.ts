import type { curso } from "./cursos"
import type { empresa } from "./empresas"
import type { inscripcion } from "./inscripciones"
import type { usuario } from "./usuarios"

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
    inscripciones: inscripcion[]
}

export async function borrarCursoArmadoAsync(id: number) {
    const res = await fetch(`http://localhost:3000/curso-armado/curso/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudo borrar el curso.')
    }

    return toJson
}

export async function obtenerCursosArmadosAsync() {
    const cursos = await fetch('http://localhost:3000/curso-armado')

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los cursos.')
    }

    const toJson: cursoArmado[] = await cursos.json()

    return toJson
}

export async function actualizarPropiedadDeCursoArmadoAsync(cursoId: number, propiedad: string, nuevoValor: string | number | boolean) {
    console.log(cursoId, propiedad, nuevoValor)

    const res = await fetch(`http://localhost:3000/curso-armado/curso/${cursoId}`, {
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
    const cursoArmadoNuevo = await fetch(`http://localhost:3000/curso-armado`, {
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

    const res = await fetch(`http://localhost:3000/curso-armado/curso/puedeFinalizar/${curso_armado_id}`)

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al obtener la informacion.')
    }

    return res.json()
}