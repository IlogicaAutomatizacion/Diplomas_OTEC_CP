import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { UsuarioController } from "./usuarios.controller";
import { UsuarioService } from "./usuarios.service";

@Module({
    controllers: [UsuarioController],
    providers: [UsuarioService]
})

export class UsuarioModule { }