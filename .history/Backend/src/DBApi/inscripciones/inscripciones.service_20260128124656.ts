import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CursoArmado } from 'src/Entities/cursos-armados.entity';
import { Inscripcion } from 'src/Entities/inscripciones.entity';
import { Usuario } from 'src/Entities/usuarios.entity';
import { Repository } from 'typeorm';

import { CursoArmadoService } from '../cursoArmado/cursoArmado.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/UpdateInscripcion.dto';

@Injectable()
export class InscripcionesService {
    constructor(
        @InjectRepository(Inscripcion)
        private readonly inscripcionRepo: Repository<Inscripcion>,

        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,

        @InjectRepository(CursoArmado)
        private readonly cursoArmadoRepo: Repository<CursoArmado>,

        @Inject(forwardRef(() => CursoArmadoService))
        private readonly cursosArmadosService: CursoArmadoService,
    ) { }

    async crear(dto: CreateInscripcionDto) {
        const { usuario, cursoArmado } = dto;

        // 1️⃣ Validar existencia de usuario
        const usuarioEntity = await this.usuarioRepo.findOne({
            where: { id: usuario },
        });

        if (!usuarioEntity) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // 2️⃣ Validar existencia de curso armado
        const cursoArmadoFrom = await this.cursoArmadoRepo.findOne({
            where: { curso_armado_id: cursoArmado },
        });

        if (!cursoArmado) {
            throw new NotFoundException('Curso armado no encontrado');
        }

        // 3️⃣ Evitar inscripción duplicada
        const existe = await this.inscripcionRepo.findOne({
            where: {
                usuario: { id: usuario },
                cursoArmado: { curso_armado_id: cursoArmado },
            },
        });

        if (existe) {
            throw new BadRequestException(
                'El usuario ya está inscrito en este curso'
            );
        }

        const inscripcion = this.inscripcionRepo.create({
            usuario: { id: dto.usuario },
            cursoArmado: { curso_armado_id: dto.cursoArmado },
            asistencias: dto.asistencias ?? 0,
            calificacion: dto.calificacion ?? 0,
        });

        await this.inscripcionRepo.save(inscripcion);

        const cursoActualizado = await this.cursosArmadosService.obtenerPorId(cursoArmado)

        return cursoActualizado;
    }

    async obtenerTodas() {
        return this.inscripcionRepo.find({
            relations: ['usuario', 'cursoArmado'],
        });
    }


    async obtenerPorId(id: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: id },
            relations: ['usuario', 'cursoArmado'],
        });

        if (!inscripcion) {
            throw new NotFoundException('Inscripción no encontrada');
        }

        return inscripcion;
    }

    async desactivarTodasLasAsistenciasMarcadasDeUnCursoArmado(cursoArmadoId: number) {
        return this.inscripcionRepo
            .createQueryBuilder()
            .update()
            .set({ asistencia_marcada: false })
            .where('curso_armado_id = :id', { id: cursoArmadoId })
            .execute()
    }

    async actualizar(id: number, dto: UpdateInscripcionDto) {
        const inscripcion = await this.obtenerPorId(id);

        // Cambiar usuario (opcional)
        if (dto?.usuario) {
            const usuario = await this.usuarioRepo.findOne({
                where: { id: dto.usuario },
            });

            if (!usuario) {
                throw new NotFoundException('Usuario no encontrado');
            }

            inscripcion.usuario = usuario;
        }

        // Cambiar curso armado (opcional)
        if (dto?.cursoArmado) {
            const cursoArmadoC = await this.cursoArmadoRepo.findOne({
                where: { curso_armado_id: dto.cursoArmado },
            });

            if (!cursoArmadoC) {
                throw new NotFoundException('Curso armado no encontrado');
            }

            inscripcion.cursoArmado = cursoArmadoC;
        }

        // Campos simples
        if (dto.asistencias !== undefined) {
            inscripcion.asistencias = dto.asistencias;
        }

        if (dto.calificacion !== undefined) {
            inscripcion.calificacion = dto.calificacion;
        }

        if (dto.notificar !== undefined) {
            inscripcion.notificar = dto.notificar;
        }

        if (dto.asistencia_marcada !== undefined) {
            if (dto.asistencia_marcada && inscripcion.cursoArmado.en_clase && inscripcion.cursoArmado.estado !== 'FINALIZADO') {
                inscripcion.asistencia_marcada = true
                inscripcion.asistencias += 1
            } else {
                inscripcion.asistencia_marcada = false
            }

        }

        return this.inscripcionRepo.save(inscripcion);
    }


    async eliminar(id: number) {
        const inscripcion = await this.obtenerPorId(id);
        await this.inscripcionRepo.remove(inscripcion);

        const cursoActualizado = await this.cursosArmadosService.obtenerPorId(inscripcion.cursoArmado.curso_armado_id)

        return cursoActualizado
    }
}
