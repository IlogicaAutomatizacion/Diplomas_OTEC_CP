import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Empresa } from './empresas.entity';
import { Usuario } from './usuarios.entity';

@Entity('empresas_vinculadas')
export class EmpresaVinculada {

  @PrimaryColumn({ name: 'empresa', type: 'text' })
  empresaRut: string;

  @PrimaryColumn({ name: 'usuario', type: 'text' })
  usuarioRut: string;

  @ManyToOne(() => Empresa, e => e.empresasVinculadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa', referencedColumnName: 'rut' })
  empresa: Empresa;

  @ManyToOne(() => Usuario, u => u.empresasVinculadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario', referencedColumnName: 'rut' })
  usuario: Usuario;
}

