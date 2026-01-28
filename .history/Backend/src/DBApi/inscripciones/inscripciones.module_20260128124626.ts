import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { InscripcionesController } from "./inscripciones.controller";
import { InscripcionesService } from "./inscripciones.service";

@Module({
    controllers: [InscripcionesController],
    providers: [InscripcionesService]
})

export class InscripcionesModule { }