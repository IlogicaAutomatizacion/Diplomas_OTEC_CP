import { useEffect, useMemo, useRef, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useFloating, offset, flip, shift } from '@floating-ui/react'

type Opcion<T> = {
    nombre: string | null | undefined
    opcion: T
}

type ExampleProps<T> = {
    opciones: Opcion<T>[]
    seleccionado?: string | null
    noCambiarNombreAlSeleccionar?: boolean
    titulo?: string | null
    callbackOnSelect?: (opcion: T) => void
    ordenarNumerico?: boolean // 🔹 nuevo
}

export function Example<T>({
    opciones,
    seleccionado,
    noCambiarNombreAlSeleccionar = false,
    callbackOnSelect,
    titulo,
    ordenarNumerico = false
}: ExampleProps<T>) {

    const { refs, floatingStyles } = useFloating({
        middleware: [offset(6), flip(), shift()],
        placement: 'bottom-start'
    })

    const [textoMostrado, setTextoMostrado] = useState<string>(
        titulo ?? seleccionado ?? 'Opciones'
    )

    const [search, setSearch] = useState('')
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

    useEffect(() => {
        if (titulo) {
            setTextoMostrado(titulo)
        }
    }, [titulo])

    useEffect(() => {
        if (!noCambiarNombreAlSeleccionar && seleccionado) {
            setTextoMostrado(seleccionado)
        }
    }, [seleccionado, noCambiarNombreAlSeleccionar])

    const handleSelect = (objeto: Opcion<T>) => {
        if (!noCambiarNombreAlSeleccionar) {
            setTextoMostrado(objeto.nombre ?? 'Opciones')
        }

        callbackOnSelect?.(objeto.opcion)
    }

    const opcionesOrdenadas = useMemo(() => {
        return [...opciones].sort((a, b) => {
            if (!a.nombre || !b.nombre) return 0

            if (ordenarNumerico) {
                return Number(a.nombre) - Number(b.nombre)
            }

            return a.nombre.localeCompare(b.nombre, 'es', {
                sensitivity: 'base'
            })
        })
    }, [opciones, ordenarNumerico])

    // 🔹 Filtrar por búsqueda
    const opcionesFiltradas = useMemo(() => {
        return opcionesOrdenadas.filter(o =>
            o.nombre?.toLowerCase().includes(search.toLowerCase())
        )
    }, [opcionesOrdenadas, search])

    return (
        <Menu as="div" className="inline-block relative">
            <MenuButton
                ref={refs.setReference}
                className="cursor-pointer inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20"
            >
                {textoMostrado}
                <ChevronDownIcon
                    aria-hidden="true"
                    className="-mr-1 size-5 text-gray-400"
                />
            </MenuButton>

            <MenuItems
                ref={refs.setFloating}
                style={floatingStyles}
                className="z-50 mt-2 rounded-md bg-gray-800 shadow-lg focus:outline-none w-56"
            >
                <div className="p-2">
                    {/* 🔹 Buscador */}
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-2 py-1 mb-2 text-sm rounded bg-gray-700 text-white outline-none"
                    />
                </div>

                <div className="py-1 max-h-60 overflow-y-auto">
                    {opcionesFiltradas.map((objeto, index) => (
                        <MenuItem
                            key={String((objeto.opcion as any)?.id ?? objeto.nombre)}
                        >
                            {({ active }) => (
                                <button
                                    ref={(el) => {
                                        itemRefs.current[index] = el
                                    }}
                                    onClick={() => handleSelect(objeto)}
                                    className={`block w-full px-4 py-2 text-left text-sm text-gray-300 
                                    ${active ? 'bg-white/10 text-white' : ''}`}
                                >
                                    {objeto.nombre}
                                </button>
                            )}
                        </MenuItem>
                    ))}

                    {opcionesFiltradas.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-400">
                            Sin resultados
                        </div>
                    )}
                </div>
            </MenuItems>
        </Menu>
    )
}