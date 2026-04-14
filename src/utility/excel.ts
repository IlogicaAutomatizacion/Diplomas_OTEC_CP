import * as XLSX from 'xlsx'

export const leerArchivo = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    return XLSX.utils.sheet_to_json(sheet, { defval: null })
}

export const obtenerColumnas = async (file: File): Promise<string[]> => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const [primeraFila] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
    }) as unknown[][]

    return primeraFila
        .filter((celda) => celda !== null && celda !== undefined && celda !== '')
        .map(String)
}