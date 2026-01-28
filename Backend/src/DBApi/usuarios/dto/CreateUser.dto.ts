import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsOptional,
    IsNumberString,
} from 'class-validator';

export class CreateUsuarioDto {

    @IsNotEmpty({ message: 'El rut no puede estar vacío.' })
    @IsString({ message: 'El rut debe ser texto.' })
    @MinLength(7)
    @MaxLength(12)
    rut: string;

    @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
    @IsString()
    @MinLength(3)
    nombre: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Correo inválido.' })
    correo: string;

    @IsOptional()
    @IsNotEmpty()
    @IsNumberString()

    fono_fax?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    especialidad?: string;
}
