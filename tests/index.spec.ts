import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitterClient} from '../src/clienteEventEmitter';

describe('MessageEventEmitterClient', () => {
  it('Should emit a message event once it gets a complete message', (done) => {
    const socket = new EventEmitter();
    const client = new MessageEventEmitterClient(socket);
    client.on('message', (message) => {
      expect(message).to.be.eql({'type': 'change', 'prev': 13, 'curr': 26});
      done();
    });
    socket.emit('data', '{"type": "change", "prev": 13');
    socket.emit('data', ', "curr": 26}');
    socket.emit('data', '\n');
  });
});
