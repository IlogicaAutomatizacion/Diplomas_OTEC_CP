import { IsIn, IsNotEmpty } from 'class-validator';
import { createCursoDto } from './createCurso.dto';

export class EditarCursoDto {
    @IsIn(['nombre', 'duracion', 'resumen', 'temario'], {
        message: 'La propiedad no es válida',
    })
    propiedad: keyof createCursoDto;

    @IsNotEmpty({ message: 'El nuevo valor es obligatorio' })
    nuevoValor: string | number;
}
