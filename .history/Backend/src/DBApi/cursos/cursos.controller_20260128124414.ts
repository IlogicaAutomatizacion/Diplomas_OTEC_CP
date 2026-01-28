import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { createCursoDto } from './dto/createCurso.dto';
import { EditarCursoDto } from './dto/editarCurso.dto';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) { }

  @Post()
  @HttpCode(201)
  crearCurso(@Body() dto: createCursoDto) {
    return this.cursosService.crearCurso(dto)
  }

  @Patch('curso/:id')
  @HttpCode(206)
  editarCurso(@Body() dto: EditarCursoDto, @Param('id', ParseIntPipe) id: number) {
    return this.cursosService.editarCurso(id, dto.propiedad, dto.nuevoValor);
  }

  @Get('curso/:id')
  obtenerCurso(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.obtenerCursoPorId(id)
  }

  @Get()
  obtenerCursos() {
    return this.cursosService.obtenerCursos()
  }

  @Get('count')
  obtenerCantidadDeCursos() {
    return this.cursosService.obtenerCantidadDeCursos()
  }

  @Delete('curso/:id')
  eliminarCurso(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.eliminarCursoPorId(id)
  }
}
