import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CursoArmado } from './cursos-armados.entity';
import { Inscripcion } from './inscripciones.entity';
import { RolVinculado } from './roles-vinculados.entity';
import { EmpresaVinculada } from './empresas-vinculadas';
import { SuscripcionVinculadaUsuarios } from './suscripciones-usuarios';

@Entity('usuarios')
export class Usuario {

  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', unique: true })
  rut: string;

  @Column()
  nombre: string;

  @Column({ name: 'fono_fax', type: 'int', nullable: true })
  fonoFax: number;

  @Column()
  correo: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column({ nullable: true })
  especialidad?: string;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  token: string;

  // RELACIONES
  @OneToMany(() => CursoArmado, ca => ca.profesor)
  cursosArmados: CursoArmado[];

  @OneToMany(() => Inscripcion, i => i.usuario)
  inscripciones: Inscripcion[];

  // @OneToMany(() => RolVinculado, rv => rv.usuario)
  // rolesVinculados: RolVinculado[];

  // @OneToMany(() => EmpresaVinculada, ev => ev.usuario)
  // empresasVinculadas: EmpresaVinculada[];

  @OneToMany(() => SuscripcionVinculadaUsuarios, sv => sv.usuario)
  suscripcionesVinculadas: SuscripcionVinculadaUsuarios[];
}

