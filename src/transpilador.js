'use strict';
const { ErroBaianol } = require('./utils/erros');
const { tokenizar } = require('./lexer/lexer');
const { anotarContexto } = require('./lexer/contexto');
const { validar } = require('./parser/validador');
const { gerar } = require('./generator/gerador');
const { ehSubdialetoJSON, transpilarJSON } = require('./json/jsonOxi');

/** baianol# -> JavaScript: léxico -> contexto -> validação (parser) -> geração -> conferência. */
function transpilar(fonte) {
  const tokens = anotarContexto(tokenizar(fonte));
  const envelope = validar(tokens);
  return conferirJs(gerar(tokens, envelope));
}

/** Rede de segurança: o JS gerado precisa compilar no Node, senão é erro do baianol#. */
function conferirJs(js) {
  try {
    new Function(js);   // só compila, não roda
  } catch (e) {
    throw new ErroBaianol(`O comando não faz sentido em baianol# (o JS gerado não compila: ${e.message})`);
  }
  return js;
}

/** Escolhe o dialeto: programa (.js) ou subdialeto JSON (.json). */
function compilar(fonte, forcarJson = false) {
  if (forcarJson || ehSubdialetoJSON(fonte)) return { tipo: 'json', extensao: '.json', codigo: transpilarJSON(fonte) };
  return { tipo: 'js', extensao: '.js', codigo: transpilar(fonte) };
}

module.exports = { transpilar, compilar };
