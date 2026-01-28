import { Module } from "@nestjs/common";

import { UsuarioController } from "./usuarios.controller";
import { UsuarioService } from "./usuarios.service";
import { DatabaseModule } from "../database/database.module";
import { UsuariosGateway } from "./usuarios-gateway/usuarios.gateway";

@Module({
    controllers: [UsuarioController],
    imports:[DatabaseModule,UsuariosGateway],
    providers: [UsuarioService]
})

export class UsuarioModule { }