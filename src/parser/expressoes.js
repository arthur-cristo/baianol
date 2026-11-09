'use strict';
const { LEXEMAS } = require('../dialect/lexemas');
const { erroNoToken } = require('../utils/erros');
const { anexar } = require('./marcas');

const RESERVADAS = new Set([...Object.keys(LEXEMAS), 'colé', 'tá_ligado']);
const BUILTINS = new Set(['trocar_ideias', 'enrolar', 'desapartar']);
const BINARIOS = {
  '??': 1, ou: 2, mais: 3, '|': 4, '^': 5, '&': 6,
  '==': 7, '!=': 7, mermo: 7, num_é: 7,
  '<': 8, '>': 8, '<=': 8, '>=': 8, instancia_de: 8,
  '<<': 9, '>>': 9, '>>>': 9, '+': 10, '-': 10, '*': 11, '/': 11, '%': 11, '**': 12,
};
const ATRIBUICOES = new Set(['=', '+=', '-=', '*=', '/=', '%=', '**=', '&&=', '||=', '??=', '<<=', '>>=', '>>>=', '&=', '|=', '^=']);
const UNARIOS_SIMBOLO = new Set(['-', '+', '~', '++', '--']);
const UNARIOS_PALAVRA = new Set(['num', 'tipo_de']);

const ehPalavraNormal = (t) => !!t && t.tipo === 'PALAVRA' && t.contexto === 'normal';
const ehNome = (t) => !!t && t.tipo === 'PALAVRA' && (t.contexto !== 'normal' || !RESERVADAS.has(t.valor));

