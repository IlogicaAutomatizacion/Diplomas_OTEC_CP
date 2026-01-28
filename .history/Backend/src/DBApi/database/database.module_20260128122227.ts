import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 🔹 ENTIDADES PRINCIPALES
import { Usuario } from '../../Entities/usuario.entity';
import { Curso } from '../../Entities/curso.entity';
import { CursoArmado } from '../../Entities/curso-armado.entity';
import { Inscripcion } from '../../Entities/inscripcion.entity';
import { Suscriptor } from '../../Entities/suscriptor.entity';
import { Empresa } from '../../Entities/empresa.entity';

// 🔹 TABLAS INTERMEDIAS (suscripciones)
import { SuscripcionVinculadaCursos } from '../../Entities/suscripciones-cursos';
import { SuscripcionVinculadaCursosArmados } from '../../Entities/suscripciones-cursos_armados';
import { SuscripcionVinculadaEmpresas } from '../../Entities/suscripciones-empresas';
import { SuscripcionVinculadaUsuarios } from '../../Entities/suscripciones-usuarios';

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
