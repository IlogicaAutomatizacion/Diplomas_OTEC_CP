import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RolVinculado } from './roles-vinculados.entity';

@Entity('roles')
export class Rol {

  @PrimaryGeneratedColumn({ name: 'rol_id' })
  rolId: number;

  @Column({ unique: true })
  rol: string;

  @OneToMany(() => RolVinculado, rv => rv.rol)
  rolesVinculados: RolVinculado[];
}
