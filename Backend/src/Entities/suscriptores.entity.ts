import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Empresa } from './empresas.entity';
import { SuscripcionVinculadaUsuarios } from './suscripciones-usuarios';
import { SuscripcionVinculadaEmpresas } from './suscripciones-empresas';
import { SuscripcionVinculadaCursosArmados } from './suscripciones-cursos_armados';
import { SuscripcionVinculadaCursos } from './suscripciones-cursos';

@Entity('suscriptores')
export class Suscriptor {

  @PrimaryGeneratedColumn({ name: 'suscriptor_id' })
  suscriptor_id: number;

  @ManyToOne(() => Empresa, e => e.suscriptores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'suscriptor', referencedColumnName: 'id_empresa' })
  empresa: Empresa;

  @OneToMany(() => SuscripcionVinculadaUsuarios, sv => sv.suscriptor)
  suscripcionesVinculadasUsuarios: SuscripcionVinculadaUsuarios[];

  @OneToMany(() => SuscripcionVinculadaUsuarios, sv => sv.suscriptor)
  suscripcionesVinculadaEmpresas: SuscripcionVinculadaEmpresas[];

  @OneToMany(() => SuscripcionVinculadaUsuarios, sv => sv.suscriptor)
  suscripcionesVinculadasCursosArmados: SuscripcionVinculadaCursosArmados[];

  @OneToMany(() => SuscripcionVinculadaUsuarios, sv => sv.suscriptor)
  suscripcionesVinculadasCursos: SuscripcionVinculadaCursos[];
}
