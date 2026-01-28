import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { EmpresasController } from "./empresas.controller";

@Module({
    controllers: [EmpresasController],
    providers: [CursoArmadoService]
})

export class EmpresasModule { }