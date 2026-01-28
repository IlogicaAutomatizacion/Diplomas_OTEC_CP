import { IsBoolean, IsDecimal, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInscripcionDto {

    @IsNotEmpty({ message: 'El usuario es obligatorio' })
    @IsNumber({}, { message: 'El usuario tiene que ser un número' })
    usuario: number;

    @IsNotEmpty({ message: 'El curso armado es obligatorio' })
    @IsInt({ message: 'El curso armado debe ser un número entero' })
    @Min(1, { message: 'El curso armado debe ser un ID válido' })
    cursoArmado: number;

    @IsOptional()
    @IsInt({ message: 'Las asistencias deben ser un número entero' })
    @Min(0, { message: 'Las asistencias no pueden ser negativas' })
    asistencias?: number;

    @IsOptional()
    @IsNumber({}, { message: 'La calificación debe ser un número' })
    @Min(0, { message: 'La calificación no puede ser negativa' })
    calificacion?: number;

    @IsOptional()
    @IsBoolean({ message: 'El valor solo puede ser verdadero o falso.' })
    notificar?: boolean;

    @IsOptional()
    @IsBoolean({ message: 'El valor de asistencia marcada solo puede ser verdadero o falso.' })
    asistencia_marcada?: boolean;
}
