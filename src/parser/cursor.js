'use strict';
const { erroNoToken } = require('../utils/erros');

/** Percorre os tokens significativos e gera os erros "esperava X, encontrei Y". */
class Cursor {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  get atual() { return this.tokens[this.pos]; }
  get anterior() { return this.tokens[this.pos - 1]; }
  olhar(n = 0) { return this.tokens[this.pos + n]; }
  acabou() { return this.pos >= this.tokens.length; }
  avancar() { return this.tokens[this.pos++]; }

  /** O token na posição (atual + n) é exatamente este lexema/símbolo? */
  ehLexema(valor, n = 0) {
    const t = this.olhar(n);
    return !!t && t.valor === valor && (t.tipo !== 'PALAVRA' || t.contexto === 'normal');
  }

  aceitar(valor) { return this.ehLexema(valor) ? this.avancar() : null; }

  exigir(valor, quando = '') {
    return this.aceitar(valor) || this.erroEsperava(`"${valor}"${quando ? ` ${quando}` : ''}`);
  }

  erroEsperava(descricao) {
    const ref = this.acabou() ? this.tokens[this.tokens.length - 1] : this.atual;
    const achou = this.acabou() ? 'o fim do programa' : `"${ref.valor}"`;
    throw erroNoToken(`Esperava ${descricao}, mas encontrei ${achou}`, ref);
  }
}

module.exports = { Cursor };
