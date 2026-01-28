import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/CreateInscripcion.dto';
import { UpdateInscripcionDto } from './dto/editarInscripcion.dto';


@Controller('inscripciones')
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) { }

  @Post()
  crear(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.crear(dto);
  }

  @Get()
  obtenerTodas() {
    return this.inscripcionesService.obtenerTodas();
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inscripcionesService.obtenerPorId(id);
  }

  @Patch(':id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInscripcionDto,
  ) {
    return this.inscripcionesService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inscripcionesService.eliminar(id);
  }
}
