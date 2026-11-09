'use strict';
const { Cursor } = require('./cursor');
const { instalarExpressoes } = require('./expressoes');
const { instalarComandos } = require('./comandos');

/** Análise sintática (descida recursiva) do corpo do programa. Lança ErroBaianol no primeiro erro. */
function analisar(tokens) {
  const P = { c: new Cursor(tokens), estado: { laco: 0, funcao: 0, agrupado: false } };
  instalarExpressoes(P);
  instalarComandos(P);
  P.programa();
}

module.exports = { analisar };
