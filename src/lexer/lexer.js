'use strict';
const { TIPOS } = require('./tiposToken');
const m = require('./medidores');
const { reconhecerSimbolo } = require('./operadores');
const { ErroBaianol } = require('../utils/erros');

/**
 * Análise léxica: transforma o fonte em tokens { tipo, valor, linha, coluna }.
 * Espaços e comentários também viram tokens, para preservar a formatação na transpilação.
 */
function tokenizar(fonte) {
  const tokens = [];
  let i = 0;
  let linha = 1;
  let coluna = 1;

  function consumir(tipo, tamanho) {
    tokens.push({ tipo, valor: fonte.slice(i, i + tamanho), linha, coluna });
    for (let k = 0; k < tamanho; k++) {
      if (fonte[i] === '\n') { linha++; coluna = 1; } else { coluna++; }
      i++;
    }
  }

  function exigir(tamanho, mensagem) {
    if (tamanho < 0) throw new ErroBaianol(mensagem, linha, coluna);
    return tamanho;
  }

  while (i < fonte.length) {
    const c = fonte[i];
    const prox = fonte[i + 1];

    if (/\s/.test(c)) consumir(TIPOS.ESPACO, m.medirEspaco(fonte, i));
    else if (c === '/' && prox === '/') consumir(TIPOS.COMENTARIO, m.medirComentarioLinha(fonte, i));
    else if (c === '/' && prox === '*') {
      consumir(TIPOS.COMENTARIO, exigir(m.medirComentarioBloco(fonte, i), 'Comentário /* ... */ ficou aberto, rei!'));
    } else if (c === '"' || c === "'") {
      consumir(TIPOS.TEXTO, exigir(m.medirTexto(fonte, i), 'Texto sem fechar aspas, meu pai!'));
    } else if (c === '`') {
      consumir(TIPOS.TEMPLATE, exigir(m.medirTemplate(fonte, i), 'Template com crase sem fechar, viu?'));
    } else if (m.iniciaNumero(fonte, i)) {
      consumir(TIPOS.NUMERO, exigir(m.medirNumero(fonte, i), 'Número mal formado'));
    } else if (m.iniciaPalavra(c)) {
      consumir(TIPOS.PALAVRA, m.medirPalavra(fonte, i));
    } else {
      const simbolo = reconhecerSimbolo(fonte, i);
      if (!simbolo) throw new ErroBaianol(`Caractere "${c}" não existe no baianol#`, linha, coluna);
      consumir(simbolo.tipo, simbolo.tamanho);
    }
  }
  return tokens;
}

module.exports = { tokenizar };
