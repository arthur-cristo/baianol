'use strict';
const { significativos } = require('../lexer/contexto');
const { localizarEnvelope } = require('./envelope');
const { validarProibidos } = require('./proibidos');
const { analisar } = require('./parser');

/** Validação completa do dialeto. Devolve os tokens do envelope (a serem descartados). */
function validar(tokens) {
  const sig = significativos(tokens);
  const envelope = localizarEnvelope(sig);
  validarProibidos(sig);
  analisar(sig.filter((t) => !envelope.has(t)));
  return envelope;
}

module.exports = { validar };
