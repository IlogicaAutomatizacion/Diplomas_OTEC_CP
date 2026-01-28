import type { cursoArmado } from "./cursos-armados"

export interface empresa {
    id_empresa: number,
    rut: string,
    nombre: string,
    email: string,
    telefono: string,
    contacto: string
}

export interface empresaConCursosArmados extends empresa {
    cursosArmados: cursoArmado[]
}

export async function crearEmpresaAsync(cuerpo?: empresa) {
    const empresaNueva = await fetch(`http://localhost:3000/empresas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo ?? {
            rut: '12345678-9',
            telefono_contacto: '9999',
            nombre: 'Sin dato.',
            email_contacto: 'sin@dato.com',
            nombre_contacto: 'Sin dato.'
        })
    })

    if (!empresaNueva.ok) {

        const problem = await empresaNueva.json()

        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: empresa = await empresaNueva.json()

    return toJson
}

export async function borrarEmpresaAsync(empresaId: number) {
    const res = await fetch(`http://localhost:3000/empresas/empresa/${empresaId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const toJson = await res.json()

    if (!res.ok) {
        throw new Error('No se pudo borrar la empresa.')
    }

    return toJson
}

export async function obtenerEmpresasAsync() {
    const empresas = await fetch('http://localhost:3000/empresas')

    if (!empresas.ok) {
        throw new Error('Hubo un problema al obtener las empresas.')
    }

    const toJson = await empresas.json()

    return toJson
}

export async function actualizarPropiedadDeEmpresaAsync(empresaId: number, propiedad: string, nuevoValor: string | number) {
    const res = await fetch(`http://localhost:3000/empresas/empresa/${empresaId}`, {
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

export async function obtenerEmpresaConCursosArmadosAsync(empresaId: number) {
    const empresa = await fetch(`http://localhost:3000/empresas/empresa/armados/${empresaId}`)

    if (!empresa.ok) {
        throw new Error('Hubo un problema al obtener las empresa.')
    }

    const toJson = await empresa.json()

    return toJson
}