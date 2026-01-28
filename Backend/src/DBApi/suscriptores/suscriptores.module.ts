import { Module } from '@nestjs/common';
import { SuscriptoresService } from './suscriptores.service';
import { SuscriptoresController } from './suscriptores.controller';

@Module({
  controllers: [SuscriptoresController],
  providers: [SuscriptoresService],
})
export class SuscriptoresModule {}
