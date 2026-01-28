
@Module({
  imports: [

    TypeOrmModule.forRoot({
      url: 'postgresql://neondb_owner:npg_3MohIlUH7SYV@ep-late-snow-acftyarf-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      synchronize: true,
      type: 'postgres',
      autoLoadEntities: true
    }),
    DatabaseModule,
    UsuarioModule,
    CursoArmadoModule,
    CursosModule,
    InscripcionesModule,
    SuscriptoresModule,
    SuscripcionVinculadaCursos,
    SuscripcionVinculadaCursosArmados,
    SuscripcionVinculadaEmpresas,
    SuscripcionVinculadaUsuarios,
    EmpresasModule
  ],
})
export class AppModule { }