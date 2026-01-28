import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CursoArmadoService } from './cursoArmado.service';
import { CreateCursoArmadoDto } from './dto/CreateCursoArmado.dto';
import { UpdateCursoArmadoDto } from './dto/UpdateCursoArmado.dto';


@Controller('curso-armado')
export class CursoArmadoController {
    constructor(private readonly cursoArmadoService: CursoArmadoService) { }

    @Post()
    crear(@Body() dto: CreateCursoArmadoDto) {
        return this.cursoArmadoService.crear(dto)
    }

    @Get()
    obtenerTodos() {
        return this.cursoArmadoService.obtenerTodos()
    }

    @Get('count')
    obtenerCantidad() {
        return this.cursoArmadoService.obtenerCantidadDeCursos()
    }

    @Get('curso/puedeFinalizar/:id')
    checarSiPuedeFinalizar(@Param('id', ParseIntPipe) id: number) {
        return this.cursoArmadoService.checarSiPuedeFinalizar(id)
    }

    @Get('curso/:id')
    obtenerPorId(@Param('id', ParseIntPipe) id: number) {
        return this.cursoArmadoService.obtenerPorId(id)
    }

    @Patch('curso/:id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCursoArmadoDto,
    ) {
        return this.cursoArmadoService.actualizar(id, dto)
    }

    @Delete('curso/:id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.cursoArmadoService.eliminar(id)
    }

}
