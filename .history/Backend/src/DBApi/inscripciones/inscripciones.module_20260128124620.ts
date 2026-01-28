import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";

@Module({
    controllers: [Inscon],
    providers: [CursoArmadoService]
})

export class InscripcionesModule { }