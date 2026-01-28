import { PartialType } from '@nestjs/mapped-types';

export class UpdateInscripcionDto extends PartialType(CreateInscripcionDto) { }