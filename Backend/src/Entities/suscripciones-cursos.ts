import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn
} from 'typeorm';
import { Suscriptor } from './suscriptores.entity';
import { Usuario } from './usuarios.entity';
import { Curso } from './cursos.entity';

@Entity('suscripciones_cursos')
export class SuscripcionVinculadaCursos {

  @PrimaryColumn({ name: 'suscriptor_id' })
  suscriptor_id: number;

  @PrimaryColumn({ name: 'curso' })
  curso_id: number;

  @ManyToOne(() => Suscriptor, s => s.suscripcionesVinculadasCursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'suscriptor_id' })
  suscriptor: Suscriptor;

  @ManyToOne(() => Curso, u => u.suscripcionesVinculadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso', referencedColumnName: 'curso_id' })
  curso: Curso;
}

