import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";

@Module({
    controllers: [CursoArmadoController],
    providers: []
})

export class CursoArmadoModule { }