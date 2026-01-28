import { Module } from "@nestjs/common";

import { UsuarioController } from "./usuarios.controller";
import { UsuarioService } from "./usuarios.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    controllers: [UsuarioController],
    imports:[DatabaseModule]
    providers: [UsuarioService]
})

export class UsuarioModule { }