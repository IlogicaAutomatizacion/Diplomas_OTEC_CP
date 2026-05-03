export type ImportOmitido = {
    etiqueta: string
    motivo: string
}

export function tieneDatosImportables(item: object) {
    return Object.values(item).some(value => value !== undefined && value !== null && String(value).trim() !== '')
}

export function normalizarTexto(value: unknown) {
    return String(value ?? '').trim().toLowerCase()
}

export function normalizarRut(value: unknown) {
    return String(value ?? '').replace(/[^0-9kK]/g, '').toUpperCase()
}

export function parseOptionalNumber(value: unknown) {
    if (value === undefined || value === null) return undefined

    const text = String(value).trim()
    if (!text) return undefined

    const parsed = Number(text)
    return Number.isFinite(parsed) ? parsed : undefined
}

export function crearReporteOmitidos<T>(
    candidatos: T[],
    creados: T[],
    getKey: (item: T) => string,
    getEtiqueta: (item: T) => string,
    getMotivoInvalido: (item: T) => string | null,
    motivoNoCreado: string,
) {
    const creadosPorKey = new Map<string, number>()

    for (const creado of creados) {
        const key = getKey(creado)
        if (!key) continue
        creadosPorKey.set(key, (creadosPorKey.get(key) ?? 0) + 1)
    }

    return candidatos.flatMap((candidato) => {
        const motivoInvalido = getMotivoInvalido(candidato)
        if (motivoInvalido) {
            return [{ etiqueta: getEtiqueta(candidato), motivo: motivoInvalido }]
        }

        const key = getKey(candidato)
        const disponibles = creadosPorKey.get(key) ?? 0

        if (disponibles > 0) {
            creadosPorKey.set(key, disponibles - 1)
            return []
        }

        return [{ etiqueta: getEtiqueta(candidato), motivo: motivoNoCreado }]
    })
}
