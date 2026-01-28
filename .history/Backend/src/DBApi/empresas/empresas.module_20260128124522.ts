import { Module } from "@nestjs/common";
import { CursoArmadoController } from "./cursoArmado.controller";
import { CursoArmadoService } from "./cursoArmado.service";
import { EmpresasController } from "./empresas.controller";
import { EmpresasService } from "./empresas.service";

@Module({
    controllers: [EmpresasController],
    providers: [EmpresasService]
})

export class EmpresasModule { }