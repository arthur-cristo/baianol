'use strict';
const fs = require('fs');
const path = require('path');
const { ErroBaianol } = require('./erros');

const EXTENSAO = '.oxe';

function lerArquivoOxi(caminho) {
  if (!caminho) throw new ErroBaianol('Cadê o arquivo, meu rei? Informe um arquivo .oxe');
  if (path.extname(caminho).toLowerCase() !== EXTENSAO) {
    throw new ErroBaianol(`Arquivo "${caminho}" não é baianol#: a extensão tem que ser ${EXTENSAO}`);
  }
  if (!fs.existsSync(caminho)) throw new ErroBaianol(`Arquivo "${caminho}" não foi encontrado`);
  return fs.readFileSync(caminho, 'utf8');
}

function escreverArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(path.resolve(caminho)), { recursive: true });
  fs.writeFileSync(caminho, conteudo, 'utf8');
}

function trocarExtensao(caminho, novaExtensao) {
  return caminho.slice(0, caminho.length - path.extname(caminho).length) + novaExtensao;
}

module.exports = { EXTENSAO, lerArquivoOxi, escreverArquivo, trocarExtensao };
