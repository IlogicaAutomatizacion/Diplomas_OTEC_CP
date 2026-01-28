import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './DBApi/database/database.module';
import { UsuarioModule } from './DBApi/usuarios/usuarios.module';
import { CursoArmadoModule } from './DBApi/cursoArmado/cursoArmado.module';
import { CursosModule } from './DBApi/cursos/cursos.module';

import { InscripcionesModule } from './DBApi/inscripciones/inscripciones.module';

import { SuscriptoresModule } from './DBApi/suscriptores/suscriptores.module';
import { EmpresasModule } from './DBApi/empresas/empresas.module';


import { SuscripcionVinculadaCursos } from './Entities/suscripciones-cursos';
import { SuscripcionVinculadaCursosArmados } from './Entities/suscripciones-cursos_armados';
import { SuscripcionVinculadaEmpresas } from './Entities/suscripciones-empresas';
import { SuscripcionVinculadaUsuarios } from './Entities/suscripciones-usuarios';

import { SuscriptoresModule } from './dbapi/suscriptores/suscriptores.module';

@Module({
  imports: [

    TypeOrmModule.forRoot({
      url: 'postgresql://neondb_owner:npg_3MohIlUH7SYV@ep-late-snow-acftyarf-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      synchronize: true,
      type: 'postgres',
      autoLoadEntities: true
    }),
    DatabaseModule,
    UsuarioModule,
    CursoArmadoModule,
    CursosModule,
    InscripcionesModule,
    SuscriptoresModule,
    SuscripcionVinculadaCursos,
    SuscripcionVinculadaCursosArmados,
    SuscripcionVinculadaEmpresas,
    SuscripcionVinculadaUsuarios,
    EmpresasModule
  ],
})
export class AppModule { }
