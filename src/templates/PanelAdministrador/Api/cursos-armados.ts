import { backend } from "../../../vars"
import type { curso } from "./cursos"
import type { empresa } from "./empresas"
import type { inscripcion } from "./inscripciones"
import type { usuario } from "./usuarios"


export interface CursoConAlumno extends cursoArmado {
    curso_armado_id: cursoArmado['curso_armado_id']
    empresa: empresa;
    profesor: usuario;
    certificador?: usuario | null;
    curso: curso;
    inscripcion: inscripcion
    inicio_contador_certificados?: number
}

export interface cursoArmado {
    curso_armado_id: number,
    fecha_inicio?: string,
    fecha_finalizacion?: string,
    estado?: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO'
    curso?: curso,
    profesor?: usuario,
    vendedor?: usuario,
    valorUnitario: number,
    lugar_de_realizacion: string,
    notas_cotizacion: string,
    alumnosCotizados: number,
    contactoDeCotizacion?: usuario,
    precioPorAlumno?: number,
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
        throw new Error('Hubo un problema al obtener la informacion.')
    }

    return res.json()
}

export async function mandarCotizacionDeCurso(curso_armado_id: number) {

    const res = await fetch(`${backend}/curso-armado/curso/mandarCotizacion/${curso_armado_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!res.ok) {
        throw new Error('Hubo un problema al mandar la cotización del curso.')
    }
}


export async function mandarEncuestasDeSatisfaccion(curso_armado_id: number) {

    const res = await fetch(`${backend}/curso-armado/curso/mandarEncuestasDeSatisfaccion/${curso_armado_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!res.ok) {
        throw new Error('Hubo un problema al mandar las encuestas de satisfacción.')
    }

}

export async function descargarCotizacionAsync(curso_armado_id: number) {
    const res = await fetch(`${backend}/curso-armado/curso/descargarCotizacion/${curso_armado_id}`)

    if (!res.ok) throw new Error('Hubo un problema al descargar la cotización.')

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `cotizacion_vista_previa.pdf`
    a.click()

    URL.revokeObjectURL(url)
}

// @Roles("ADMINISTRADOREMPRESA")
export async function borrarCursosArmadosAsyncBulk(cursoArmadoIds: number[]) {
    const res = await fetch(`${backend}/curso-armado/bulk`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ids: cursoArmadoIds })
    })

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudieron borrar los cursos armados.')
    }

    return toJson
}
