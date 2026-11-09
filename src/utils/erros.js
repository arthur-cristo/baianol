'use strict';

/** Erro com posição (linha/coluna) no fonte .oxe, com mensagem no dialeto. */
class ErroBaianol extends Error {
  constructor(mensagem, linha = null, coluna = null) {
    super(mensagem);
    this.name = 'ErroBaianol';
    this.linha = linha;
    this.coluna = coluna;
  }

  /** Mensagem pronta para o terminal, com o trecho do código e um ^ apontando o problema. */
  formatar(arquivo = '', fonte = '') {
    const local = this.linha ? `${arquivo}:${this.linha}:${this.coluna}` : arquivo;
    let texto = `Ôxe! ${local ? `[${local}] ` : ''}${this.message}`;
    const linhaFonte = this.linha && fonte ? fonte.split('\n')[this.linha - 1] : null;
    if (linhaFonte !== null && linhaFonte !== undefined) {
      const margem = String(this.linha).padStart(4);
      texto += `\n${margem} | ${linhaFonte}\n${' '.repeat(margem.length)} | ${' '.repeat(Math.max(this.coluna - 1, 0))}^`;
    }
    return texto;
  }
}

function erroNoToken(mensagem, token) {
  return new ErroBaianol(mensagem, token && token.linha, token && token.coluna);
}

module.exports = { ErroBaianol, erroNoToken };
