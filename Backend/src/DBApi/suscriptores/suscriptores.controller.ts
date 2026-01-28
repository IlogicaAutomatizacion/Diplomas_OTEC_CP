import { Controller } from '@nestjs/common';
import { SuscriptoresService } from './suscriptores.service';

@Controller('suscriptores')
export class SuscriptoresController {
  constructor(private readonly suscriptoresService: SuscriptoresService) {}
}
