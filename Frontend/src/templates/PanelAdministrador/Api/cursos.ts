export interface curso {
    curso_id: number,
    nombre: string,
    duracion: number,
    resumen: string,
    temario: string
}

export async function borrarCursoAsync(id: number) {
    const res = await fetch(`http://localhost:3000/cursos/curso/${id}`, {
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

export async function obtenerCursosAsync() {
    const cursos = await fetch('http://localhost:3000/cursos')

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los cursos.')
    }

    const toJson = await cursos.json()

    return toJson
}

export async function actualizarPropiedadDeCursoAsync(cursoId: number, propiedad: string, nuevoValor: string | number) {
    const res = await fetch(`http://localhost:3000/cursos/curso/${cursoId}`, {
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


export async function crearCursoAsync(cuerpo?: curso) {
    const cursoNuevo = await fetch(`http://localhost:3000/cursos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo ?? {
            nombre: 'Sin dato.',
            duracion: 1,
            temario: 'Sin dato',
            resumen: 'Sin dato.'
        })
    })

    if (!cursoNuevo.ok) {

        const problem = await cursoNuevo.json()

        throw new Error(problem.message)
    }

    const toJson: curso = await cursoNuevo.json()

    return toJson
}
