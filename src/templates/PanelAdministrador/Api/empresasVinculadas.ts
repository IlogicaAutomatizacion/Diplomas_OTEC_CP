import { backend } from "../../../vars";

export type EmpresaVinculada ={
    id_empresa: number,
    nombre: string
}

export async function agregarEmpresaVinculadaAsync(data: {
    usuario_id: number;
    empresa_id: number;
}) {
    const res = await fetch(`${backend}/empresasVinculadas`, {
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

export async function eliminarEmpresaVinculadaPorIdsAsync(data: {
    usuario_id: number;
    empresa_id: number;
}) {
    const res = await fetch(`${backend}/empresasVinculadas`, {
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

export async function eliminarEmpresaVinculadaPorIdAsync(
    id_vinculacion: number
) {
    const res = await fetch(
        `${backend}/empresasVinculadas/${id_vinculacion}`,
        {
            method: 'DELETE',
        }
    );

    if (!res.ok) {
        console.log(await res.json());
        throw new Error('Hubo un problema al eliminar la vinculación.');
    }

    return res.json();
}
