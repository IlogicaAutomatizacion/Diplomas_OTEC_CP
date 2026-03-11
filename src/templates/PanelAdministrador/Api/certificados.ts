import { backend } from "../../../vars"



export async function obtenerCertificadosDeAlumnoPorIdAsync() {
    const certificados = await fetch(`${backend}/certificados/lista`)

    const toJson = await certificados.json()

    if (!certificados.ok) {
        throw new Error(toJson?.message ?? 'Hubo un problema al obtener los certificados.')
    }

    return toJson
}