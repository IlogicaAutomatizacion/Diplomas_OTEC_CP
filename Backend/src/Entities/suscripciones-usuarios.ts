import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Suscriptor } from './suscriptores.entity';
import { Usuario } from './usuarios.entity';

@Entity('suscripciones_usuarios')
export class SuscripcionVinculadaUsuarios {

  @PrimaryColumn({ name: 'suscriptor_id' })
  suscriptor_id: number;

  @PrimaryColumn({ name: 'usuario' })
  usuario_id: number;

  @ManyToOne(() => Suscriptor, s => s.suscripcionesVinculadasUsuarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'suscriptor_id' })
  suscriptor: Suscriptor;

  @ManyToOne(() => Usuario, u => u.suscripcionesVinculadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario', referencedColumnName: 'id' })
  usuario: Usuario;
}

