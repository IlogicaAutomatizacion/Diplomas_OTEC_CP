import { backend } from "../../../vars"
import type { EncuestaFormato, RespuestaEncuesta } from "../Componentes/CreadorDeEncuesta"

export async function subirFormatoEncuestaSatisfaccionClienteAsync(id_suscripcion: number, encuesta: EncuestaFormato) {
    const res = await fetch(`${backend}/formatos-dinamicos/subirFormatoEncuestaSatisfaccionCliente/${id_suscripcion}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // solo este es necesario
        },
        body: JSON.stringify(encuesta)
    })

    if (!res.ok) throw new Error()

    return
}

export async function obtenerFormatoEncuestaSatisfaccionClienteAsync(uuid_suscriptor: string) {
    const res = await fetch(`${backend}/formatos-dinamicos/obtenerFormatoEncuestaSatisfaccionCliente/${uuid_suscriptor}`)

    if (!res.ok) throw new Error()

    return res.json() as Promise<EncuestaFormato>
}

export async function eliminarFormatoEncuestaSatisfaccionClienteAsync(id_suscripcion: number) {
    const res = await fetch(`${backend}/formatos-dinamicos/eliminarFormatoEncuestaSatisfaccionCliente/${id_suscripcion}`, {
        method: 'DELETE'
    })

    if (!res.ok) throw new Error()

    return res.json()
}

// --- Usuario ---

export async function subirFormatoEncuestaSatisfaccionUsuarioAsync(id_suscripcion: number, encuesta: EncuestaFormato) {
    const res = await fetch(`${backend}/formatos-dinamicos/subirFormatoEncuestaSatisfaccionUsuario/${id_suscripcion}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(encuesta)
    })

    if (!res.ok) throw new Error()

    return
}

export async function obtenerFormatoEncuestaSatisfaccionUsuarioAsync(uuid_suscriptor: string) {
    const res = await fetch(`${backend}/formatos-dinamicos/obtenerFormatoEncuestaSatisfaccionUsuario/${uuid_suscriptor}`)

    if (!res.ok) throw new Error()

    return res.json() as Promise<EncuestaFormato>
}

export async function eliminarFormatoEncuestaSatisfaccionUsuarioAsync(id_suscripcion: number) {
    const res = await fetch(`${backend}/formatos-dinamicos/eliminarFormatoEncuestaSatisfaccionUsuario/${id_suscripcion}`, {
        method: 'DELETE'
    })

    if (!res.ok) throw new Error()

    return res.json()
}

export async function agregarRespuestaEncuestaAsync(uuidUsuario: string, uuidEncuesta: string, respuesta: RespuestaEncuesta) {
    const res = await fetch(`${backend}/formatos-dinamicos/agregarRespuesta/${uuidUsuario}/${uuidEncuesta}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(respuesta)
    })

    if (!res.ok) throw new Error()

    return res.json()
}



export async function obtenerRespuestasEncuestaAsync(uuidUsuario: string, uuidEncuesta: string) {
    const res = await fetch(`${backend}/formatos-dinamicos/obtenerRespuestas/${uuidUsuario}/${uuidEncuesta}`)

    if (!res.ok) throw new Error()

    return res.json() as Promise<RespuestaEncuesta[]>
}

export async function eliminarRespuestasEncuestaAsync(uuidUsuario: string, uuidEncuesta: string) {
    const res = await fetch(`${backend}/formatos-dinamicos/eliminarRespuestas/${uuidUsuario}/${uuidEncuesta}`, {
        method: 'DELETE'
    })

    if (!res.ok) throw new Error()

    return res.json()
}

export async function obtenerRespuestaEncuestaPorCursoArmadoAsync(
    uuidUsuario: string,
    uuidEncuesta: string,
    tokenCursoArmado: string
) {
    const res = await fetch(
        `${backend}/formatos-dinamicos/respuestas/${uuidEncuesta}/${uuidUsuario}/${tokenCursoArmado}`
    )

    if (!res.ok) throw new Error()

    return res.json() as Promise<RespuestaEncuesta | null>
}