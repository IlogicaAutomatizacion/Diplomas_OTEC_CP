import { Entity, Column, PrimaryColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmpresaVinculada } from './empresas-vinculadas';
import { Suscriptor } from './suscriptores.entity';
import { CursoArmado } from './cursos-armados.entity';
import { SuscripcionVinculadaEmpresas } from './suscripciones-empresas';

@Entity('empresas')
export class Empresa {

  @PrimaryGeneratedColumn({ name: 'id_empresa' })
  id_empresa: number

  @Column({ type: 'text', unique: true })
  rut: string;

  @Column({ name: 'telefono_contacto', type: 'text' })
  telefono_contacto: string;

  @Column()
  nombre: string;

  @Column({ name: 'email_contacto' })
  email_contacto: string;

  @Column({ name: 'nombre_contacto' })
  nombre_contacto: string;

  @OneToMany(() => EmpresaVinculada, ev => ev.empresa)
  empresasVinculadas: EmpresaVinculada[];

  @OneToMany(() => Suscriptor, s => s.empresa)
  suscriptores: Suscriptor[];

  @OneToMany(() => CursoArmado, ca => ca.empresa)
  cursosArmados: CursoArmado[];

  @OneToMany(() => SuscripcionVinculadaEmpresas, sv => sv.empresa)
  suscripcionesVinculadas: SuscripcionVinculadaEmpresas[];
}

