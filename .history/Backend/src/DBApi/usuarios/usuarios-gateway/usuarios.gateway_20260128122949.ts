import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Usuario } from 'src/Entities/usuarios.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class UsuariosGateway {
  @WebSocketServer()
  server: Server

  usuariosActualizados(usuarios?: Usuario[]) {
    this.server.emit('usuariosActualizados')
  }

  usuarioCreado(usuario: Usuario) {
    this.server.emit('usuarioCreado', usuario)
  }

  usuarioActualizado(usuario: Usuario) {
    this.server.emit('usuarioActualizado', usuario)
  }
}
