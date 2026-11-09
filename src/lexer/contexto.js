'use strict';
const { TIPOS } = require('./tiposToken');

const ehInutil = (t) => t.tipo === TIPOS.ESPACO || t.tipo === TIPOS.COMENTARIO;

function significativos(tokens) {
  return tokens.filter((t) => !ehInutil(t));
}

/**
 * Anota cada token significativo com:
 *  - quebraAntes: tem quebra de linha entre ele e o token anterior (é assim que um comando termina);
 * e cada PALAVRA com um contexto:
 *  - 'propriedade': vem depois de "." ou "?."  (obj.massa  -> não é palavra reservada)
 *  - 'chave': chave de objeto  ({ massa: 1 })
 *  - 'normal': pode ser lexema da linguagem
 */
function anotarContexto(tokens) {
  let quebra = true;
  for (const t of tokens) {
    if (ehInutil(t)) { if (t.valor.includes('\n')) quebra = true; continue; }
    t.quebraAntes = quebra;
    quebra = false;
  }
  const sig = significativos(tokens);
  sig.forEach((t, i) => {
    if (t.tipo !== TIPOS.PALAVRA) return;
    const ant = sig[i - 1];
    const prox = sig[i + 1];
    if (ant && ant.tipo === TIPOS.OPERADOR && (ant.valor === '.' || ant.valor === '?.')) t.contexto = 'propriedade';
    else if (prox && prox.valor === ':' && ant && (ant.valor === '{' || ant.valor === ',')) t.contexto = 'chave';
    else t.contexto = 'normal';
  });
  return tokens;
}

module.exports = { significativos, anotarContexto };
