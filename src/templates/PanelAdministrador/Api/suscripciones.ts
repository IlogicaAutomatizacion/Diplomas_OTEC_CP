import { backend } from "../../../vars"
import type { curso } from "./cursos"
import type { cursoArmado, CursoConAlumno } from "./cursos-armados"
import type { empresa } from "./empresas"
import type { usuario } from "./usuarios"


export type suscripcionAdministrador = {
    id_suscriptor: number,
    nombre_suscripcion: string,
    id_empresa: number
}

export async function obtenerSuscripcionesDeUsuario() {
    const res = await fetch(`${backend}/suscriptores`)

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al obtener las suscripciones.',)
    }

    const suscripciones = await res.json()

    console.log(suscripciones)

    return suscripciones
}

export async function obtenerIdDeSuscripcionPorNombreDeEmpresaAsync(nombre_empresa: string) {
    const id = await fetch(`${backend}/suscriptores/${nombre_empresa}`)


    if (!id.ok) {
        console.log(await id.json())
        throw new Error('Hubo un problema al obtener el id de la suscripcion.',)
    }

    const res = await id.json()

    return res
}

export async function obtenerIdDeSuscripcionPorTokenDeCursoArmadoAsync(token: string) {
    const id = await fetch(`${backend}/suscriptores/token/${token}`)

    if (!id.ok) {
        throw new Error('Hubo un problema al obtener el id de la suscripcion.')
    }

    const res = await id.json()

    console.log(res)

    return res
}

export async function obtenerDatosDeCertificadoConTokenDeCursoArmadoAsync(suscriptor: number, token_curso: string, token_alumno: string) {
    const params = new URLSearchParams({
        suscriptor: String(suscriptor),
        token_alumno,
        token_curso,
    })

    const datos = await fetch(`${backend}/certificados?${params}`)
    if (!datos.ok) {
        console.log(await datos.json())

        throw new Error('Hubo un problema al obtener los datos del certificado.')
    }

    const res: CursoConAlumno = await datos.json()

    return res
}

export async function obtenerPdfDeCertificado(suscriptor: number, certificado_url: string) {
    const params = new URLSearchParams({
        suscriptor: String(suscriptor),
        certificado_url
    })

    const datos = await fetch(`${backend}/certificados/pdf?${params}`, {
        method: "GET",
        headers: {
            "Accept": "application/pdf"
        }
    })
    console.log(datos)
    
    if (!datos.ok) {
        console.log(await datos.json())

        throw new Error('Hubo un problema al obtener el pdf del certificado')
    }

    const res = await datos.json()
    
    console.log(res)

    return res
}




////////////////////////////////////////////////
export async function crearCursoDeSuscriptorAsync(id_suscriptor: number, cuerpo?: curso) {
    const cursoNuevo = await fetch(`${backend}/suscriptores/crearCurso/${id_suscriptor}`, {
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
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: curso = await cursoNuevo.json()

    return toJson
}

export async function crearCursosDeSuscriptorAsync(id_suscriptor: number, cuerpo: curso[]) {
    const cursosNuevo = await fetch(`${backend}/suscriptores/crearCursos/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!cursosNuevo.ok) {
        const problem = await cursosNuevo.json()
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: curso[] = await cursosNuevo.json()

    return toJson
}


export async function obtenerCursosDeSuscriptorAsync(id_suscripcion: number) {
    const cursos = await fetch(`${backend}/suscriptores/cursos/${id_suscripcion}`)

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los cursos del suscriptor.')
    }

    const toJson = await cursos.json()

    return toJson
}
////////////////////////////////////////////////

export async function crearCursoArmadoDeSuscriptorAsync(id_suscriptor: number, cuerpo?: cursoArmado) {
    const cursoArmadoNuevo = await fetch(`${backend}/suscriptores/crearCursoArmado/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!cursoArmadoNuevo.ok) {
        const problem = await cursoArmadoNuevo.json()
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: cursoArmado = await cursoArmadoNuevo.json()

    return toJson
}

export async function obtenerCursosArmadosDeSuscriptorAsync(id_suscripcion: number) {
    const cursos = await fetch(`${backend}/suscriptores/cursosArmados/${id_suscripcion}`)

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los cursos armados del suscriptor.')
    }

    const toJson = await cursos.json()

    return toJson
}
////////////////////////////////////////////////

export async function crearUsuarioDeSuscriptorAsync(id_suscriptor: number, cuerpo?: usuario) {
    const usuario = await fetch(`${backend}/suscriptores/crearUsuario/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)

    })

    if (!usuario.ok) {
        const problem = await usuario.json()
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: usuario = await usuario.json()

    return toJson
}

export async function crearUsuariosDeSuscriptorAsync(id_suscriptor: number, cuerpo: usuario[]) {
    const usuarios = await fetch(`${backend}/suscriptores/crearUsuarios/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)

    })

    if (!usuarios.ok) {
        const problem = await usuarios.json()
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: usuario[] = await usuarios.json()

    return toJson
}


export async function obtenerUsuariosDeSuscriptorAsync(id_suscripcion: number) {
    const cursos = await fetch(`${backend}/suscriptores/usuarios/${id_suscripcion}`)

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener los usuarios del suscriptor.')
    }

    const toJson = await cursos.json()

    return toJson
}

////////////////////////////////////////////////

export async function crearEmpresaDeSuscriptorAsync(id_suscriptor: number, cuerpo?: empresa) {
    const empresa = await fetch(`${backend}/suscriptores/crearEmpresa/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!empresa.ok) {
        const problem = await empresa.json()
        console.log(problem)
        throw new Error(problem.message)
    }

    const toJson: empresa = await empresa.json()

    return toJson
}

export async function crearEmpresasDeSuscriptorAsync(id_suscriptor: number, cuerpo: empresa[]) {
    const empresa = await fetch(`${backend}/suscriptores/crearEmpresas/${id_suscriptor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo)
    })

    if (!empresa.ok) {
        const problem = await empresa.json()

        console.log(problem)

        throw new Error(problem.message)
    }

    const toJson: empresa[] = await empresa.json()

    return toJson
}


export async function obtenerEmpresasDeSuscriptorAsync(id_suscripcion: number) {
    const cursos = await fetch(`${backend}/suscriptores/empresas/${id_suscripcion}`)

    if (!cursos.ok) {
        throw new Error('Hubo un problema al obtener las empresas del suscriptor.')
    }

    const toJson = await cursos.json()

    return toJson
}