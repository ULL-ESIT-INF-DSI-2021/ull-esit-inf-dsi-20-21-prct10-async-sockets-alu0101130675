import 'mocha';
import {expect} from 'chai';
import {nota} from "../src/nota";

describe('nota function test', () => {
  const nota1: nota = new nota(
      "primera nota", "Esta es mi primera nota", "yellow");
  it('Creación de objeto nota ', () => {
    expect(new nota("primera nota",
        "Esta es mi primera nota", "yellow")).not.to.be.equal(null);
  });
  it('Comprobación de getCuerpo()', () => {
    expect(nota1.getCuerpo()).to.be.equal('Esta es mi primera nota');
  });
  it('Comprobación de getTitulo()', () => {
    expect(nota1.getTitulo()).to.be.equal('primera nota');
  });
  it('Comprobación de getcolor()', () => {
    expect(nota1.getcolor()).to.be.equal('yellow');
  });
  it('Comprobación de setCuerpo()', () => {
    nota1.setCuerpo("nuevo cuerpo");
    expect(nota1.getCuerpo()).to.be.equal('nuevo cuerpo');
  });
});
