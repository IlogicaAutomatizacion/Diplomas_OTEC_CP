import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { InscripcionesModule } from "../inscripciones/inscripciones.module";

@Module({
    imports: [
        DatabaseModule, /
        forwardRef(() => InscripcionesModule), 
    ],
    controllers: [CursoArmadoController],
    providers: [CursoArmadoService]
})

export class CursoArmadoModule { }