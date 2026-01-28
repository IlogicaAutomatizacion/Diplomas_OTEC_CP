import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { createEmpresaDto } from './dto/CreateEmpresa.dto';
import { EditarEmpresaDto } from './dto/EditarEmpresa.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) { }

  @Post()
  @HttpCode(201)
  crearEmpresa(@Body() dto: createEmpresaDto) {
    console.log(dto)
    return this.empresasService.crearEmpresa(dto)
  }

  @Patch('empresa/:id')
  @HttpCode(206)
  editarEmpresaPorId(@Body() dto: EditarEmpresaDto, @Param('id', ParseIntPipe) id: number) {
    return this.empresasService.editarEmpresaPorId(id, dto.propiedad, dto.nuevoValor);
  }

  @Get('empresa/:id')
  obtenerEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.obtenerEmpresaPorId(id)
  }
  @Get('empresa/:id')
  obtenerEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.obtenerEmpresaPorId(id)
  }

  @Get()
  obtenerEmpresas() {
    return this.empresasService.obtenerEmpresas()
  }

  @Get('count')
  obtenerCantidadDeEmpresas() {
    return this.empresasService.obtenerCantidadDeEmpresas()
  }

  @Delete('empresa/:id')
  eliminarEmpresaPorId(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.eliminarEmpresaPorId(id)
  }
}
