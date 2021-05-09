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

