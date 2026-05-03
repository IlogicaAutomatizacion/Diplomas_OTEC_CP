import { backend } from "../../../vars";
import type { rolEnum } from "./roles";
import type { usuario } from "./usuarios";


export type perfilAutenticado = {
    cuenta: {
        correo: string
        isActive: boolean
    }
    usuario: usuario | null
    perfiles: usuario[]
    roles: rolEnum[]
}

export async function obtenerPerfilAutenticadoAsync(): Promise<perfilAutenticado> {
    const res = await fetch(`${backend}/auth/me`)
    const data = await res.json().catch(() => null)

    if (!res.ok) {
        throw new Error(data?.message ?? 'No se pudo obtener el perfil autenticado.')
    }

    return data
}

export async function cambiarPasswordAsync(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${backend}/auth/change-password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            currentPassword,
            newPassword,
        })
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        throw new Error(data?.message ?? 'No se pudo cambiar la contrasena.')
    }

    return data
}

async function subirArchivoPerfilAsync(
    usuarioId: number,
    file: File,
    tipo: 'foto' | 'firma',
): Promise<{ foto_perfil?: string, firma?: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${backend}/auth/perfil/${usuarioId}/${tipo}`, {
        method: 'POST',
        body: formData,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        throw new Error(data?.message ?? `No se pudo subir la ${tipo}.`)
    }

    return data
}

async function eliminarArchivoPerfilAsync(usuarioId: number, tipo: 'foto' | 'firma') {
    const res = await fetch(`${backend}/auth/perfil/${usuarioId}/${tipo}`, {
        method: 'DELETE',
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        throw new Error(data?.message ?? `No se pudo eliminar la ${tipo}.`)
    }

    return data
}

export function subirFotoPerfilPropiaAsync(usuarioId: number, file: File) {
    return subirArchivoPerfilAsync(usuarioId, file, 'foto')
}

export function subirFirmaPerfilPropiaAsync(usuarioId: number, file: File) {
    return subirArchivoPerfilAsync(usuarioId, file, 'firma')
}

export function eliminarFotoPerfilPropiaAsync(usuarioId: number) {
    return eliminarArchivoPerfilAsync(usuarioId, 'foto')
}

export function eliminarFirmaPerfilPropiaAsync(usuarioId: number) {
    return eliminarArchivoPerfilAsync(usuarioId, 'firma')
}

export function cerrarSesion() {
    localStorage.removeItem('token')
    window.location.href = `${import.meta.env.BASE_URL}login`
}
