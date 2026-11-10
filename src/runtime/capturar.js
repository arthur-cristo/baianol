'use strict';
const fmt = (v) => {
  if (typeof v === 'string') return v;
  try { return v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v); }
  catch { return String(v); }
};

/** Roda o JS gerado e devolve o que o programa "imprimiu" (trocar_ideias). */
function executarCapturando(codigoJs) {
  const linhas = [];
  const falso = { log: (...args) => linhas.push(args.map(fmt).join(' ')) };
  new Function('console', codigoJs)(falso);
  return linhas;
}

module.exports = { executarCapturando };