# baianol# → JavaScript

Transpilador da linguagem **baianol#** (arquivos **`.oxe`**) para JavaScript/Node.js.
Lexemas do [Dicionário Baianês](https://acarajeedeliciasdabahia.com.br/dicionario-baianes/): cada comando usa uma palavra
com **significado parecido**; quando o dicionário não tem nada parecido, é só a **tradução** do comando.

## Uso
```bash
node src/main.js exemplos/01_ola_bahia.oxe               # executa
node src/main.js transpilar exemplos/03_conta_bancaria.oxe -o saida.js
node src/main.js json exemplos/04_cardapio.oxe           # subdialeto JSON
node src/main.js tokens <arq.oxe>                        # análise léxica
node src/main.js lexemas --md                            # tabela p/ o relatório
node src/main.js gramatica                               # gramática EBNF
npm test
```

## A linguagem
Usa `( ) { } [ ]` como o JavaScript, mas **sem `;`**: o comando termina na quebra de linha.

```
colé

por_vida cidade = "Salvador"
deixe visitantes = 3

armengue saudar(nome) {
  resultado "Colé, " + nome
}

paletada i de 1 daqui_pra visitantes {
  possa_ser (i mermo 2) {
    trocar_ideias(saudar("olá"))
  } lá_ele {
    trocar_ideias("oi")
  }
}

tá_ligado
```

| Comando | JS | | Comando | JS |
|---|---|---|---|---|
| `por_vida` | const | | `possa_ser` / `lá_ele` | if / else |
| `deixe` | let | | `corropio` | while |
| `armengue` | function | | `paletada x de lista` | for...of |
| `catiguria` / `construtor` / `primo_carnal` | class / constructor / extends | | `paletada i de 1 daqui_pra 10` | for (let i = 1; i <= 10; i++) |
| `resultado` | return | | `borimbora` / `siga_certo` | break / continue |
| `dar_testa` / `oxente` / `morreu_aí` / `chiar` | try / catch / finally / throw | | `trocar_ideias` | console.log |
| `massa` / `aonde` / `vazio` | true / false / null | | `enrolar` / `desapartar` | JSON.stringify / JSON.parse |
| `criatura` / `na_casa` | new / this | | `tipo_de` / `instancia_de` | typeof / instanceof |
| `mermo` / `num_é` / `num` / `mais` / `ou` | === / !== / ! / && / \|\| | | | |

Os parênteses de condições (`possa_ser`, `corropio`), de parâmetros (`armengue soma a, b {`) e do `oxente` são **opcionais**.
Tabela completa, com a origem de cada palavra: `node src/main.js lexemas --md`.

## Erros
O parser (descida recursiva) para no primeiro erro e mostra arquivo, linha, coluna e o trecho:
```
Ôxe! [erro5.oxe:3:12] Em baianol# não existe ";": o comando termina na quebra de linha
   3 | deixe x = 1;
     |            ^
```
Detecta: dois comandos na mesma linha, `{ ( [` aberto e nunca fechado, `} ) ]` sobrando, `por_vida` sem valor,
palavra reservada usada como nome, `lá_ele`/`oxente` soltos, `dar_testa` sem `oxente`/`morreu_aí`, `borimbora`/`siga_certo`
fora de laço, `resultado` fora de função, atribuição em valor, operando ou vírgula faltando, `;`, `===`, `&&`, `||`, `!`
e palavras do JavaScript (`if`, `const`, `console`...), caracteres inexistentes, extensão diferente de `.oxe` e
`colé`/`tá_ligado` ausentes. O JS gerado ainda é compilado pelo Node como rede de segurança.

## Arquitetura
| Etapa | Arquivo |
|---|---|
| CLI | `src/main.js`, `src/cli/*` |
| Léxico | `src/lexer/*` |
| Lexemas / gramática | `src/dialect/*` |
| Parser | `src/parser/*` (envelope, proibidos, cursor, expressões, comandos, marcas) |
| Geração | `src/generator/gerador.js` |
| JSON | `src/json/jsonOxi.js` |
| Execução | `src/runtime/executor.js` |
| Pipeline | `src/transpilador.js` |

## Subdialeto JSON
Um `.oxe` que começa com `{` ou `[` é JSON: chaves sem aspas, aspas simples, comentários e `massa`/`aonde`/`vazio`.

## Limitações
Regex literal e código dentro de `${}` em templates não são traduzidos; sem destructuring, `async/await`, `switch`;
o `paletada` de intervalo só conta de 1 em 1 para cima. Não detecta variável não declarada nem reatribuição de `por_vida`.
