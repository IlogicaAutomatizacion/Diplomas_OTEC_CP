import { IsBoolean, IsDateString, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
import { Curso } from 'src/Entities/cursos.entity'
import { Empresa } from 'src/Entities/empresas.entity'
import { Usuario } from 'src/Entities/usuarios.entity'

export enum EstadoCursoArmado {
    ACTIVO = 'ACTIVO',
    INACTIVO = 'INACTIVO',
    FINALIZADO = 'FINALIZADO',
}

export enum ErroresDeEstado {
    NOFINALIZACION = 'No se puede iniciar el curso; no hay fecha de finalización.',
    NOINICIO = 'No se puede iniciar el curso; no hay fecha de inicio.',
    NOCURSO = 'No se puede iniciar el curso; no hay un curso seleccionado.',
    NOPROFESOR = 'No se puede iniciar el curso; no hay un profesor selccionado.',
    NOEMPRESA = 'No se puede iniciar el curso; no hay una empresa seleccionada.',
    CLASEPROHIBIDA = 'No se puede iniciar la clase; el curso no está marcado como activo.',
    NOPUEDEFINALIZAR = 'No se puede finalizar el curso. todas las calificaciones son igual a 0.'
}

export class CreateCursoArmadoDto {

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
    fecha_inicio: string

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de finalización debe ser una fecha válida' })
    fecha_finalizacion: string

    @IsOptional()
    @IsNumber({}, { message: 'La calificacion aprobatoria debe de ser un numero' })
    @Min(0, { message: 'La calificacion mínima aprobatoria no puede ser negativa.' })

    calificacion_aprobatoria: number

    @IsOptional()
    @IsEnum(EstadoCursoArmado, {
        message: 'El estado debe ser ACTIVO, INACTIVO o FINALIZADO',
    })
    estado: EstadoCursoArmado

    @IsOptional()
    @IsBoolean({ message: 'El valor "en_сlase" solo puede ser verdadero o falso' })
    en_clase: boolean;

    @IsOptional()
    @IsInt({ message: 'El curso_id debe ser un número entero' })
    curso: Curso

    @IsOptional()
    @IsInt({ message: 'El profesor debe ser un número entero' })
    profesor: Usuario

    @IsOptional()
    @IsInt({ message: 'La empresa debe ser un número entero' })
    empresa: Empresa
}
