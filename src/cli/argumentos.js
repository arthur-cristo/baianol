'use strict';

const COMANDOS = ['transpilar', 'executar', 'json', 'tokens', 'lexemas', 'gramatica', 'ajuda'];

function lerArgumentos(argv) {
  const args = { comando: null, arquivo: null, saida: null, markdown: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--saida') args.saida = argv[++i];
    else if (a === '--md') args.markdown = true;
    else if (a === '-h' || a === '--ajuda') args.comando = 'ajuda';
    else if (!args.comando && COMANDOS.includes(a)) args.comando = a;
    else if (!args.arquivo) args.arquivo = a;
  }
  if (!args.comando) args.comando = args.arquivo ? 'executar' : 'ajuda';
  return args;
}

module.exports = { lerArgumentos };
