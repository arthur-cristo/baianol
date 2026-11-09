'use strict';
// O parser não monta árvore: ele "marca" tokens para o gerador completar o JavaScript
// (parênteses de condições, ";" de fim de comando, cabeçalho do for etc.).

/** Troca o JavaScript gerado para este token. */
function definirJs(token, js) { token.js = js; }

/** Acrescenta texto logo depois deste token na saída. */
function anexar(token, texto) { token.depois = (token.depois || '') + texto; }

module.exports = { definirJs, anexar };
