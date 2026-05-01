import { backend } from "../../../vars";
import type { rolEnum } from "./roles";
import type { usuario } from "./usuarios";


export type perfilAutenticado = {
    cuenta: {
        correo: string
        isActive: boolean
    }
    usuario: usuario | null
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

export function cerrarSesion() {
    localStorage.removeItem('token')
    window.location.href = `${import.meta.env.BASE_URL}login`
}
