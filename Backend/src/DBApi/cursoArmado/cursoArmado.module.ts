import { forwardRef, Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { InscripcionesModule } from "../inscripciones/inscripciones.module";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => InscripcionesModule),
    ],
    controllers: [CursoArmadoController],
    providers: [CursoArmadoService],
    exports: [CursoArmadoService]
})

export class CursoArmadoModule { }