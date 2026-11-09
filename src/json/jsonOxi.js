'use strict';
const { tokenizar } = require('../lexer/lexer');
const { anotarContexto, significativos } = require('../lexer/contexto');
const { TIPOS } = require('../lexer/tiposToken');
const { LITERAIS_JSON } = require('../dialect/lexemas');
const { ErroBaianol, erroNoToken } = require('../utils/erros');

/** Um arquivo é JSON quando o primeiro símbolo abre objeto ou lista ("{" ou "["). */
function ehSubdialetoJSON(fonte) {
  const sig = significativos(tokenizar(fonte));
  return sig.length > 0 && ['{', '['].includes(sig[0].valor);
}

function traduzirToken(t) {
  switch (t.tipo) {
    case TIPOS.COMENTARIO: return '';
    case TIPOS.TEXTO:
      return t.valor[0] === "'" ? JSON.stringify(t.valor.slice(1, -1).replace(/\\'/g, "'")) : t.valor;
    case TIPOS.PALAVRA:
      if (t.contexto === 'chave') return JSON.stringify(t.valor);
      if (LITERAIS_JSON[t.valor]) return LITERAIS_JSON[t.valor];
      throw erroNoToken(`"${t.valor}" não existe no JSON baianol# (use massa, aonde ou vazio)`, t);
    case TIPOS.TEMPLATE:
      throw erroNoToken('JSON não aceita template com crase', t);
    default: return t.valor;
  }
}

/** Subdialeto JSON: chaves sem aspas, aspas simples, comentários e os literais massa/aonde/vazio. */
function transpilarJSON(fonte) {
  const tokens = anotarContexto(tokenizar(fonte));
  const saida = tokens.map(traduzirToken).join('');
  try {
    return JSON.stringify(JSON.parse(saida), null, 2) + '\n';
  } catch (e) {
    throw new ErroBaianol(`JSON baianol# inválido: ${e.message}`);
  }
}

module.exports = { ehSubdialetoJSON, transpilarJSON };
