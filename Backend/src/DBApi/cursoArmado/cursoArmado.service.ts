import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CursoArmado } from 'src/Entities/cursos-armados.entity';
import { Repository } from 'typeorm';

import { Inscripcion } from 'src/Entities/inscripciones.entity';
import { InscripcionesService } from '../inscripciones/inscripciones.service';
import { CreateCursoArmadoDto, ErroresDeEstado } from './dto/CreateCursoArmado.dto';
import { UpdateCursoArmadoDto } from './dto/UpdateCursoArmado.dto';

@Injectable()
export class CursoArmadoService {
    constructor(
        @InjectRepository(CursoArmado)
        private readonly cursoArmadoRepository: Repository<CursoArmado>,

        @Inject(forwardRef(() => InscripcionesService))
        private readonly inscripcionesRepository: InscripcionesService,
    ) { }

    async crear(dto: CreateCursoArmadoDto): Promise<CursoArmado> {
        const cursoArmado = this.cursoArmadoRepository.create(dto)

        this.comprobarFechas(cursoArmado)
        this.checarEstado(cursoArmado)
        await this.checarEnClase(cursoArmado)

        const guardado = await this.cursoArmadoRepository.save(cursoArmado)

        return this.obtenerPorId(guardado.curso_armado_id)
    }

    async obtenerCantidadDeCursos(): Promise<number> {
        return this.cursoArmadoRepository.count()
    }

    async obtenerTodos(): Promise<CursoArmado[]> {
        return this.cursoArmadoRepository.find({
            relations: {
                empresa: true,
                profesor: true,
                curso: true,

                inscripciones: {
                    usuario: true,
                },
            },
            order: {
                fecha_inicio: 'DESC',
            },
        })
    }

    async obtenerPorId(id: number): Promise<CursoArmado> {
        const cursoArmado = await this.cursoArmadoRepository.findOne({
            where: { curso_armado_id: id },
            relations: {
                empresa: true,
                profesor: true,
                curso: true,

                inscripciones: {
                    usuario: true,
                },
            },
        })

        if (!cursoArmado) {
            throw new NotFoundException(
                `Curso armado con id ${id} no encontrado`,
            )
        }

        return cursoArmado
    }

    async actualizar(
        id: number,
        dto: UpdateCursoArmadoDto,
    ): Promise<CursoArmado> {
        console.log(id, dto)
        const cursoArmado = await this.obtenerPorId(id)

        Object.assign(cursoArmado, dto)

        this.comprobarFechas(cursoArmado)
        this.checarEstado(cursoArmado)
        await this.checarEnClase(cursoArmado)

        return this.cursoArmadoRepository.save(cursoArmado)
    }

    async eliminar(id: number): Promise<{ message: string }> {
        const cursoArmado = await this.obtenerPorId(id)

        await this.cursoArmadoRepository.remove(cursoArmado)

        return {
            message: 'Curso armado eliminado correctamente',
        }
    }

    ////

    async checarSiPuedeFinalizar(id: number) {
        const cursoArmado = await this.obtenerPorId(id)
        let puedeFinalizar = true

        cursoArmado.inscripciones.forEach(inscripcion => {
            if (
                (inscripcion.asistencias === null || inscripcion.asistencias === undefined) || Number(inscripcion.calificacion) === 0
            ) {
                puedeFinalizar = false
            }
        })

        return puedeFinalizar
    }

    async checarEnClase(cursoArmado: CursoArmado) {
        if (!cursoArmado.en_clase) {
            await this.inscripcionesRepository.desactivarTodasLasAsistenciasMarcadasDeUnCursoArmado(cursoArmado.curso_armado_id)
        } else {
            if (cursoArmado.estado === 'FINALIZADO' || cursoArmado.estado === 'INACTIVO') {
                throw new ForbiddenException(ErroresDeEstado.CLASEPROHIBIDA)
            }
        }
    }

    checarEstado(cursoArmado: CursoArmado) {
        switch (cursoArmado.estado) {
            case 'INACTIVO':
                return
            case 'ACTIVO':
                if (!cursoArmado.fecha_finalizacion) {
                    throw new BadRequestException(ErroresDeEstado.NOFINALIZACION)

                }

                if (!cursoArmado.fecha_inicio) {
                    throw new BadRequestException(ErroresDeEstado.NOINICIO)

                }

                if (!cursoArmado.profesor) {
                    throw new BadRequestException(ErroresDeEstado.NOPROFESOR)

                }

                if (!cursoArmado.curso) {
                    throw new BadRequestException(ErroresDeEstado.NOCURSO)

                }
                if (!cursoArmado.empresa) {
                    throw new BadRequestException(ErroresDeEstado.NOEMPRESA)

                }


                break;
            case 'FINALIZADO':
                const puedeFinalizar = this.checarSiPuedeFinalizar(cursoArmado.curso_armado_id)

                if (!puedeFinalizar) {
                    throw new BadRequestException(ErroresDeEstado.NOPUEDEFINALIZAR)
                }

                break;
        }

    }

    ////

    comprobarFechas(cursoArmado: CursoArmado) {
        if (cursoArmado.fecha_finalizacion < cursoArmado.fecha_inicio) {
            throw new BadRequestException('La fecha de finalizacion no puede ser menor a la fecha de inicio.')
        }

    }
}
