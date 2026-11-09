'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { transpilar, compilar } = require('../src/transpilador');
const { ErroBaianol } = require('../src/utils/erros');
const { lerArquivoOxi } = require('../src/utils/arquivos');

let passou = 0;
function teste(nome, fn) {
  try { fn(); passou++; console.log(`  ok  ${nome}`); }
  catch (e) { console.error(`  ERRO ${nome}\n       ${e.message}`); process.exitCode = 1; }
}
const prog = (corpo) => `colé\n${corpo}\ntá_ligado`;
const gera = (corpo) => transpilar(prog(corpo));
const rejeita = (fonte, trecho) =>
  assert.throws(() => transpilar(fonte), (e) => e instanceof ErroBaianol && e.message.includes(trecho), `esperava erro com "${trecho}"`);
const rejeitaCorpo = (corpo, trecho) => rejeita(prog(corpo), trecho);

console.log('== Transpilação (símbolos ( ) { } [ ] e sem ;) ==');
teste('quebra de linha termina o comando', () => {
  const js = gera('por_vida x = massa\ndeixe y = vazio');
  assert.ok(js.includes('const x = true;') && js.includes('let y = null;'));
});
teste('if/else com parênteses', () => {
  const js = gera('possa_ser (1 mermo 1) {\n  trocar_ideias(1)\n} lá_ele {\n  trocar_ideias(2)\n}');
  assert.ok(js.includes('if (1 === 1) {') && js.includes('} else {') && js.includes('console.log(1);'));
});
teste('condição sem parênteses também vale', () => assert.ok(gera('possa_ser 1 mermo 1 { }').includes('if (1 === 1) {')));
teste('não duplica parênteses', () => assert.ok(gera('possa_ser (massa) { }').includes('if (true) {')));
teste('parênteses parciais ganham parênteses externos', () => assert.ok(gera('possa_ser (1 < 2) mais (2 < 3) { }').includes('if ((1 < 2) && (2 < 3)) {')));
teste('enquanto', () => assert.ok(gera('corropio (massa) { borimbora }').includes('while (true) {')));
teste('paletada de lista (for-of)', () => assert.ok(gera('paletada x de [1, 2] { }').includes('for (const x of [1, 2]) {')));
teste('paletada de intervalo', () => assert.ok(gera('paletada i de 1 daqui_pra 5 { }').includes('for (let i = 1; i <= 5; i++) {')));
teste('função com parênteses', () => {
  const js = gera('armengue soma(a, b) {\n  resultado a + b\n}');
  assert.ok(js.includes('function soma(a, b) {') && js.includes('return a + b;'));
});
teste('função sem parênteses nos parâmetros', () => {
  const js = gera('armengue soma a, b {\n  resultado a\n}\narmengue ola { }');
  assert.ok(js.includes('function soma(a, b) {') && js.includes('function ola() {'));
});
teste('oxente com e sem parênteses', () => {
  assert.ok(gera('dar_testa { } oxente (e) { }').includes('catch (e) {'));
  assert.ok(gera('dar_testa { } oxente e { }').includes('catch (e) {'));
  assert.ok(gera('dar_testa { } oxente { }').includes('catch {'));
});
teste('listas, índices, chamadas e seta', () => {
  const js = gera('por_vida l = [1, 2]\ntrocar_ideias(l[0])\npor_vida f = (a, b) => a + b\npor_vida g = x => x * 2');
  assert.ok(js.includes('const l = [1, 2];') && js.includes('console.log(l[0]);') && js.includes('const f = (a, b) => a + b;') && js.includes('const g = x => x * 2;'));
});
teste('operadores em palavra', () => {
  const js = gera('por_vida a = massa mais aonde ou num massa\npor_vida t = tipo_de a');
  assert.ok(js.includes('true && false || !true') && js.includes('typeof a'));
});
teste('quebra de linha livre dentro de ( ) [ ] { }', () => {
  const js = gera('trocar_ideias(\n  1,\n  2\n)\npor_vida o = {\n  a: 1,\n  b: [\n    2,\n    3\n  ]\n}');
  assert.ok(js.includes('const o = {') && js.includes('console.log('));
  new vm.Script(`(function(){${js}\n})`);
});
teste('propriedade e chave não são traduzidas', () => {
  const js = gera('por_vida o = { massa: 1 }\ntrocar_ideias(o.massa)');
  assert.ok(js.includes('{ massa: 1 }') && js.includes('o.massa'));
});
teste('lexemas dentro de texto ficam intactos', () => assert.ok(gera('trocar_ideias("possa_ser massa")').includes('"possa_ser massa"')));

