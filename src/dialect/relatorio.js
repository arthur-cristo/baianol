'use strict';
const { LEXEMAS, ENVELOPE } = require('./lexemas');

/** Gera a tabela de lexemas (texto simples ou Markdown, pronta para o relatório). */
function tabelaLexemas(markdown = false) {
  const linhas = [
    ...Object.entries(LEXEMAS).map(([b, d]) => [b, d.js, d.categoria, d.origem, d.dicionario]),
    [ENVELOPE.abertura.palavra, '(abre o programa)', 'Envelope', 'dicionário', ENVELOPE.abertura.dicionario],
    [ENVELOPE.fechamento.palavra, '(fecha o programa)', 'Envelope', 'dicionário', ENVELOPE.fechamento.dicionario],
  ];
  if (markdown) {
    const corpo = linhas.map((l) => `| \`${l[0]}\` | \`${l[1]}\` | ${l[2]} | ${l[3]} | ${l[4]} |`);
    return ['| baianol# | JavaScript | Categoria | Origem | Significado |', '|---|---|---|---|---|', ...corpo].join('\n');
  }
  return linhas.map((l) => `${l[0].padEnd(15)} -> ${l[1].padEnd(16)} [${l[2]}/${l[3]}] ${l[4]}`).join('\n');
}

module.exports = { tabelaLexemas };
