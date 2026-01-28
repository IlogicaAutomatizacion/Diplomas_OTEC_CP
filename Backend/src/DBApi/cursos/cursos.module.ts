import { Module } from "@nestjs/common";
import { CursosController } from "./cursos.controller";
import { CursosService } from "./cursos.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [CursosController],
    providers: [CursosService]
})

export class CursosModule { }