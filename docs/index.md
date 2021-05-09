# Práctica 10 - Cliente y servidor para una aplicación de procesamiento de notas de text
## Introducción
En esta práctica se implementeta la aplicación de procesamiento de notas de texto de la Práctica 8 cliente haciendo uso de los sockets.[explicacion](https://ull-esit-inf-dsi-2021.github.io/prct10-async-sockets/).
### class MessageEventEmitterClient
~~~
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
~~~
Esta clase se ha cogido de los apuntes de clase. Sirve para asegurarnos de que los mensajes se pasen enteros, Para comprobar esto tenemos que encontrarnos un \n que indica el final del mensaje. Tenemos otra clase parecida para el servidor que se encarda de lo mismo. Esta clase se muestra a continuación.
### class MessageEventEmitterServer
~~~
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
~~~
### Clase nota
~~~
export class nota {
  /**
   *
   * @param titulo titulo de la nota
   * @param cuerpo cuerpo de la nota
   * @param color color con el que se imprimira la nota
   */
  constructor(private titulo:string,
     public cuerpo:string, private color:string ) {
  }
  /**
    * getter del titulo
    * @returns titulo
    */
  getTitulo() {
    return this.titulo;
  }
  /**
   * getter del cuerpo
   * @returns el contenido del cuerpo
   */
  getCuerpo() {
    return this.cuerpo;
  }
  /**
   * getter del color de la nota
   * @returns el color con el que se imprimira la nota
   */
  getcolor() {
    return this.color;
  }
  /**
   * setter para modificar el cuerpo de la nota
   * @param modificacion cuerpo modificado de la nota
   */
  setCuerpo(modificacion:string) {
    this.cuerpo=modificacion;
  }
}

~~~
Clase nota  reutilizada de la práctica 8.Contiene las caracteristicas principales de una nota que son:titulo,cuerpo y color.
El resto de la clase se compone de getters de los atributos y un setter para el cuerpo por si quiere cambiar el mensaje.
### Tipos
~~~
import {nota} from './nota';
export type RequestType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  user: string;
  title?: string;
  body?: string;
  color?: string;
}
export type ResponseType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  success: boolean;
  notes?: nota[];
  error?: string;
}

