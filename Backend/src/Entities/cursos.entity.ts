import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CursoArmado } from './cursos-armados.entity';
import { SuscripcionVinculadaCursos } from './suscripciones-cursos';

@Entity('cursos')
export class Curso {

  @PrimaryGeneratedColumn({ name: 'curso_id' })
  curso_id: number;

  @Column()
  nombre: string;

  @Column()
  duracion: number;

  @Column()
  resumen: string;

  @Column()
  temario: string;

  @OneToMany(() => CursoArmado, ca => ca.curso)
  cursosArmados: CursoArmado[];

  @OneToMany(() => SuscripcionVinculadaCursos, sv => sv.curso)
  suscripcionesVinculadas: SuscripcionVinculadaCursos[];
}