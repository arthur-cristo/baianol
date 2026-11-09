'use strict';
const { lerArquivoOxi, escreverArquivo, trocarExtensao } = require('../utils/arquivos');
const { ErroBaianol } = require('../utils/erros');
const { compilar } = require('../transpilador');
const { tokenizar } = require('../lexer/lexer');
const { significativos } = require('../lexer/contexto');
const { executarJs } = require('../runtime/executor');
const { tabelaLexemas } = require('../dialect/relatorio');
const { GRAMATICA } = require('../dialect/gramatica');
const { AJUDA } = require('./ajuda');

/** Lê o .oxe e guarda o fonte em args (para mostrar o trecho com erro depois). */
function carregar(args) {
  args.fonte = lerArquivoOxi(args.arquivo);
  return args.fonte;
}

const ACOES = {
  transpilar: (args) => {
    const { arquivo, saida } = args;
    const r = compilar(carregar(args));
    const destino = saida || trocarExtensao(arquivo, r.extensao);
    escreverArquivo(destino, r.codigo);
    console.log(`Massa! ${arquivo} -> ${destino}`);
  },
  executar: (args) => {
    const { arquivo } = args;
    const r = compilar(carregar(args));
    if (r.tipo === 'json') process.stdout.write(r.codigo);
    else executarJs(r.codigo, arquivo);
  },
  json: (args) => process.stdout.write(compilar(carregar(args), true).codigo),
  tokens: (args) => {
    significativos(tokenizar(carregar(args))).forEach((t) =>
      console.log(`${String(t.linha).padStart(3)}:${String(t.coluna).padEnd(3)} ${t.tipo.padEnd(10)} ${t.valor}`));
  },
  lexemas: ({ markdown }) => console.log(tabelaLexemas(markdown)),
  gramatica: () => console.log(GRAMATICA),
  ajuda: () => console.log(AJUDA),
};

function executarComando(args) {
  try {
    ACOES[args.comando](args);
  } catch (e) {
    if (!(e instanceof ErroBaianol)) throw e;
    console.error(e.formatar(args.arquivo || '', args.fonte || ''));
    process.exitCode = 1;
  }
}

module.exports = { executarComando };
