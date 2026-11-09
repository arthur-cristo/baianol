'use strict';
const { TIPOS } = require('../lexer/tiposToken');
const { LEXEMAS } = require('../dialect/lexemas');

const CABECALHO = '// Código JavaScript gerado pelo transpilador baianol# (.oxe -> .js)\n';
const ESPACADAS = new Set(['if', 'while', 'for', 'catch', 'function', 'return', 'throw', 'typeof', 'of', 'instanceof', 'new', 'else']);
const SO_ESPACO = /^[ \t]+$/;
const EM_BRANCO = /^\s*$/;

function aparar(partes) {
  while (partes.length && SO_ESPACO.test(partes[partes.length - 1])) partes.pop();
}

function ultimoTexto(partes) {
  for (let i = partes.length - 1; i >= 0; i--) if (!EM_BRANCO.test(partes[i])) return partes[i];
  return '';
}

function traduzir(t) {
  if (t.js !== undefined) return t.js;                       // marcado pelo parser
  if (t.tipo === TIPOS.PALAVRA && t.contexto === 'normal' && LEXEMAS[t.valor]) return LEXEMAS[t.valor].js;
  return t.valor;
}

/**
 * Geração de código: troca cada lexema baianol# pelo JavaScript equivalente, completa o que o
 * parser marcou (parênteses de condições, ";" no fim dos comandos, cabeçalho do for) e ajusta
 * os espaços em volta de ( ) [ ] para o JS sair com cara de JS.
 */
function gerar(tokens, envelope) {
  const partes = [];
  let pularEspaco = false;

  for (const t of tokens) {
    if (envelope.has(t)) continue;
    if (t.tipo === TIPOS.ESPACO) {
      const descartar = pularEspaco && !t.valor.includes('\n');
      pularEspaco = false;
      if (!descartar) partes.push(t.valor);
      continue;
    }
    pularEspaco = false;
    const js = traduzir(t);
    if (js === '') { aparar(partes); continue; }

    if (js === ')' || js === ']') aparar(partes);
    if (js === '(' || js === '[') {
      const ult = ultimoTexto(partes);
      if (/[\w$)\]]$/.test(ult) && !ESPACADAS.has(ult)) aparar(partes);
    }
    const texto = js + (t.depois || '');
    partes.push(texto);
    if (/[(\[!]$/.test(texto)) pularEspaco = true;
  }
  return (CABECALHO + partes.join('').replace(/^\s+/, '')).trimEnd() + '\n';
}

module.exports = { gerar };
