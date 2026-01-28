import { IsIn, IsNotEmpty } from 'class-validator';
import { CreateUsuarioDto } from './CreateUser.dto';

export class EditarUsuarioDto {
    @IsIn(['rut', 'nombre', 'fono_fax', 'correo', 'direccion','especialidad'], {
        message: 'La propiedad no es válida',
    })
    propiedad: keyof CreateUsuarioDto;

    @IsNotEmpty({ message: 'El nuevo valor es obligatorio' })
    nuevoValor: string | number;
}
