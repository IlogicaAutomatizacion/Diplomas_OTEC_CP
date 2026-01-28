import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Suscriptor } from './suscriptores.entity';
import { Usuario } from './usuarios.entity';
import { Empresa } from './empresas.entity';

@Entity('suscripciones_empresas')
export class SuscripcionVinculadaEmpresas {

  @PrimaryColumn({ name: 'suscriptor_id' })
  suscriptor_id: number;

  @PrimaryColumn({ name: 'empresa' })
  empresa_id: number;

  @ManyToOne(() => Suscriptor, s => s.suscripcionesVinculadaEmpresas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'suscriptor_id' })
  suscriptor: Suscriptor;

  @ManyToOne(() => Empresa, u => u.suscripcionesVinculadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa', referencedColumnName: 'id_empresa' })
  empresa: Empresa;
}

