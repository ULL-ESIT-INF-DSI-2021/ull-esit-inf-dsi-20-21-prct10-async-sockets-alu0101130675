import * as net from 'net';
import { ResponseType } from './tipos';
import * as chalk from 'chalk';
import { nota } from './nota';
import { Manejador } from './manejador';
import { MessageEventEmitterServer } from './serverEventEmitter';
/**
 * creamos el server
 */
const server = net.createServer((connection) => {
  console.log(chalk.green('\nClient connected'));
  const socket = new MessageEventEmitterServer(connection);
  /**
   * recibimos la peticion
   */
  socket.on('request', (message) => {
    const request = message;
    console.log(chalk.green('la peticion ha sido recibida'));
    /**
     * tipo estandar de respuesta
     */
    const response: ResponseType = {
      type: 'add',
      success: true,
    };
    let manejador = new Manejador(new nota("titulo", "cuerpo", "color"));
    switch (request.type) {
      case 'add':
        manejador = new Manejador(
            new nota(request.title, request.body, request.color));
        if (manejador.addNote(request.user) === false) {
          response.success = false;
          response.error = "la nota ya existe";
        }
        break;
      case 'read':
        response.type = 'read';
        manejador = new Manejador(new nota(request.title, "cuerpo", "color"));
        const read = manejador.readNote(request.user);
        if (typeof read === "boolean") {
          response.success = false;
          response.error = "la ruta pasada no existe, compruébela";
        } else {
          console.log(read);
          response.notes = [read];
        };
        break;
      case 'remove':
        response.type = 'remove';
        manejador = new Manejador(new nota(request.title, "cuerpo", "color"));
        if (manejador.removeNote(request.user) === false) {
          response.success = false;
          response.error = "la ruta que has pasado no existe o no se puede borrar";
        }
      case 'update':
        manejador = new Manejador(
            new nota(request.title, request.body, request.color));
        response.type = 'update';
        if (manejador.updateNote(request.user) === false) {
          response.success = false;
          response.error = "compruebe la ruta";
        }
        break;
        break;
      case 'list':
        response.type = 'list';
        const notas = manejador.listnota(request.user);
        if (notas.length === 0) {
          response.success = false;
          response.error = "la ruta que has pasado no existe";
        } else {
          response.notes = notas;
        }
        break;
    }
    /**
     * mandamos respuesta al cliente
     */
    connection.write(JSON.stringify(response) + '\n', (err: any) => {
      if (err) {
        console.log(chalk.red('\nError: The response could not be sent'));
      } else {
        console.log(chalk.green('\nThe response has been sent successfully'));
        connection.end();
      }
    });
  });
  /**
   * comprobamos si el cliente se desconecta
   */
  connection.on('close', () => {
    console.log(chalk.green('\nA client has disconnected'));
  });
});
/**
 * miramos a ver si se conectan mas clientes
 */
server.listen(60300, () => {
  console.log(chalk.green('Waiting for clients to connect...'));
});
