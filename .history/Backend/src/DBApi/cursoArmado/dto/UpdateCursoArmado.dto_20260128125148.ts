import { PartialType } from '@nestjs/mapped-types'
import { CreateCursoArmadoDto } from './crearCursoArmado.dto'

export class UpdateCursoArmadoDto extends PartialType(CreateCursoArmadoDto) { }