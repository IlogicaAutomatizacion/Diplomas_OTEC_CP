import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Rol } from './roles.entity';
import { Usuario } from './usuarios.entity';

@Entity('roles_vinculados')
export class RolVinculado {

  @PrimaryColumn({ name: 'rol_id' })
  rolId: number;

  @PrimaryColumn({ name: 'usuario', type: 'text' })
  usuarioRut: string;

  @ManyToOne(() => Rol, r => r.rolesVinculados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Usuario, u => u.rolesVinculados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario', referencedColumnName: 'rut' })
  usuario: Usuario;
}