~~~
Para los tipos utilizamos los sugeridos por la práctica, la única diferencia es que el tipo de color es string y que hemos añadido **error** en la respuesta por si hay un error saber que puede haber fallado.
### Cliente
~~~
import * as net from 'net';
import {RequestType} from './tipos';
import * as yargs from 'yargs';
const chalk = require('chalk');
import {MessageEventEmitterClient} from './clienteEventEmitter';
const comando = process.argv[2];
/**
 * comprueba si el comando introducido es valido
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
      describe: 'User\'s name',
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

~~~
Lo primero que hacemos es comprobar si se utilizan los comandos adecuados. Despúes realizamos una conección con el server y tenemos un objeto de la clase explicada anteriormente llamado socket para asegurarnos de que la respuesta nos llegue entera.
Después declaramos request del tipo visto anterioremente: RequestType en el que ponemos add por defecto ya que tiene que tener algun comando en type.
Las siguientes lineas son todos los comandos visto en anteriores pŕacticas. En el comando que se entre se rellenará la request con los datos que le pasamos al comando. Si es el comando add o  update comprobamos si el color introducido es valido, en caso de que no termian el programa.
Despúes de crear la petición con los comandos se la enviamos al server con write. Lo siguiente que nos encontramos es la respuesta enviada por el servidor que la cogemos utilizando el objeto socket, si emite message quiere decir que ha mandado una respuesta completa y comprobamos lo que tiene detro de esta.
Si tiene succes=false quiere decir que algo fallo e imprimimos por pantalla el error. En caso contratrio mediante un switch comprobamos de que tipo era la acción que realizamos e imprimimos dependiendo del tipo los datos que son necesarios.
Al final de todo tenemos para compronar si hay un fallo en la conexión con el servidor.
### Server
~~~
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
~~~
Lo primero que hacemos es crear el server y el objeto socket para el mismo cometido que en el cliente.Una vez recibimos la petición, es decir que se emitió un evento request creamos la variable que almacenará la respuesta que es response de tipo ResponseType, en la que inicializamos con unos valores por defecto. Después creamos manejador con una nota por defecto que es el que se encarga de gestionar todas las acciones de los comandos con una nota por defecto.
A continuación con un switch miramos el tipo de la petición pasado y actuamos en consecuencia.
1. add
el manejador se iguala con la nota que quieres añadir y llamamos al método **addNote** con el usuario de la nota.
Si retorna false quiere decir que no se pudo crear y ponermos succes a false y un mensaje de el posible error en error
2. read
Ponemos el tipo de respuesta a read, igualamos un manejador con el titulo de la nota que queremos buscar, los otros valores de la nota no los usaremos por lo que estan por defecto.
Llamamos a el metodo reaaNote y lo guardamos en una variable. Si esa variable es un boolean quiere decir que fallo la lectura y ponemos como en los anteriores un mensaje para el error y ssucces a false
en otro, le método devuelve la nota que queriamo leer y la añadimos al campo notes de la respuesta.
3. remove
Es muy parecida a las anteriores, comprobamos si es exitoso o no la acción de borrar con el método **removeNote**.
4. update
Es igual que para el tipo add pero cambiando el método al que llamamos, que en este caso es **updateNote**
5. list'
En este caso utilizamos el manejador por defecto ya que no depende los valores de la nota para el método que utilizaremos. 
Si el vector de notas que es lo que devuelve la lista de notas es 0 quiere decir que no se encontro ninguna nota en la dirección, en otro caso las notas las guardamos en el campo notes de la respuesta.
Una vez que el switch se ejecuta tenemos una respuesta formada por lo que la mandamos con con write al cliente.
Las siguientes lineas quiere decir que si se emite un evento close significa que un cliente si ha desconectado y lo que va despues de esto es para que el server se mantenga escuchando mas peticiones.
### class Manejador

~~~
import * as fs from 'fs';
import {nota} from './nota';
/**
 * clase para hacer las diferentes acciones de los comandos
 */
