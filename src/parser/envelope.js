'use strict';
const { ENVELOPE } = require('../dialect/lexemas');
const { erroNoToken } = require('../utils/erros');

/** Confere "colé ... tá_ligado" e devolve o conjunto de tokens do envelope (descartados na geração). */
function localizarEnvelope(sig) {
  const { abertura, fechamento } = ENVELOPE;
  if (sig.length === 0 || sig[0].valor !== abertura.palavra) {
    throw erroNoToken(`Todo programa baianol# começa com "${abertura.palavra}" (E aí, tudo bom?)`, sig[0]);
  }
  const ultimo = sig[sig.length - 1];
  if (sig.length < 2 || ultimo.valor !== fechamento.palavra) {
    throw erroNoToken(`Todo programa baianol# termina com "${fechamento.palavra}" (entendeu?)`, ultimo);
  }
  for (let k = 1; k < sig.length - 1; k++) {
    const t = sig[k];
    if ((t.valor === abertura.palavra || t.valor === fechamento.palavra) && t.contexto === 'normal') {
      throw erroNoToken(`"${t.valor}" só pode abrir/fechar o programa, não no meio dele`, t);
    }
  }
  return new Set([sig[0], ultimo]);
}

module.exports = { localizarEnvelope };