console.log('== Erros: envelope, extensão e JavaScript ==');
teste('só aceita extensão .oxe', () => assert.throws(() => lerArquivoOxi('x.oxi'), (e) => e instanceof ErroBaianol && e.message.includes('.oxe')));
teste('exige colé / tá_ligado', () => {
  rejeita('por_vida x = 1', 'começa com "colé"');
  rejeita('colé\npor_vida x = 1', 'termina com "tá_ligado"');
});
teste('rejeita palavras do JS', () => { rejeitaCorpo('const x = 1', 'use "por_vida"'); rejeitaCorpo('if (x) { }', 'use "possa_ser"'); });
teste('rejeita ;', () => rejeitaCorpo('deixe x = 1;', 'não existe ";"'));
teste('rejeita === && || !', () => {
  rejeitaCorpo('deixe a = 1 === 1', 'use "mermo"');
  rejeitaCorpo('deixe a = massa && aonde', 'use "mais"');
  rejeitaCorpo('deixe a = massa || aonde', 'use "ou"');
  rejeitaCorpo('deixe a = !massa', 'use "num"');
});
teste('caractere inexistente', () => rejeitaCorpo('deixe a = 1 @ 2', 'não existe no baianol#'));

console.log('== Erros: sintaxe ==');
teste('dois comandos na mesma linha', () => rejeitaCorpo('deixe x = 1 deixe y = 2', 'Dois comandos na mesma linha'));
teste('por_vida sem valor', () => rejeitaCorpo('por_vida x', 'precisa de valor inicial'));
teste('valor faltando depois do =', () => rejeitaCorpo('deixe x =\n', 'Esperava uma expressão'));
teste('operador sem operando', () => rejeitaCorpo('deixe x = 1 +\n', 'Esperava uma expressão'));
teste('nome reservado como variável', () => rejeitaCorpo('deixe massa = 1', 'palavra reservada'));
teste('chave aberta', () => rejeita('colé\narmengue f() {\ntá_ligado', 'nunca fechado'));
teste('} sobrando', () => rejeitaCorpo('}', 'sobrando'));
teste(') sobrando', () => rejeitaCorpo(')', 'sobrando'));
teste('parêntese aberto', () => rejeitaCorpo('trocar_ideias(1, 2', 'nunca fechado'));
teste('colchete aberto', () => rejeitaCorpo('deixe l = [1, 2', 'nunca fechado'));
teste('possa_ser sem condição', () => rejeitaCorpo('possa_ser { }', 'precisa de uma condição'));
teste('lá_ele solto', () => rejeitaCorpo('lá_ele { }', 'sem "possa_ser"'));
teste('dar_testa sem oxente/morreu_aí', () => rejeitaCorpo('dar_testa { }', 'precisa de um "oxente"'));
teste('borimbora/siga_certo fora de laço', () => { rejeitaCorpo('borimbora', 'dentro de um laço'); rejeitaCorpo('siga_certo', 'dentro de um laço'); });
teste('resultado fora de função', () => rejeitaCorpo('resultado 1', 'dentro de uma armengue'));
teste('atribuição em valor', () => rejeitaCorpo('1 = 2', 'lado esquerdo'));
teste('falta vírgula entre argumentos', () => rejeitaCorpo('trocar_ideias(1 2)', '"," ou ")"'));
teste('daqui_pra solto', () => rejeitaCorpo('deixe x = 1 daqui_pra 2', 'daqui_pra'));
teste('intervalo não declara variável', () => rejeitaCorpo('paletada deixe i de 1 daqui_pra 3 { }', 'não se declara'));
teste('erro traz linha e coluna', () => {
  try { gera('por_vida ok = 1\npor_vida x'); assert.fail('deveria falhar'); }
  catch (e) { assert.ok(e instanceof ErroBaianol && e.linha === 3 && e.coluna > 0); }
});
teste('formatar mostra o trecho com ^', () => {
  const fonte = prog('por_vida x');
  try { transpilar(fonte); } catch (e) { const txt = e.formatar('a.oxe', fonte); assert.ok(txt.includes('por_vida x') && txt.includes('^')); }
});

console.log('== JSON ==');
teste('subdialeto JSON', () => {
  const r = compilar("{ a: massa, 'b': [1, vazio], c: aonde } // fim");
  assert.deepStrictEqual(JSON.parse(r.codigo), { a: true, b: [1, null], c: false });
});
teste('JSON puro continua valendo', () => assert.deepStrictEqual(JSON.parse(compilar('{"x": [1, 2]}').codigo), { x: [1, 2] }));
teste('JSON inválido', () => assert.throws(() => compilar('{ a: ola }'), ErroBaianol));

teste('exemplos transpilam e o JS gerado é válido', () => {
  const dir = path.join(__dirname, '..', 'exemplos');
  const arqs = fs.readdirSync(dir).filter((n) => n.endsWith('.oxe'));
  assert.ok(arqs.length >= 4);
  for (const f of arqs) {
    const r = compilar(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (r.tipo === 'js') new vm.Script(`(function(){${r.codigo}\n})`); else JSON.parse(r.codigo);
  }
});
teste('exemplos de erro realmente dão erro', () => {
  const dir = path.join(__dirname, '..', 'exemplos', 'erros');
  for (const f of fs.readdirSync(dir)) assert.throws(() => compilar(fs.readFileSync(path.join(dir, f), 'utf8')), ErroBaianol, f);
});
console.log(`\n${passou} testes passaram.`);
