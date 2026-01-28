import { IsEmail, IsNotEmpty, IsNumberString, IsString, Length, Max, MaxLength, MinLength } from "class-validator";

export class createEmpresaDto {
    @IsNotEmpty({ message: 'El RUT es obligatorio' })
    @IsString({ message: 'El RUT debe ser un texto' })
    rut: string;

    @IsNotEmpty({ message: 'El teléfono de contacto es obligatorio' })
    @IsNumberString({}, { message: 'El teléfono de contacto solo debe contener números' })
    telefono_contacto: string;

    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un texto' })
    nombre: string;

    @IsNotEmpty({ message: 'El correo de contacto es obligatorio' })
    @IsEmail({}, { message: 'El correo de contacto no tiene un formato válido' })
    email_contacto: string;

    @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
    @IsString({ message: 'El nombre del contacto debe ser un texto' })
    nombre_contacto: string;
}