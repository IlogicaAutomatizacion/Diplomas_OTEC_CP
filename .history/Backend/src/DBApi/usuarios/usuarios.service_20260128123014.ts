import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/Entities/usuarios.entity';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/CreateUser.dto';
import { UsuariosGateway } from './usuarios-gateway/usuarios.gateway';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,

        private readonly usuariosGateway: UsuariosGateway,

    ) { }

    async crearUsuario(dto: CreateUsuarioDto) {
        const usuario = this.usuarioRepo.create(dto)

        const creacion = await this.usuarioRepo.save(usuario)

        //   this.usuariosGateway.usuarioCreado(creacion)
        //  this.usuariosGateway.usuariosActualizados()

        return creacion
    }

    async editarUsuarioPorId(
        id: number,
        propiedad: string,
        nuevoValor: string | number,
    ) {
        const usuario = await this.obtenerUsuarioPorId(id)

        usuario[propiedad] = nuevoValor

        const save = await this.usuarioRepo.save(usuario)

        //  this.usuariosGateway.usuariosActualizados()
        //  this.usuariosGateway.usuarioActualizado(save)

        return save
    }

    async editarUsuarioPorRut(
        rut: string,
        propiedad: string,
        nuevoValor: string | number,
    ) {
        const usuario = await this.obtenerUsuarioPorRut(rut)

        usuario[propiedad] = nuevoValor

        const save = await this.usuarioRepo.save(usuario)

        //  this.usuariosGateway.usuariosActualizados()
        //  this.usuariosGateway.usuarioActualizado(save)

        return save
    }

    async eliminarUsuarioPorCorreo(correo: string) {
        const result = await this.usuarioRepo.delete({ correo })

        if (result.affected === 0) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        //  this.usuariosGateway.usuariosActualizados()

        return { mensaje: 'Usuario eliminado correctamente.' }
    }

    async eliminarUsuarioPorRut(rut: string) {
        const result = await this.usuarioRepo.delete({ rut })

        if (result.affected === 0) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        //  this.usuariosGateway.usuariosActualizados()

        return { mensaje: 'Usuario eliminado correctamente.' }
    }

    async eliminarUsuarioPorId(id: number) {
        const result = await this.usuarioRepo.delete({ id })

        if (result.affected === 0) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        // this.usuariosGateway.usuariosActualizados()

        return { mensaje: 'Usuario eliminado correctamente.' }
    }

    // async eliminarTodosLosUsuarios() {
    //     return this.usuarioRepo.deleteAll()
    // }

    async obtenerUsuarioPorId(id: number) {
        const usuario = await this.usuarioRepo.findOneBy({ id })

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        return usuario
    }

    async obtenerUsuarioPorRut(rut: string) {
        const usuario = await this.usuarioRepo.findOneBy({ rut })

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        return usuario
    }

    async obtenerUsuarioPorCorreo(correo: string) {
        const usuario = this.usuarioRepo.findOneBy({ correo })

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        return usuario
    }

    async obtenerTodosLosUsuarios() {
        return this.usuarioRepo.find()
    }

    async obtenerCantidadDeUsuarios() {
        return this.usuarioRepo.count()
    }

    ////

    async obtenerInscripcionesParaPanelAlumno(id_usuario: number) {
        const inscripciones = await this.usuarioRepo.createQueryBuilder('u')
            .innerJoin('u.inscripciones', 'i')
            .innerJoin('i.cursoArmado', 'ca')
            .innerJoin('ca.curso', 'c')
            .innerJoin('ca.profesor', 'p')
            .select([
                'u.nombre AS usuarioNombre',
                'i.id_inscripcion AS idInscripcion',
                'c.temario AS temario',
                'ca.fecha_inicio AS fechainicio',
                'ca.fecha_finalizacion AS fechafinalizacion',
                'ca.estado as estadocurso',
                'ca.en_clase as enclase',
                'c.duracion AS duracion',
                'p.nombre AS profesor',
                'c.nombre AS nombreCurso',
                'i.asistencia_marcada AS asistenciamarcada',

            ])
            .where('u.id = :id', { id: id_usuario })
            .getRawMany()


        if (!inscripciones || inscripciones.length <= 0) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        return {
            usuario: inscripciones[0].usuarionombre,
            inscripciones: inscripciones.map(r => ({
                idinscripcion: r.idinscripcion,
                temario: r.temario,
                duracion: r.duracion,
                profesor: r.profesor,
                nombrecurso: r.nombrecurso,
                estadocurso: r.estadocurso,
                fechainicio: r.fechainicio,
                enclase: r.enclase,
                asistenciamarcada: r.asistenciamarcada,
                fechafinalizacion: r.fechafinalizacion
            }))
        }

    }

    async obtenerCursosParaPanelProfesor(id_usuario: number) {
        const usuario = await this.usuarioRepo
            .createQueryBuilder('u')
            .innerJoinAndSelect(
                'u.cursosArmados',
                'ca',
                'ca.profesor = :id',
                { id: id_usuario }
            )
            .leftJoinAndSelect('ca.curso', 'c')
            .leftJoinAndSelect('ca.inscripciones', 'i')
            .leftJoinAndSelect('i.usuario', 'a')
            .where('u.id = :id', { id: id_usuario })
            .getOne()

        console.log(usuario)

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado.')
        }

        return usuario

    }
}
