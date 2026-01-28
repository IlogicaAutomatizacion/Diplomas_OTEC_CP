import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuscripcionVinculadaCursos } from '../../Entities/suscripciones-cursos';
import { SuscripcionVinculadaCursosArmados } from '../../Entities/suscripciones-cursos_armados';
import { SuscripcionVinculadaEmpresas } from '../../Entities/suscripciones-empresas';
import { SuscripcionVinculadaUsuarios } from '../../Entities/suscripciones-usuarios';
import { Usuario } from 'src/Entities/usuarios.entity';
import { Curso } from 'src/Entities/cursos.entity';
import { CursoArmado } from 'src/Entities/cursos-armados.entity';
import { Inscripcion } from 'src/Entities/inscripciones.entity';
import { Suscriptor } from 'src/Entities/suscriptores.entity';
import { Empresa } from 'src/Entities/empresas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Curso,
      CursoArmado,
      Inscripcion,
      Suscriptor,
      Empresa,
      SuscripcionVinculadaCursos,
      SuscripcionVinculadaCursosArmados,
      SuscripcionVinculadaEmpresas,
      SuscripcionVinculadaUsuarios,
    ]),
  ],
  exports: [
    TypeOrmModule
  ],
})
export class DatabaseModule {}
