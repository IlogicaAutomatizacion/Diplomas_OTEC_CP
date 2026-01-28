import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/CreateUser.dto';
import { EditarUsuarioDto } from './dto/EditarUsuario.dto';


@Controller('usuarios')
export class UsuarioController {

    constructor(private usuarioService: UsuarioService) { }

    @Post()
    @HttpCode(201)
    crearUsuario(@Body() dto: CreateUsuarioDto) {
        console.log(dto)
        return this.usuarioService.crearUsuario(dto)
    }

    @Patch('usuario/:id')
    @HttpCode(206)
    editarUsuarioPorId(@Body() dto: EditarUsuarioDto, @Param('id', ParseIntPipe) id: number) {
        return this.usuarioService.editarUsuarioPorId(id, dto.propiedad, dto.nuevoValor);
    }

    @Get('usuario/estudiante/:id')
    obtenerInscripcionesParaPanelAlumno(@Param('id', ParseIntPipe) id_usuario: number) {
        return this.usuarioService.obtenerInscripcionesParaPanelAlumno(id_usuario)
    }
    @Get('usuario/profesor/:id')
    obtenerCursosParaPanelProfesor(@Param('id', ParseIntPipe) id_usuario: number) {
        return this.usuarioService.obtenerCursosParaPanelProfesor(id_usuario)
    }

    @Get('usuario/:id')
    obtenerUsuario(@Param('id', ParseIntPipe) id: number) {
        return this.usuarioService.obtenerUsuarioPorId(id)
    }

    @Get()
    obtenerUsuarios() {
        return this.usuarioService.obtenerTodosLosUsuarios()
    }

    @Get('count')
    obtenerCantidadDeUsuarios() {
        return this.usuarioService.obtenerCantidadDeUsuarios()
    }

    @Delete('usuario/:id')
    eliminarUsuarioPorId(@Param('id', ParseIntPipe) id: number) {
        return this.usuarioService.eliminarUsuarioPorId(id)
    }
}
