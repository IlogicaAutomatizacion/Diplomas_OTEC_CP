export function cambiarFecha(fecha: string) {
    const [year, month, day] = fecha.split('-')

    return `${day}/${month}/${year}`
}