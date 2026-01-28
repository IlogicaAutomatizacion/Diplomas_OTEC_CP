import { IsIn, IsNotEmpty } from 'class-validator';
import { createEmpresaDto } from './createEmpresa.dto';

export class EditarEmpresaDto {
    @IsIn(['rut', 'telefono_contacto', 'nombre', 'email_contacto', 'nombre_contacto'], {
        message: 'La propiedad no es válida',
    })
    propiedad: keyof createEmpresaDto;

    @IsNotEmpty({ message: 'El nuevo valor es obligatorio' })
    nuevoValor: string | number;
}
