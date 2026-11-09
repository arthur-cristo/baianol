'use strict';
const { LEXEMAS } = require('../dialect/lexemas');
const { erroNoToken } = require('../utils/erros');
const { ehNome } = require('./expressoes');
const { definirJs, anexar } = require('./marcas');

/** Instala em P as regras de comando (declarações, controle de fluxo, classes, erros). */
function instalarComandos(P) {
  const c = P.c;

  P.emFuncao = (corpo) => {
    const antes = P.estado.laco;
    P.estado.laco = 0; P.estado.funcao++;
    try { corpo(); } finally { P.estado.funcao--; P.estado.laco = antes; }
  };
  const emLaco = (corpo) => { P.estado.laco++; try { corpo(); } finally { P.estado.laco--; } };

  /** Comando simples termina na quebra de linha (ou antes de "}", ou no fim do arquivo). */
  const fimDoComando = () => {
    const t = c.atual;
    if (t && !t.quebraAntes && !c.ehLexema('}')) {
      throw erroNoToken(`Dois comandos na mesma linha: quebre a linha antes de "${t.valor}"`, t);
    }
    anexar(c.anterior, ';');
  };

  P.bloco = () => {
    const abre = c.exigir('{', '(abre o bloco)');
    P.agrupar(false, () => {
      while (!c.ehLexema('}')) {
        if (c.acabou()) throw erroNoToken('"{" foi aberto e nunca fechado (faltou "}")', abre);
        P.comando();
      }
    });
    c.avancar();
  };

  /** Condição com ou sem parênteses: "possa_ser (x) {" ou "possa_ser x {". O gerador completa o JS. */
  const condicao = (kw) => {
    if (c.acabou() || c.ehLexema('{')) throw erroNoToken(`"${kw.valor}" precisa de uma condição antes do "{"`, kw);
    const inicio = c.pos;
    P.expressao();
    const primeiro = c.tokens[inicio];
    const jaTemParenteses = primeiro.valor === '(' && primeiro.tipo === 'PONTUACAO' && P.fechamentoDe(inicio) === c.pos - 1;
    if (!jaTemParenteses) { definirJs(kw, `${LEXEMAS[kw.valor].js} (`); anexar(c.anterior, ')'); }
  };

  const declaradores = (exigeValor) => {
    do {
      const nome = P.nomeObrigatorio('o nome da variável');
      if (c.aceitar('=')) P.atribuicao();
      else if (exigeValor) throw erroNoToken(`"por_vida" precisa de valor inicial: por_vida ${nome.valor} = valor`, nome);
    } while (c.aceitar(','));
  };

  const declaracao = (t) => { c.avancar(); declaradores(t.valor === 'por_vida'); fimDoComando(); };

  const funcaoDeclarada = () => {
    c.avancar();
    P.nomeObrigatorio('o nome da função');
    P.parametros();
    P.emFuncao(() => P.bloco());
  };

  const classe = () => {
    c.avancar();
    P.nomeObrigatorio('o nome da classe');
    if (c.aceitar('primo_carnal')) {
      P.nomeObrigatorio('o nome da classe-mãe');
      while (c.aceitar('.')) c.avancar();
    }
    const abre = c.exigir('{', '(abre o corpo da classe)');
    P.agrupar(false, () => {
      while (!c.ehLexema('}')) {
        if (c.acabou()) throw erroNoToken('"{" da classe foi aberto e nunca fechado (faltou "}")', abre);
        if (!c.aceitar('construtor')) P.nomeObrigatorio('o nome de um método (ou "construtor")');
        P.parametros();
        P.emFuncao(() => P.bloco());
      }
    });
    c.avancar();
  };

  const condicional = () => {
    const kw = c.avancar(); condicao(kw); P.comando();
    if (c.aceitar('lá_ele')) P.comando();
  };

  const enquanto = () => { const kw = c.avancar(); condicao(kw); emLaco(() => P.comando()); };

  /**
   *  paletada p de lista { ... }            -> for (const p of lista)
   *  paletada i de 1 daqui_pra 10 { ... }   -> for (let i = 1; i <= 10; i++)
   */
  const repeticao = () => {
    const kw = c.avancar();
    const decl = (c.ehLexema('por_vida') || c.ehLexema('deixe')) ? c.avancar() : null;
    const nome = P.nomeObrigatorio('o nome da variável do paletada');
    const de = c.exigir('de', '(paletada nome de lista  ou  paletada nome de 1 daqui_pra 10)');
    P.expressao();
    const fimInicio = c.anterior;
    if (c.ehLexema('daqui_pra')) {
      if (decl) throw erroNoToken(`No paletada de intervalo não se declara a variável: paletada ${nome.valor} de 1 daqui_pra 10`, decl);
      const ate = c.avancar();
      definirJs(kw, 'for (let'); definirJs(de, '='); definirJs(ate, '');
      anexar(fimInicio, `; ${nome.valor} <=`);
      P.expressao();
      anexar(c.anterior, `; ${nome.valor}++)`);
    } else {
      definirJs(kw, decl ? 'for (' : 'for (const');
      anexar(fimInicio, ')');
    }
    emLaco(() => P.comando());
  };

  const tratamentoDeErro = (t) => {
    c.avancar(); P.bloco();
    let temResto = false;
    const oxente = c.aceitar('oxente');
    if (oxente) {
      temResto = true;
      if (c.aceitar('(')) { P.nomeObrigatorio('o nome do erro'); c.exigir(')', '(fecha o nome do erro)'); }
      else if (ehNome(c.atual) && c.ehLexema('{', 1)) {
        definirJs(oxente, 'catch (');
        anexar(c.avancar(), ')');
      }
      P.bloco();
    }
    if (c.aceitar('morreu_aí')) { temResto = true; P.bloco(); }
    if (!temResto) throw erroNoToken('"dar_testa" precisa de um "oxente" ou "morreu_aí" depois do bloco', t);
  };

  const soltos = {
    lá_ele: '"lá_ele" sem "possa_ser" antes dele',
    oxente: '"oxente" sem "dar_testa" antes dele',
    morreu_aí: '"morreu_aí" sem "dar_testa" antes dele',
    daqui_pra: '"daqui_pra" só vale no paletada de intervalo: paletada i de 1 daqui_pra 10',
    '}': '"}" sobrando: não tem nenhum "{" aberto',
    ')': '")" sobrando: não tem nenhum "(" aberto',
    ']': '"]" sobrando: não tem nenhum "[" aberto',
  };

  P.comando = () => {
    if (c.acabou()) c.erroEsperava('um comando');
    const t = c.atual;
    const chave = (t.tipo === 'PALAVRA' && t.contexto === 'normal') || t.tipo === 'PONTUACAO' ? t.valor : null;
    if (chave && soltos[chave]) throw erroNoToken(soltos[chave], t);
    switch (chave) {
      case 'deixe': case 'por_vida': return declaracao(t);
      case 'armengue': if (ehNome(c.olhar(1))) return funcaoDeclarada(); break;
      case 'catiguria': return classe();
      case 'possa_ser': return condicional();
      case 'corropio': return enquanto();
      case 'paletada': return repeticao();
      case 'dar_testa': return tratamentoDeErro(t);
      case '{': return P.bloco();
      case 'borimbora': case 'siga_certo':
        if (P.estado.laco === 0) throw erroNoToken(`"${t.valor}" só pode ser usado dentro de um laço (corropio / paletada)`, t);
        c.avancar(); return fimDoComando();
      case 'resultado':
        if (P.estado.funcao === 0) throw erroNoToken('"resultado" só pode ser usado dentro de uma armengue', t);
        c.avancar();
        if (!c.acabou() && !c.atual.quebraAntes && !c.ehLexema('}')) P.expressao();
        return fimDoComando();
      case 'chiar': c.avancar(); P.expressao(); return fimDoComando();
      default: break;
    }
    P.expressao();
    return fimDoComando();
  };

  P.programa = () => { while (!c.acabou()) P.comando(); };
}

module.exports = { instalarComandos };
