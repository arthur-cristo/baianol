'use strict';

/**
 * Lexemas do baianol#.
 * origem: 'dicionário' = a palavra existe no Dicionário Baianês com significado parecido com o do comando
 *         'tradução'   = não há nada parecido no dicionário; é só a tradução do comando para o português.
 * Fonte: https://acarajeedeliciasdabahia.com.br/dicionario-baianes/
 */
const D = 'dicionário';
const T = 'tradução';

const LEXEMAS = {
  // ---- declarações
  por_vida:      { js: 'const',       categoria: 'Declaração', origem: D, dicionario: 'Por vida: direto, sempre, constantemente (valor que não muda)' },
  deixe:         { js: 'let',         categoria: 'Declaração', origem: T, dicionario: 'Tradução de "let" (deixe ser)' },
  armengue:      { js: 'function',    categoria: 'Declaração', origem: D, dicionario: 'Armengue: improviso, gambiarra (uma engenhoca que faz algo)' },
  catiguria:     { js: 'class',       categoria: 'Declaração', origem: D, dicionario: 'Catiguria: categoria' },
  construtor:    { js: 'constructor', categoria: 'Declaração', origem: T, dicionario: 'Tradução de "constructor"' },
  primo_carnal:  { js: 'extends',     categoria: 'Declaração', origem: D, dicionario: 'Primo carnal: primo irmão (parente, herda da família)' },
  // ---- controle de fluxo
  possa_ser:     { js: 'if',          categoria: 'Controle', origem: D, dicionario: 'Possa ser: pode ser (que...)' },
  lá_ele:        { js: 'else',        categoria: 'Controle', origem: D, dicionario: 'Lá ele: outra pessoa, não eu (o outro caso)' },
  corropio:      { js: 'while',       categoria: 'Controle', origem: D, dicionario: 'Corropio: rodopio (fica girando)' },
  paletada:      { js: 'for',         categoria: 'Controle', origem: D, dicionario: 'Paletada: caminhada longa (anda item por item)' },
  de:            { js: 'of',          categoria: 'Controle', origem: D, dicionario: 'De: "de fulano" = do fulano' },
  daqui_pra:     { js: '(intervalo)', categoria: 'Controle', origem: D, dicionario: 'Daqui pra: até (paletada i de 1 daqui_pra 10)' },
  borimbora:     { js: 'break',       categoria: 'Controle', origem: D, dicionario: 'Borimbora: vamos embora (sai do laço)' },
  siga_certo:    { js: 'continue',    categoria: 'Controle', origem: D, dicionario: 'Siga certo: vá em frente (próxima volta)' },
  resultado:     { js: 'return',      categoria: 'Controle', origem: D, dicionario: 'Resultado: aí então... conclusão' },
  // ---- erros
  dar_testa:     { js: 'try',         categoria: 'Erros', origem: D, dicionario: 'Dar testa: enfrentar, reagir à altura (encara o risco)' },
  oxente:        { js: 'catch',       categoria: 'Erros', origem: D, dicionario: 'Oxente: expressão de espanto, surpresa' },
  morreu_aí:     { js: 'finally',     categoria: 'Erros', origem: D, dicionario: 'Morreu aí: fim de papo (acontece no final)' },
  chiar:         { js: 'throw',       categoria: 'Erros', origem: D, dicionario: 'Chiar: reclamar' },
  // ---- valores
  massa:         { js: 'true',        categoria: 'Valor', origem: D, dicionario: 'Massa!: jóia, legal (positivo)' },
  aonde:         { js: 'false',       categoria: 'Valor', origem: D, dicionario: 'Aonde?!: de jeito nenhum (negativo)' },
  vazio:         { js: 'null',        categoria: 'Valor', origem: D, dicionario: 'Vazio: livre, disponível' },
  criatura:      { js: 'new',         categoria: 'Valor', origem: D, dicionario: 'Criatura: pessoa, alguém (cria um novo)' },
  na_casa:       { js: 'this',        categoria: 'Valor', origem: D, dicionario: 'Na casa: aqui no trabalho (aqui dentro)' },
  // ---- operadores em forma de palavra
  mermo:         { js: '===',         categoria: 'Operador', origem: D, dicionario: 'Colé de mermo: de verdade (igual mesmo)' },
  num_é:         { js: '!==',         categoria: 'Operador', origem: T, dicionario: 'Tradução de "não é" (falado: num é)' },
  num:           { js: '!',           categoria: 'Operador', origem: T, dicionario: 'Tradução de "não" (falado: num)' },
  mais:          { js: '&&',          categoria: 'Operador', origem: D, dicionario: 'Mais: com (junta as duas condições)' },
  ou:            { js: '||',          categoria: 'Operador', origem: T, dicionario: 'Tradução de "ou"' },
  tipo_de:       { js: 'typeof',      categoria: 'Operador', origem: T, dicionario: 'Tradução de "tipo de"' },
  instancia_de:  { js: 'instanceof',  categoria: 'Operador', origem: T, dicionario: 'Tradução de "instância de"' },
  // ---- entrada/saída e JSON
  trocar_ideias: { js: 'console.log',    categoria: 'E/S',  origem: D, dicionario: 'Trocar idéias: conversar (imprime na tela)' },
  enrolar:       { js: 'JSON.stringify', categoria: 'JSON', origem: D, dicionario: 'Enrolar: embrulhar (transforma em texto)' },
  desapartar:    { js: 'JSON.parse',     categoria: 'JSON', origem: D, dicionario: 'Desapartar: separar (desfaz o texto)' },
};

/** Palavras que envolvem todo programa (saudação e despedida). */
const ENVELOPE = {
  abertura:   { palavra: 'colé',      dicionario: 'Colé: e aí?, tudo bom?' },
  fechamento: { palavra: 'tá_ligado', dicionario: 'Tá ligado?: entendeu?; falou?' },
};

/** Literais aceitos no subdialeto JSON. */
const LITERAIS_JSON = { massa: 'true', aonde: 'false', vazio: 'null' };

module.exports = { LEXEMAS, ENVELOPE, LITERAIS_JSON };
