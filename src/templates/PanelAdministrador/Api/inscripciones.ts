import { backend } from "../../../vars";
import type { cursoArmado } from "./cursos-armados";
import type { usuario } from "./usuarios";

export interface inscripcion {
    id_inscripcion?: number;
    rut?: string;
    usuario?: usuario;
    cursoArmado: number;
    asistencias?: number;
    calificacion?: number;
    teorica?: number;
    notificar?: boolean;
    asistencia_marcada?: boolean
}

export async function crearInscripcionAsync(data: {
    usuario: number;
    cursoArmado: number;
    asistencias?: number;
    calificacion?: number;
    teorica?: number
}) {
    const res = await fetch(`${backend}/inscripciones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Hubo un problema al crear la inscripción.');
    }

    return res.json();
}

export async function crearInscripcionesAsync(data: inscripcion[]) {
    console.log(data)
    const res = await fetch(`${backend}/inscripciones/crearInscripciones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inscripciones: data
        }),
    });

    if (!res.ok) {
        throw new Error('Hubo un problema al crear las inscripciónes.');
    }

    const cursoArmadoActualizado: cursoArmado = await res.json();

    return cursoArmadoActualizado
}




export async function obtenerInscripcionesAsync() {
    const res = await fetch(`${backend}/inscripciones`);

    if (!res.ok) {
        throw new Error('No se pudieron obtener las inscripciones.');
    }

    return res.json();
}


export async function editarInscripcionAsync(
    id_inscripcion: number,
    data: {
        asistencias?: number;
        notificar?: boolean;
        asistencia_marcada?: boolean;
        calificacion?: number;
    }
) {
    const res = await fetch(`${backend}/inscripciones/${id_inscripcion}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al editar la inscripción.');
    }

    return res.json();
}

export async function eliminarInscripcionAsync(id: number) {
    const res = await fetch(`${backend}/inscripciones/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        console.log(await res.json())
        throw new Error('Hubo un problema al eliminar la inscripción.');
    }

    return res.json()
}
