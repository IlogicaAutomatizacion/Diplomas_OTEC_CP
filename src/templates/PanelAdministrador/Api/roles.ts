import { backend } from "../../../vars";

const rolEnum = {
    ALUMNO: "ALUMNO",
    PROFESOR: "PROFESOR",
    EMPRESA: "EMPRESA",
    ADMINISTRADOR: 'ADMINISTRADOR',
    ADMINISTRADOREMPRESA: 'ADMINISTRADOREMPRESA'
} as const;

export type rolEnum = typeof rolEnum[keyof typeof rolEnum];

export async function obtenerRolesDeUsuarioAsync() {
    const res = await fetch(`${backend}/roles`)

    if (!res.ok) {
        throw new Error("Hubo un problema al obtener los roles del usuario.")
    }

    const roles: rolEnum[] = await res.json()

    return roles
}

export async function agregarRolAUsuarioAsync(data: {
    usuario_id: number;
    rol_enum: rolEnum;
}) {
    const res = await fetch(`${backend}/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        console.log(await res.json());
        throw new Error('Hubo un problema al vincular la empresa con el usuario.');
    }

    return res.json();
}

export async function eliminarRolPorIdDeVinculacionAsync(id_vinculacion: number) {
    const res = await fetch(`${backend}/roles/${id_vinculacion}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        console.log(await res.json());
        throw new Error('Hubo un problema al eliminar la vinculación.');
    }

    return res.json();
}

export async function eliminarRolPorIdDeUsuarioAsync(data: {
    usuario_id: number;
    rol_enum: rolEnum;
}) {
    const res = await fetch(`${backend}/roles`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        console.log(await res.json());
        throw new Error('Hubo un problema al eliminar la vinculación.');
    }

    return res.json();
}