import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Usuario } from './usuarios.entity';
import { CursoArmado } from './cursos-armados.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('inscripciones')
export class Inscripcion {

  @PrimaryGeneratedColumn({ name: 'id_inscripcion' })
  id_inscripcion: number;

  @Column({ name: 'asistencias', default: 0 })
  asistencias: number;

  @Column({ name: 'calificacion', type: 'decimal', default: 0 })
  calificacion: number;

  @Column({ name: 'notificar', type: 'boolean', default: true })
  notificar: boolean

  @Column({ name: 'asistencia_marcada', type: 'boolean', default: false })
  asistencia_marcada: boolean

  @IsNotEmpty()
  @ManyToOne(() => Usuario, u => u.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario', referencedColumnName: 'id' })
  usuario: Usuario;

  @IsNotEmpty()
  @ManyToOne(() => CursoArmado, ca => ca.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_armado_id', referencedColumnName: 'curso_armado_id' })
  cursoArmado: CursoArmado;
}
