import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";

@Module({
    imports: [
        DatabaseModule, // 🔥 ESTO FALTABA
        forwardRef(() => InscripcionesModule), // por tu dependencia circular
    ],
    controllers: [CursoArmadoController],
    providers: [CursoArmadoService]
})

export class CursoArmadoModule { }