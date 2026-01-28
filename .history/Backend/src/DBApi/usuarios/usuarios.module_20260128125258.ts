import { Module } from "@nestjs/common";

import { UsuarioController } from "./usuarios.controller";
import { UsuarioService } from "./usuarios.service";

@Module({
    controllers: [UsuarioController],
    
    providers: [UsuarioService]
})

export class UsuarioModule { }