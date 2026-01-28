import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class createCursoDto {

    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
    nombre: string;

    @IsNotEmpty({ message: 'La duración del curso es obligatoria' })
    @IsInt({ message: 'La duración debe ser un número entero' })
    @Min(1, { message: 'La duración debe ser mayor a 0' })
    duracion: number;

    @IsString({ message: 'El resumen debe ser un texto' })
    @IsNotEmpty({ message: 'El resumen es obligatorio' })
    resumen: string;

    @IsString({ message: 'El temario debe ser un texto' })
    @IsNotEmpty({ message: 'El temario es obligatorio' })
    temario: string;

}