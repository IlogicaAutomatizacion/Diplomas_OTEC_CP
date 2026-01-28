import { Module } from "@nestjs/common";

@Module({
    controllers: [CursoArmadoController],
    providers: [CursoArmadoService]
})

export class CursosModule { }