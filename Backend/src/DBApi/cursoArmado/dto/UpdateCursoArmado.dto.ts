import { PartialType } from '@nestjs/mapped-types'
import { CreateCursoArmadoDto } from './CreateCursoArmado.dto';

export class UpdateCursoArmadoDto extends PartialType(CreateCursoArmadoDto) { }