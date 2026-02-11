import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

type Opcion<T> = {
    nombre: string | null | undefined
    opcion: T
}

type ExampleProps<T> = {
    opciones: Opcion<T>[]
    noCambiarNombreAlSeleccionar?: boolean
    seleccionado?: any
    titulo?: string | null
    callbackOnSelect: (opcion: T) => void
}

export function Example<T>({
    seleccionado,
    opciones,
    noCambiarNombreAlSeleccionar,
    callbackOnSelect,
    titulo
}: ExampleProps<T>) {
    const [selected, setSelected] = useState<string | null>(seleccionado)

    useEffect(() => {
        setSelected(seleccionado)
    }, [seleccionado])

    return (
        <Menu as="div" className="inline-block">
            <MenuButton className="cursor-pointer inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                {(!noCambiarNombreAlSeleccionar ? selected : null) ?? seleccionado ?? titulo ?? 'Opciones'}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems className="absolute mt-2 rounded-md bg-gray-800">
                <div className="py-1 max-h-50 overflow-y-auto">
                    {opciones?.map((objeto, indx) => (
                        <MenuItem key={indx}>
                            <button
                                onClick={() => {
                                    callbackOnSelect(objeto.opcion)
                                    setSelected(objeto.nombre ?? null)
                                }}
                                className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white"
                            >
                                {objeto.nombre}
                            </button>
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    )
}
