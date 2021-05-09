import {EventEmitter} from 'events';
/**
 * clase para asegurarnos que el mensaje se envia completo
 */
export class MessageEventEmitterServer extends EventEmitter {
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
        this.emit('request', JSON.parse(message));
        messageLimit = data.indexOf('\n');
      }
    });
  }
}