/** Instala em P as regras de expressão (precedência crescente até o primário). */
function instalarExpressoes(P) {
  const c = P.c;

  /** Dentro de ( ) [ ] e objetos { } a quebra de linha não termina o comando; em blocos termina. */
  P.agrupar = (valor, corpo) => {
    const antes = P.estado.agrupado;
    P.estado.agrupado = valor;
    try { return corpo(); } finally { P.estado.agrupado = antes; }
  };
  /** O comando/expressão pode continuar neste token? (não continua se começa em nova linha) */
  const continua = (t) => !!t && (P.estado.agrupado || !t.quebraAntes);

  P.nomeObrigatorio = (qual = 'um nome') => {
    const t = c.atual;
    if (ehNome(t)) return c.avancar();
    if (ehPalavraNormal(t) && RESERVADAS.has(t.valor)) {
      throw erroNoToken(`"${t.valor}" é palavra reservada do baianol#, escolha outro nome`, t);
    }
    return c.erroEsperava(qual);
  };

  const nomePropriedade = () => {
    const t = c.atual;
    if (t && t.tipo === 'PALAVRA') return c.avancar();
    return c.erroEsperava('o nome de uma propriedade depois do "."');
  };

  /** item { "," item } até o fechamento; avisa se faltar o fechamento. */
  function listaAte(abertura, fecha, item) {
    while (!c.ehLexema(fecha)) {
      if (c.acabou()) throw erroNoToken(`"${abertura.valor}" foi aberto e nunca fechado (faltou "${fecha}")`, abertura);
      item();
      if (c.aceitar(',')) continue;
      if (!c.ehLexema(fecha) && !c.acabou()) c.erroEsperava(`"," ou "${fecha}"`);
    }
    c.avancar();
  }

  /** Posição do ")" que fecha o "(" que está em tokens[inicio]. */
  function fechamentoDe(inicio) {
    let prof = 0;
    for (let j = inicio; j < c.tokens.length; j++) {
      const t = c.tokens[j];
      if (t.tipo !== 'PONTUACAO') continue;
      if (t.valor === '(') prof++;
      else if (t.valor === ')' && --prof === 0) return j;
    }
    return -1;
  }
  P.fechamentoDe = fechamentoDe;

  /**
   * Parâmetros de função/método. Duas formas:
   *   armengue soma(a, b) { ... }
   *   armengue soma a, b { ... }      (sem parênteses)
   */
  P.parametros = () => {
    const parametro = () => {
      c.aceitar('...');
      P.nomeObrigatorio('o nome de um parâmetro');
      if (c.aceitar('=')) P.atribuicao();
    };
    if (c.ehLexema('(')) {
      const abre = c.avancar();
      P.agrupar(true, () => listaAte(abre, ')', parametro));
      return;
    }
    const anterior = c.anterior;
    if (c.ehLexema('{')) { anexar(anterior, '()'); return; }
    anexar(anterior, '(');
    do parametro(); while (c.aceitar(','));
    anexar(c.anterior, ')');
    if (!c.ehLexema('{')) c.erroEsperava('"," ou "{" (abre o corpo da função)');
  };

  P.argumentos = () => {
    const abre = c.exigir('(', '(abre os argumentos)');
    P.agrupar(true, () => listaAte(abre, ')', () => { c.aceitar('...'); P.atribuicao(); }));
  };

  // ---------- setas (arrow functions) ----------
  function ehSeta() {
    if (ehNome(c.atual) && c.ehLexema('=>', 1)) return true;
    if (!c.ehLexema('(')) return false;
    const j = fechamentoDe(c.pos);
    const depois = c.tokens[j + 1];
    return j !== -1 && !!depois && depois.valor === '=>';
  }
  function seta() {
    if (ehNome(c.atual)) c.avancar(); else P.parametros();
    c.exigir('=>');
    if (c.ehLexema('{')) P.emFuncao(() => P.bloco());
    else P.atribuicao();
    return { tipo: 'funcao' };
  }

  // ---------- níveis de expressão ----------
  P.expressao = () => P.atribuicao();

  P.atribuicao = () => {
    if (ehSeta()) return seta();
    const esq = P.ternario();
    const t = c.atual;
    if (continua(t) && t.tipo === 'OPERADOR' && ATRIBUICOES.has(t.valor)) {
      if (esq.tipo !== 'nome' && esq.tipo !== 'membro') {
        throw erroNoToken(`Do lado esquerdo de "${t.valor}" tem que ter um nome ou uma propriedade`, t);
      }
      c.avancar();
      P.atribuicao();
      return { tipo: 'atribuicao' };
    }
    return esq;
  };

  P.ternario = () => {
    const cond = P.binario(1);
    if (!continua(c.atual) || !c.aceitar('?')) return cond;
    P.atribuicao();
    c.exigir(':', '(separa as duas opções do "?")');
    P.atribuicao();
    return { tipo: 'ternario' };
  };

  const precedencia = (t) => {
    if (!t || !(t.tipo === 'OPERADOR' || ehPalavraNormal(t))) return 0;
    return Object.prototype.hasOwnProperty.call(BINARIOS, t.valor) ? BINARIOS[t.valor] : 0;
  };

  P.binario = (minimo) => {
    let esq = P.unario();
    for (;;) {
      const op = c.atual;
      const prec = precedencia(op);
      if (!prec || prec < minimo || !continua(op)) return esq;
      c.avancar();
      P.binario(op.valor === '**' ? prec : prec + 1);
      esq = { tipo: 'binario' };
    }
  };

  P.unario = () => {
    const t = c.atual;
    const ehUnario = t && ((t.tipo === 'OPERADOR' && UNARIOS_SIMBOLO.has(t.valor)) || (ehPalavraNormal(t) && UNARIOS_PALAVRA.has(t.valor)));
    if (!ehUnario) return P.posfixo();
    c.avancar();
    P.unario();
    return { tipo: 'unario' };
  };

  P.posfixo = () => {
    const e = P.chamadaOuMembro();
    const t = c.atual;
    if (continua(t) && t.tipo === 'OPERADOR' && (t.valor === '++' || t.valor === '--')) {
      if (e.tipo !== 'nome' && e.tipo !== 'membro') throw erroNoToken(`"${t.valor}" só vale em nome ou propriedade`, t);
      c.avancar();
      return { tipo: 'posfixo' };
    }
    return e;
  };

  P.chamadaOuMembro = () => {
    let e = P.primario();
    for (;;) {
      if (c.ehLexema('.') || c.ehLexema('?.')) { c.avancar(); nomePropriedade(); e = { tipo: 'membro' }; }
      else if (continua(c.atual) && c.ehLexema('[')) {
        const abre = c.avancar();
        P.agrupar(true, () => {
          P.expressao();
          if (!c.aceitar(']')) {
            if (c.acabou()) throw erroNoToken('"[" foi aberto e nunca fechado (faltou "]")', abre);
            c.erroEsperava('"]" (fecha o acesso por índice)');
          }
        });
        e = { tipo: 'membro' };
      } else if (continua(c.atual) && c.ehLexema('(')) { P.argumentos(); e = { tipo: 'chamada' }; }
      else return e;
    }
  };

  // ---------- primários ----------
  const grupo = () => {
    const abre = c.avancar();
    P.agrupar(true, () => {
      P.expressao();
      if (!c.aceitar(')')) {
        if (c.acabou()) throw erroNoToken('"(" foi aberto e nunca fechado (faltou ")")', abre);
        c.erroEsperava('")" (fecha o parêntese)');
      }
    });
    return { tipo: 'grupo' };
  };

  const literalLista = () => {
    const abre = c.avancar();
    P.agrupar(true, () => listaAte(abre, ']', () => { c.aceitar('...'); P.atribuicao(); }));
    return { tipo: 'valor' };
  };

  const literalObjeto = () => {
    const abre = c.avancar();
    P.agrupar(true, () => listaAte(abre, '}', () => {
      if (c.aceitar('...')) { P.atribuicao(); return; }
      const chave = c.atual;
      if (c.acabou() || !['PALAVRA', 'TEXTO', 'NUMERO'].includes(chave.tipo)) c.erroEsperava('o nome de uma propriedade');
      c.avancar();
      if (c.aceitar(':')) P.atribuicao();
      else if (!ehNome(chave)) throw erroNoToken('Propriedade sem valor: escreva "nome: valor"', chave);
    }));
    return { tipo: 'valor' };
  };

  const criar = () => {
    const novo = c.avancar();
    if (!ehNome(c.atual)) throw erroNoToken('"criatura" precisa do nome da classe logo depois', c.atual || novo);
    c.avancar();
    while (c.aceitar('.')) nomePropriedade();
    if (continua(c.atual) && c.ehLexema('(')) P.argumentos();
    return { tipo: 'chamada' };
  };

  const funcaoExpressao = () => {
    c.avancar();
    if (ehNome(c.atual)) c.avancar();
    P.parametros();
    P.emFuncao(() => P.bloco());
    return { tipo: 'funcao' };
  };

  P.primario = () => {
    const t = c.atual;
    if (!t) return c.erroEsperava('uma expressão (valor ou nome)');
    if (['NUMERO', 'TEXTO', 'TEMPLATE'].includes(t.tipo)) { c.avancar(); return { tipo: 'valor' }; }
    if (t.tipo === 'PONTUACAO') {
      if (t.valor === '(') return grupo();
      if (t.valor === '[') return literalLista();
      if (t.valor === '{') return literalObjeto();
    }
    if (ehPalavraNormal(t)) {
      switch (t.valor) {
        case 'massa': case 'aonde': case 'vazio': case 'na_casa': c.avancar(); return { tipo: 'valor' };
        case 'criatura': return criar();
        case 'armengue': return funcaoExpressao();
        default:
          if (BUILTINS.has(t.valor)) { c.avancar(); return { tipo: 'nome' }; }
          if (RESERVADAS.has(t.valor)) return c.erroEsperava('uma expressão (valor ou nome)');
      }
    }
    if (ehNome(t)) { c.avancar(); return { tipo: 'nome' }; }
    return c.erroEsperava('uma expressão (valor ou nome)');
  };
}

module.exports = { instalarExpressoes, ehNome };
