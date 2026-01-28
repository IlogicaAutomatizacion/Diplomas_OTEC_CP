import { Module } from "@nestjs/common";
import { CursosController } from "./cursos.controller";

@Module({
    controllers: [CursosController],
    providers: [cursos]
})

export class CursosModule { }