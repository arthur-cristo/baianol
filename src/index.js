'use strict';
const { compilar, transpilar } = require('./transpilador');
const { ErroBaianol } = require('./utils/erros');
const { tokenizar } = require('./lexer/lexer');
const { significativos } = require('./lexer/contexto');
const { LEXEMAS, ENVELOPE } = require('./dialect/lexemas');
const { GRAMATICA } = require('./dialect/gramatica');
const { tabelaLexemas } = require('./dialect/relatorio');
const { executarCapturando } = require('./runtime/capturar');

module.exports = {
  compilar, transpilar, ErroBaianol, tokenizar, significativos,
  LEXEMAS, ENVELOPE, GRAMATICA, tabelaLexemas, executarCapturando,
};