export class Manejador {
  /**
   * 
   * @param note nota sobre la que se ejecuta la accion
   */
  constructor(private readonly note: nota) { }
/**
 * metodo para añadir una nota
 * @param usuario usuario de la nota
 * @returns true en caso de tener exito, false en otro caso
 */
  addNote(usuario: string): boolean {
    const contenido = `{ 
      "title": "${this.note.getTitulo()}", "body": "${this.note.getCuerpo()}" ,
       "color": "${this.note.getcolor()}" }`;
    const nombreNota = this.note.getTitulo().replace(" ", "");
    if (!fs.existsSync(`./notas/${usuario}`)) {
      fs.mkdirSync(`./notas/${usuario}`, {recursive: true});
    }
    if (!fs.existsSync(`./notas/${usuario}/${nombreNota}.json`)) {
      fs.writeFileSync(`./notas/${usuario}/${nombreNota}.json`, contenido);
      return true;
    } else {
      return false;
    }
  }
  /**
   * metodo para actualizar una nota
   * @param usuario usuario propietario de la nota
   * @returns true si se pudo realizar, false en otro caso
   */
  updateNote(usuario: string): boolean {
    const contenido = `{ 
      "title": "${this.note.getTitulo()}", "body": "${this.note.getCuerpo()}" 
      , "color": "${this.note.getcolor()}" }`;
    const nombreNota = this.note.getTitulo().replace(" ", "");
    if (fs.existsSync(`./notas/${usuario}/${nombreNota}.json`)) {
      fs.writeFileSync(`./notas/${usuario}/${nombreNota}.json`, contenido);
      return true;
    } else {
      return false;
    }
  }
  /**
   * metodo para leer una nota
   * @param usuario usuario propietario de la nota
   * @returns deuelve la nota si se pudo leer y un false en otro caso
   */
  readNote(usuario: string): boolean | nota {
    const nombreNota = this.note.getTitulo().replace(" ", "");
    if (fs.existsSync(`./notas/${usuario}/${nombreNota}.json`) === true) {
      const data = fs.readFileSync(`./notas/${usuario}/${nombreNota}.json`);
      const dataJSON = JSON.parse(data.toString());
      return new nota(dataJSON.title, dataJSON.body, dataJSON.color);
    } else {
      return false;
    }
  }
/**
 * metodo para listar las notas de un usuario
 * @param usuario usuario propietario de la nota
 * @returns notas del usuario
 */
  listnota(usuario: string): nota[] {
    if (fs.existsSync(`./notas/${usuario}`) === true) {
      const arraynota: nota[] = [];
      // Recorremos todos los titulos de las notas y guardamos el contenido
      // de ellas en data
      fs.readdirSync(`./notas/${usuario}/`).forEach((note) => {
        const data = fs.readFileSync(`./notas/${usuario}/${note}`);
        const dataJSON = JSON.parse(data.toString());
        console.log(dataJSON);
        arraynota.push(new nota(dataJSON.title, dataJSON.body, dataJSON.color));
      });
      return arraynota;
    } else {
      return [];
    }
  }
  /**
   * metodo para eliminar las notas de un usario
   * @param usuario usuario propietario de la nota
   * @returns true en caso de tener exito, false en otro caso
   */
  removeNote(usuario: string): boolean {
    const nombreNota = this.note.getTitulo().replace(" ", "");
    if (fs.existsSync(`./notas/${usuario}/${nombreNota}.json`) === true) {
      fs.rmSync(`./notas/${usuario}/${nombreNota}.json`);
      return true;
    } else {
      return false;
    }
  }
}
~~~
Esta clase es para realizar la accion de cada comando por lo que hay un metodo por cada comando. La clase se crear con la nota que es la mayoría de los métodos es la que contendrá los datos con los que se trabajará.
1. el método addNote 
Se utiliza para añadir una nota. Este método recibe como páramtero el usuario que es propietario de la nota. Lo primero que hacemos es poner el contenido de esa nota en formato JSON. Lo segundo es obtener el nombre con el que se va a guardar, le quitamos los espacios en caso de que los tenga.
La siguientes lineas sirven para comprobar:
 - Si la carpeta del usuario no existe se le crea una 
 - Si no existe una nota con ese titulo se crea una con el contenido en formato JSON
 En caso de que se cree retorna true en otro caso false.
 2. El método update
 Se utiliza para actualizar una nota. Las primeras lineas son iguales que en el método explicado anteriormente, lo único que cambia es, si la nota existe utilizamos el método write que sobreescribe el contenido de la nota y retorna true.En otro caso retorna false
 3. método readNote
 método para leer una nota
 Si existe leemos el contenido y lo guardamos en una nota axiliar que retornamos. En caso contrario devolvemos un false
 4. método listnota
    Método que sirve para listar las notas de un usuario.
    Si el usuario existe creamos un array de notas.
    Leemos el directorio y obtenemos los nombres de las notas que recorremos con un foreach y vamos leyendo como en el método read una por una el contenido y almacenándolas en el array de notas para al final devolverlas.
    Si no existe el usuairo retornamos un array vacío.
5. Método removeNote
   Método para eliminar las notas de un usario.
   Si al ruta de la nota existe se elimna y retornamos true, en otro caso retornamos false.

## Diseño
Para el diseño ha estado influenciado en gran parte por el código que he cogido de los apuntes, de la explicación de la práctica y de la práctica 8. Siguiendo la estrucuras de respuesta, petición en un fichero que es el cliente cree todo lo relacionado con introducir los comandos correctos y recibir la respuesta del servidor e interpretarla. En el lado del servidor mirando el tipo de petición se hacia una estructura muy parecida a la de los comandos pero con unn switch y llamando a un manejador muy parecido al de la práctica 8 solo que para está prática había que rellenar el mensaje de respuesta y controlé los errores con boolenaos.

## Conclusión
Con lso apuntes de la práctica y entendiendo bien lo que son los eventos y los distinos métodos de manejo de fichero de las anteriores se me hizo más sencilla que otras que he realizado. Una de las razones puede ser que reutilizé algo de código y había codigo que seleccione directamente de los apuntes. Me ha resultado bastante más facil entender y manejar los sockets en este lenguaje con otros por lo que estoy contento de haberlo entenido a la primera.


