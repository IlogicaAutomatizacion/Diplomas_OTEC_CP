import { backend } from "../../../vars"
import type { cursoArmado } from "./cursos-armados"

export interface empresa {
    id_empresa?: number,
    rut?: string,
    nombre?: string,
    email?: string,
    telefono?: string,
    contacto?: string
}

export interface empresaConCursosArmados extends empresa {
    cursosArmados: cursoArmado[]
}

export interface empresaVinculadaAUsuario { id_empresa: number; nombre: string }

export async function crearEmpresaAsync(cuerpo?: empresa) {
    const empresaNueva = await fetch(`${backend}/empresas`, {
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
    const res = await fetch(`${backend}/empresas/empresa/${empresaId}`, {
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
    const empresas = await fetch(`${backend}/empresas`)

    if (!empresas.ok) {
        throw new Error('Hubo un problema al obtener las empresas.')
    }

    const toJson = await empresas.json()

    return toJson
}

export async function actualizarPropiedadDeEmpresaAsync(empresaId: number, propiedad: string, nuevoValor: string | number) {
    const res = await fetch(`${backend}/empresas/empresa/${empresaId}`, {
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

export async function obtenerEmpresaConCursosArmadosAsync(empresaId: number) {
    const empresa = await fetch(`${backend}/empresas/empresa/armados/${empresaId}`)

    const toJson = await empresa.json()

    if (!empresa.ok) {
        throw new Error(toJson?.message ?? 'Hubo un problema al obtener las empresas.')
    }


    return toJson
}

/////////////////////////////////////////////////////////

export async function obtenerUsuariosVinculadosAEmpresaPorUsuarioIdAsync() {
    const empresas = await fetch(`${backend}/empresasVinculadas/empresasUsuario`)

    if (!empresas.ok) {
        throw new Error('Hubo un problema al obtener las empresa.')
    }

    const toJson: (empresaVinculadaAUsuario & { nombre_suscriptor: string })[] = await empresas.json()

    return toJson
}