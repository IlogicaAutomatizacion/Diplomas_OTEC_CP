import { useEffect, useRef, useState } from 'react'
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
}

export function Example<T>({
    opciones,
    seleccionado,
    noCambiarNombreAlSeleccionar = false,
    callbackOnSelect,
    titulo
}: ExampleProps<T>) {

    const { refs, floatingStyles } = useFloating({
        middleware: [offset(6), flip(), shift()],
        placement: 'bottom-start'
    })

    const [textoMostrado, setTextoMostrado] = useState<string>(
        titulo ?? seleccionado ?? 'Opciones'
    )

    // 🔹 Buffer de búsqueda personalizado
    const [searchBuffer, setSearchBuffer] = useState('')
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const newBuffer = (searchBuffer + e.key).toLowerCase()
            setSearchBuffer(newBuffer)

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                setSearchBuffer('')
            }, 3000) // ⬅️ Cambia aquí el tiempo antes de resetear

            // Buscar coincidencia
            const index = opciones.findIndex(o =>
                o.nombre?.toLowerCase().startsWith(newBuffer)
            )

            if (index !== -1) {
                itemRefs.current[index]?.focus()
            }
        }
    }

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
                onKeyDown={handleKeyDown}
                className="z-50 mt-2 rounded-md bg-gray-800 shadow-lg focus:outline-none"
            >
                <div className="py-1 max-h-50 overflow-y-auto">
                    {opciones?.map((objeto, index) => (
                        <MenuItem
                            key={String((objeto.opcion as any)?.id ?? objeto.nombre)}
                        >
                            {({ active }) => (
                                <button
                                    ref={(el) => {
                                        itemRefs.current[index] = el
                                    }} onClick={() => handleSelect(objeto)}
                                    className={`block w-full px-4 py-2 text-left text-sm text-gray-300 
                                    ${active ? 'bg-white/10 text-white' : ''}`}
                                >
                                    {objeto.nombre}
                                </button>
                            )}
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    )
}
