'use strict';
const vm = require('vm');
const path = require('path');
const { createRequire } = require('module');

/** Executa o JavaScript gerado no próprio Node.js, como se fosse um módulo CommonJS. */
function executarJs(codigoJs, caminhoOrigem) {
  const arquivo = path.resolve(caminhoOrigem);
  const modulo = { exports: {} };
  const envolvido = vm.runInThisContext(
    `(function (require, module, exports, __filename, __dirname) {${codigoJs}\n})`,
    { filename: arquivo.replace(/\.oxe$/, '.js') }
  );
  envolvido(createRequire(arquivo), modulo, modulo.exports, arquivo, path.dirname(arquivo));
}

module.exports = { executarJs };
