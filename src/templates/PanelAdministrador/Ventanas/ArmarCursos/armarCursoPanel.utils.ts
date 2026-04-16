import type { cursoArmado } from "../../Api/cursos-armados"

export const COTIZACION_FIELDS = [
    'empresa',
    'curso',
    'contactoDeCotizacion',
    'alumnosCotizados',
    'valorUnitario',
    'notas_cotizacion'
] as const satisfies readonly (keyof cursoArmado)[]

export const INICIO_FIELDS = [
    'fecha_inicio',
    'fecha_finalizacion',
    'profesor',
    'teorica',
    'calificacion_aprobatoria',
    'lugar_de_realizacion'
] as const satisfies readonly (keyof cursoArmado)[]

// Normaliza relaciones y valores simples a un identificador comparable.
export const getRelacionId = (valor: cursoArmado[keyof cursoArmado]) => {
    if (valor && typeof valor === 'object') {
        if ('id_empresa' in valor) return valor.id_empresa
        if ('curso_id' in valor) return valor.curso_id
        if ('id' in valor) return valor.id
    }

    return valor
}

export const parseOptionalNumber = (value: string) => {
    if (value.trim() === '') return undefined

    const numero = Number(value)
    return Number.isNaN(numero) ? undefined : numero
}
