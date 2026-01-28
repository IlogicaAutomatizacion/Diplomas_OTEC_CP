import { forwardRef, Module } from "@nestjs/common";

import { InscripcionesController } from "./inscripciones.controller";
import { InscripcionesService } from "./inscripciones.service";
import { DatabaseModule } from "../database/database.module";
import { CursoArmadoModule } from "../cursoArmado/cursoArmado.module";
import { UsuarioModule } from "../usuarios/usuarios.module";

@Module({
    imports: [
        DatabaseModule, 
        forwardRef(() => CursoArmadoModule),
        UsuarioModule, 
    ],
    controllers: [InscripcionesController],
    providers: [InscripcionesService],
     exports: [InscripcionesService],
})

export class InscripcionesModule { }