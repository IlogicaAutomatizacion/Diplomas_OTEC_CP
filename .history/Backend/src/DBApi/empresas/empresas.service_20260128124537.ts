import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from 'src/Entities/empresas.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmpresasService {
    constructor(@InjectRepository(Empresa) private readonly empresaRepo: Repository<Empresa>) { }

    async crearEmpresa(dto: createEmpresaDto) {
        const empresa = this.empresaRepo.create(dto)

        return this.empresaRepo.save(empresa)
    }

    async obtenerEmpresas() {
        return this.empresaRepo.find()
    }

    async obtenerCantidadDeEmpresas() {
        return this.empresaRepo.count()
    }

    async obtenerCursosArmadosDeEmpresa(id_empresa: number) {
        const empresa = await this.empresaRepo.findOne({
            where: { id_empresa },
            relations: {
                cursosArmados: {
                    curso: true,
                    profesor:true,
                    inscripciones:{
                        usuario:true
                    }
                }
            }
        })

        if (!empresa) {
            throw new NotFoundException('No se encontró la empresa.')
        }

        return empresa
    }

    async obtenerEmpresaPorId(id: number) {
        const empresa = await this.empresaRepo.findOneBy({ id_empresa: id })

        if (!empresa) {
            throw new NotFoundException('No se encontró la empresa.')
        }

        return empresa
    }


    async obtenerEmpresaPorRut(rut: string) {
        const empresa = await this.empresaRepo.findOneBy({ rut })

        if (!empresa) {
            throw new NotFoundException('No se encontró la empresa.')
        }

        return empresa
    }

    async eliminarEmpresaPorId(id: number) {
        const empresa = await this.empresaRepo.delete({ id_empresa: id })

        if (empresa.affected === 0) {
            throw new NotFoundException('Empreas no encontrado.')
        }

        return {
            message: 'La empresa se eliminó correctamente'
        }
    }
    async eliminarEmpresaPorRut(rut: string) {
        const empresa = await this.empresaRepo.delete({ rut })

        if (empresa.affected === 0) {
            throw new NotFoundException('Empreas no encontrado.')
        }

        return {
            message: 'La empresa se eliminó correctamente'
        }
    }

    async editarEmpresaPorId(
        id: number,
        propiedad: string,
        nuevoValor: string | number,
    ) {
        const empresa = await this.obtenerEmpresaPorId(id)

        empresa[propiedad] = nuevoValor

        return this.empresaRepo.save(empresa)
    }
    async editarEmpresaPorRut(
        rut: string,
        propiedad: string,
        nuevoValor: string | number,
    ) {
        const empresa = await this.obtenerEmpresaPorRut(rut)

        empresa[propiedad] = nuevoValor

        return this.empresaRepo.save(empresa)
    }
}
