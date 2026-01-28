import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Suscriptor } from './suscriptores.entity';
import { Usuario } from './usuarios.entity';
import { CursoArmado } from './cursos-armados.entity';

@Entity('suscripciones_cursos_armados')
export class SuscripcionVinculadaCursosArmados {

  @PrimaryColumn({ name: 'suscriptor_id' })
  suscriptor_id: number;

  @PrimaryColumn({ name: 'curso_armado' })
  curso_armado_id: number;

  @ManyToOne(() => Suscriptor, s => s.suscripcionesVinculadasCursosArmados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'suscriptor_id' })
  suscriptor: Suscriptor;

  @ManyToOne(() => CursoArmado, u => u.suscripcionesVinculadas)
  @JoinColumn({ name: 'curso_armado', referencedColumnName: 'curso_armado_id' })
  curso_armado: CursoArmado;
}

