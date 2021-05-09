import * as net from 'net';
import {RequestType} from './tipos';
import * as yargs from 'yargs';
const chalk = require('chalk');
import {MessageEventEmitterClient} from './clienteEventEmitter';
const comando = process.argv[2];
/**
 * comproueba si el comando introducido es valido
 */
if (comando != "add" && comando != "update" && comando != "read" &&
  comando != "remove" && comando != "list") {
  console.log('Comando no valido');
  process.exit(-1);
}
/**
 * conectamos al server
 */
const cliente = net.connect({port: 60300});
const socket = new MessageEventEmitterClient(cliente);
/**
 * estrucuta de peticion por defecto
 */
let request: RequestType = {
  type: 'add',
  user: "",
  title: "",
  body: "",
  color: "",
};
/**
 * comando para añadir nota
 */
yargs.command({
  command: 'add',
  describe: 'Add a new note',
  builder: {
    user: {
      describe: 'Uses name',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Note title to add',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Note Body to add',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Note Color to add',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    /**
     * si el color no es uno de los disponibles muestra fallo
     */
    if (argv.color != "red" && argv.color != "green" && argv.color != "blue" &&
      argv.color != "yellow") {
      console.log(chalk.red('color no disponible'));
      process.exit(-1);
    }
    if (typeof argv.title === 'string' && typeof argv.body === 'string' &&
      typeof argv.color === 'string' && typeof argv.user === 'string') {
      request = {
        type: 'add',
        user: argv.user,
        title: argv.title,
        body: argv.body,
        color: argv.color,
      };
    }
  },
});
/**
 * comando para actualizar una nota
 */
yargs.command({
  command: 'update',
  describe: 'update a note',
  builder: {
    user: {
      describe: 'User\'s name',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Note title to update',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Note Body to update',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Note Color to update.ue and yellow',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    /**
 * si el color no es uno de los disponibles muestra fallo
 */
    if (argv.color != "red" && argv.color != "green" && argv.color != "blue" &&
      argv.color != "yellow") {
      console.log(chalk.red('color no disponible'));
      process.exit(-1);
    }
    if (typeof argv.title === 'string' && typeof argv.user === 'string' &&
      typeof argv.body === 'string' && typeof argv.color === 'string') {
      request = {
        type: 'update',
        user: argv.user,
        title: argv.title,
        body: argv.body,
        color: argv.color,
      };
    }
  },
});
/**
 * comanod para eliminar una nota
 */

yargs.command({
  command: 'remove',
  describe: 'Remove a note',
  builder: {
    user: {
      describe: 'User name',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Note title to remove',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string') {
      request = {
        type: 'remove',
        user: argv.user,
        title: argv.title,
      };
    }
  },
});
/**
 * comando para listar las notas
 */
yargs.command({
  command: 'list',
  describe: 'List all the notes',
  builder: {
    user: {
      describe: 'User\'s name',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string') {
      request = {
        type: 'list',
        user: argv.user,
      };
    }
  },
});
/**
 * comando para leer las notas
 */
yargs.command({
  command: 'read',
  describe: 'Read a note',
  builder: {
    user: {
      describe: 'User\'s name',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Note title to read',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.title === 'string' && typeof argv.user === 'string') {
      request = {
        type: 'read',
        user: argv.user,
        title: argv.title,
      };
    }
  },
});
yargs.parse();
/**
 * mandamos la peticion al server
 */
cliente.write(JSON.stringify(request) + '\n', (err) => {
  if (err) console.log(chalk.red('fallo con el servidor\n'));
  else console.log(chalk.green('se ha enviado la peticion\n'));
});
/**
 * recibimos lo que pediamos
 */
socket.on('message', (request) => {
  if (request.success === false) {
    console.log(chalk.red(request.error));
  } else {
    switch (request.type) {
      case 'add':
        console.log(chalk.green(`New note added!`));
        break;
      case 'update':
        console.log(chalk.green(`Modified note! \nNote`));
        break;
      case 'remove':
        console.log(chalk.green('Note removed!'));
        break;
      case 'list':
        console.log(chalk.green('Your notes:'));
        request.notes.forEach((note: any) => {
          console.log(chalk.keyword(note.color)(note.titulo));
        });
        break;
      case 'read':
        console.log(
            chalk.keyword(request.notes[0].color)(request.notes[0].titulo));
        console.log(
            chalk.keyword(request.notes[0].color)(request.notes[0].cuerpo));
        break;
    }
  }
});
/**
 * controla los errores de conexion
 */
cliente.on('error', (err) => {
  console.log(
      chalk.red(`Error: Connection could not be established: ${err.message}`));
});
