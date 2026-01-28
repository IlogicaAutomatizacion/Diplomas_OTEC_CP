import { Module } from "@nestjs/common";

import { InscripcionesController } from "./inscripciones.controller";
import { InscripcionesService } from "./inscripciones.service";

@Module({
        forwardRef(() => CursoArmadoModule), // 🔥 por dependencia circular

controllers: [InscripcionesController],
    providers: [InscripcionesService]
})

export class InscripcionesModule { }