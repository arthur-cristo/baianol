'use strict';
// Cada medidor devolve o tamanho (em caracteres) do lexema que começa na posição i, ou -1 se for inválido.

const RE_NUMERO = /(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/y;
const RE_INICIO_PALAVRA = /[\p{L}_$]/u;
const RE_PARTE_PALAVRA = /[\p{L}\p{N}_$]/u;

function medirEspaco(fonte, i) {
  let j = i;
  while (j < fonte.length && /\s/.test(fonte[j])) j++;
  return j - i;
}

function medirComentarioLinha(fonte, i) {
  const fim = fonte.indexOf('\n', i);
  return (fim === -1 ? fonte.length : fim) - i;
}

function medirComentarioBloco(fonte, i) {
  const fim = fonte.indexOf('*/', i + 2);
  return fim === -1 ? -1 : fim + 2 - i;
}

function medirTexto(fonte, i) {
  const aspas = fonte[i];
  let j = i + 1;
  while (j < fonte.length) {
    if (fonte[j] === '\\') j += 2;
    else if (fonte[j] === aspas) return j + 1 - i;
    else if (fonte[j] === '\n') return -1;
    else j++;
  }
  return -1;
}

function medirTemplate(fonte, i) {
  let j = i + 1;
  let profundidade = 0;
  while (j < fonte.length) {
    const c = fonte[j];
    if (c === '\\') j += 2;
    else if (c === '$' && fonte[j + 1] === '{') { profundidade++; j += 2; }
    else if (c === '}' && profundidade > 0) { profundidade--; j++; }
    else if (c === '`' && profundidade === 0) return j + 1 - i;
    else j++;
  }
  return -1;
}

function medirNumero(fonte, i) {
  RE_NUMERO.lastIndex = i;
  const m = RE_NUMERO.exec(fonte);
  return m ? m[0].length : -1;
}

function iniciaNumero(fonte, i) {
  return /[0-9]/.test(fonte[i]) || (fonte[i] === '.' && /[0-9]/.test(fonte[i + 1] || ''));
}

function iniciaPalavra(c) { return RE_INICIO_PALAVRA.test(c); }

function medirPalavra(fonte, i) {
  let j = i + 1;
  while (j < fonte.length && RE_PARTE_PALAVRA.test(fonte[j])) j++;
  return j - i;
}

module.exports = {
  medirEspaco, medirComentarioLinha, medirComentarioBloco, medirTexto, medirTemplate,
  medirNumero, iniciaNumero, iniciaPalavra, medirPalavra,
};
