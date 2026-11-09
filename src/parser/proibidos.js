'use strict';
const { LEXEMAS } = require('../dialect/lexemas');
const { erroNoToken } = require('../utils/erros');

// Palavras e símbolos do JavaScript que NÃO valem em baianol# (cada um tem lexema próprio).
const PALAVRAS_JS = { var: 'deixe', console: 'trocar_ideias' };
const SIMBOLOS_JS = {};
for (const [baianol, def] of Object.entries(LEXEMAS)) {
  if (/^[a-z]+$/.test(def.js) && def.js !== 'constructor') PALAVRAS_JS[def.js] = baianol;
  else if (/^[^\w\s.]+$/.test(def.js)) SIMBOLOS_JS[def.js] = baianol;
}

function validarProibidos(sig) {
  for (const t of sig) {
    if (t.tipo === 'PALAVRA' && t.contexto === 'normal' && PALAVRAS_JS[t.valor]) {
      throw erroNoToken(`"${t.valor}" é JavaScript! Aqui é baianol#, use "${PALAVRAS_JS[t.valor]}"`, t);
    }
    if (t.tipo === 'PONTUACAO' && t.valor === ';') {
      throw erroNoToken('Em baianol# não existe ";": o comando termina na quebra de linha', t);
    }
    if ((t.tipo === 'PONTUACAO' || t.tipo === 'OPERADOR') && SIMBOLOS_JS[t.valor]) {
      throw erroNoToken(`"${t.valor}" é JavaScript! Aqui é baianol#, use "${SIMBOLOS_JS[t.valor]}"`, t);
    }
  }
}

module.exports = { validarProibidos };
