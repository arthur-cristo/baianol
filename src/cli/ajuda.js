'use strict';

const AJUDA = `
baianol# – transpilador .oxe -> JavaScript (Node.js)

Uso:
  node src/main.js <arquivo.oxe>                  executa o programa
  node src/main.js executar   <arquivo.oxe>       executa o programa
  node src/main.js transpilar <arquivo.oxe> [-o saida]   gera o .js (ou .json)
  node src/main.js json       <arquivo.oxe>       força o subdialeto JSON e imprime
  node src/main.js tokens     <arquivo.oxe>       mostra os tokens (análise léxica)
  node src/main.js lexemas [--md]                 lista os lexemas do dialeto
  node src/main.js gramatica                      mostra a gramática (EBNF)
  node src/main.js ajuda
`;

module.exports = { AJUDA };
