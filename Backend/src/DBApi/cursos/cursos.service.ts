import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from 'src/Entities/cursos.entity';
import { Repository } from 'typeorm';
import { createCursoDto } from './dto/createCurso.dto';

@Injectable()
export class CursosService {

    constructor(@InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>) { }

    async crearCurso(dto: createCursoDto) {
        const curso = this.cursoRepo.create(dto)

        return this.cursoRepo.save(curso)
    }

    async obtenerCursos() {
        return this.cursoRepo.find()
    }

    async obtenerCantidadDeCursos() {
        return this.cursoRepo.count()
    }

    async obtenerCursoPorId(id: number) {
        const curso = await this.cursoRepo.findOneBy({ curso_id: id })

        if (!curso) {
            throw new NotFoundException('No se encontró el curso.')
        }

        return curso
    }

    async eliminarCursoPorId(id: number) {
        const curso = await this.cursoRepo.delete({ curso_id: id })

        if (curso.affected === 0) {
            throw new NotFoundException('Curso no encontrado.')
        }

        return {
            message: 'El curso se eliminó correctamente'
        }
    }

    async editarCurso<K extends keyof createCursoDto>(
        id: number,
        propiedad: K,
        nuevoValor: createCursoDto[K],
    ) {
        const curso = await this.obtenerCursoPorId(id)

        curso[propiedad] = nuevoValor as unknown as Curso[K]

        return this.cursoRepo.save(curso)
    }
}
