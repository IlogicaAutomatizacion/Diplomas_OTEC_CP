import { Module } from "@nestjs/common";

import { InscripcionesController } from "./inscripciones.controller";
import { InscripcionesService } from "./inscripciones.service";

@Module({
    imports: [
        DatabaseModule, // 🔥 PARA LOS REPOS
        forwardRef(() => CursoArmadoModule), // 🔥 por dependencia circular
        UsuarioModule, // si usas UsuarioService o UsuarioRepo
    ],
    controllers: [InscripcionesController],
    providers: [InscripcionesService]
})

export class InscripcionesModule { }