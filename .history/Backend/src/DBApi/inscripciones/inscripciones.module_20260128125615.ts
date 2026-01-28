import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { InscripcionesController } from "./inscripciones.controller";

@Module({
    controllers: [InscripcionesController],
    providers: [InscripcionesService]
})

export class InscripcionesModule { }