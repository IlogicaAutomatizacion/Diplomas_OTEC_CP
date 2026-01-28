import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
} from 'typeorm';
import { Curso } from './cursos.entity';
import { Usuario } from './usuarios.entity';
import { Inscripcion } from './inscripciones.entity';
import { Empresa } from './empresas.entity';
import { SuscripcionVinculadaCursosArmados } from './suscripciones-cursos_armados';

@Check("estado IN ('ACTIVO', 'INACTIVO', 'FINALIZADO')")
@Check(`fecha_finalizacion IS NULL OR fecha_inicio IS NULL OR fecha_finalizacion >= fecha_inicio`)

@Entity('cursos_armados')
export class CursoArmado {

  @PrimaryGeneratedColumn({ name: 'curso_armado_id' })
  curso_armado_id: number;

  @ManyToOne(() => Curso, c => c.cursosArmados, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'curso', referencedColumnName: 'curso_id' })
  curso: Curso;

  @ManyToOne(() => Usuario, u => u.cursosArmados, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profesor', referencedColumnName: 'id' })
  profesor: Usuario;

  @ManyToOne(() => Empresa, u => u.cursosArmados, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresa', referencedColumnName: 'id_empresa' })
  empresa: Empresa;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ name: 'fecha_finalizacion', type: 'date', nullable: true })
  fecha_finalizacion: Date;

  @Column({
    type: 'text',
    default: 'INACTIVO'
  })

  estado: EstadoCursoArmado;

  @Column({
    type: 'boolean',
    default: false
  })

  en_clase: boolean;

  @Column({ name: 'calificacion_aprobatoria', type: 'decimal', nullable: true, default: 100 })
  calificacion_aprobatoria: number

  @Column({ name: 'token_curso', type: 'uuid', default: () => 'gen_random_uuid()' })
  token_curso: string

  @OneToMany(() => Inscripcion, i => i.cursoArmado)
  inscripciones: Inscripcion[];

  @OneToMany(() => SuscripcionVinculadaCursosArmados, sv => sv.curso_armado)
  suscripcionesVinculadas: SuscripcionVinculadaCursosArmados[];
}

