import {EventEmitter} from 'events';
/**
 * clase para controlar que el mensaje se envia completo
 */
export class MessageEventEmitterClient extends EventEmitter {
  /**
   * 
   * @param connection evento
   */
  constructor(connection: EventEmitter) {
    super();
    let data = '';
    connection.on('data', (dataChunk) => {
      data += dataChunk;

      let messageLimit = data.indexOf('\n');
      while (messageLimit !== -1) {
        const message = data.substring(0, messageLimit);
        data = data.substring(messageLimit + 1);
        this.emit('message', JSON.parse(message));
        messageLimit = data.indexOf('\n');
      }
    });
  }
}
