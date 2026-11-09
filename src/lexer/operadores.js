'use strict';
const { TIPOS } = require('./tiposToken');

const OPERADORES_COMPOSTOS = new Set([
  '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
  '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=',
  '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>',
]);
const OPERADORES_SIMPLES = '+-*/%=<>!&|^~?:.';
const PONTUACAO = '(){}[];,';

/** Reconhece operador/pontuação em i. Devolve { tipo, tamanho } ou null. */
function reconhecerSimbolo(fonte, i) {
  for (const tam of [4, 3, 2]) {
    if (OPERADORES_COMPOSTOS.has(fonte.slice(i, i + tam))) return { tipo: TIPOS.OPERADOR, tamanho: tam };
  }
  if (OPERADORES_SIMPLES.includes(fonte[i])) return { tipo: TIPOS.OPERADOR, tamanho: 1 };
  if (PONTUACAO.includes(fonte[i])) return { tipo: TIPOS.PONTUACAO, tamanho: 1 };
  return null;
}

module.exports = { reconhecerSimbolo };
